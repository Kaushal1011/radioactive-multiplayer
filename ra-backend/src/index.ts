/// <reference types="@cloudflare/workers-types" />
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { users, rooms } from './db/schema';
import { RoomDO } from './room';
import { nanoid } from 'nanoid';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { sql } from 'drizzle-orm';

import { cors } from 'hono/cors'



type Env = {
	RADIOACTIVE_DB: D1Database;
	RoomDO: DurableObjectNamespace;
	radioactive_namespace: KVNamespace;
};

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', cors({
	// origin: 'https://ra-frontend.pages.dev',          // must match EXACTLY
	origin: 'http://localhost:3000',
	credentials: true,                        // allow credentials
	allowHeaders: ['Authorization', 'Content-Type'],
	allowMethods: ['GET', 'POST', 'OPTIONS'],
}))

app.use('*', clerkMiddleware())



/* ---------- Clerk hook: store user in D1 ---------- */
app.post('/api/register', async (c) => {
	const authV = getAuth(c);
	const clerkClient = c.get('clerk')

	try {
		const user = await clerkClient.users.getUser(authV?.userId || '');

		if (!c.env.RADIOACTIVE_DB) {
			throw new Error("RADIOACTIVE_DB is not bound. Check wrangler.toml and environment.");
		}

		const db = drizzle(c.env.RADIOACTIVE_DB);

		const id = user.id; // Clerk user ID
		const email = user.primaryEmailAddress?.emailAddress || '';

		console.log('Registering user:', id, email);

		console.log(db);

		if (!email) {
			return c.json(
				{
					message: 'User must have a primary email address.',
				},
				400
			);
		}
		// Check if user already exists
		const existingUser = await db.select().from(users).all();
		console.log('Existing user:', existingUser);
		if (existingUser.some(u => u.id === id)) {
			return c.json(
				{
					message: 'User already exists.',
				},
				200
			);
		}


		const res = await db.insert(users).values({ id, email, createdAt: Date.now() }).run();
		console.log('Insert result:', res);
		return c.json({
			user,
		})

		// return c.json({
		// 	message: 'User registered successfully.',
		// 	user: {
		// 		id: user.id,
		// 		email: user.primaryEmailAddress?.emailAddress || '',
		// 	}
		// }, 200);


	} catch (e) {
		throw new Error(`Failed to register user: ${e}`);

	}

});

app.get('/api/track/:name', async c => {
	const { name } = c.req.param();
	console.log('Fetching track:', name);

	console.log('KV Namespace:', await c.env.radioactive_namespace.list());

	const csv = await c.env.radioactive_namespace.get(`${name}`);
	if (!csv) return c.json({ error: 'track not found' }, 404);

	const points = csv.split('\n').map(line => {
		const [x, y, wtr, wtl] = line.split(',').map(Number);
		return [x, y, wtr, wtl];
	});

	return c.json({ points }, 200);
});


/* ---------- room create ---------- */
app.post('/api/room', async (c) => {
	const authV = getAuth(c);
	const userId = authV?.userId;
	if (!userId) {
		return c.json({ message: 'Unauthorized' }, 401);
	}

	const { track = 'monza', laps = 5 } = await c.req.json();
	const roomId = nanoid(8);
	const stub = c.env.RoomDO.idFromName(roomId);
	const room = c.env.RoomDO.get(stub);
	// prime the DO with initial state

	const db = drizzle(c.env.RADIOACTIVE_DB);
	await db.insert(rooms).values({
		id: roomId,
		track,
		laps,
		createdBy: userId,
		createdAt: Date.now(),
	}).run();
	return c.json({ roomId });
});

app.get('/api/room/:id', async (c) => {
	const { id } = c.req.param();
	// get room details from D1
	const db = drizzle(c.env.RADIOACTIVE_DB);
	const room = await db.select().from(rooms).where(sql`${rooms.id} = ${id}`).get();
	if (!room) {
		return c.json({ error: 'Room not found' }, 404);
	}
	return c.json({
		id: room.id,
		track: room.track,
		laps: room.laps,
		createdBy: room.createdBy,
		createdAt: new Date(room.createdAt).toISOString(),
	});
});

/* ---------- websocket upgrade ---------- */
app.get('/api/room/:id/ws', async (c) => {
	const { id } = c.req.param();
	const stub = c.env.RoomDO.idFromName(id);
	const room = c.env.RoomDO.get(stub);
	return room.fetch(c.req.raw);     // delegate upgrade to DO
});

app.get('/', (c) => {
	return c.json({
		message: 'Welcome to the RA backend API',
		version: '1.0.0',
	});
});

export default app;
export { RoomDO };                  // let wrangler bundle both
