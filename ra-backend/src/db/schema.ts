import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),        // Clerk userId
	email: text('email').notNull(),
	createdAt: integer('created_at').notNull()
});

export const rooms = sqliteTable('rooms', {
	id: text('id').primaryKey(),        // DO id (stub.id.toString())
	track: text('track').notNull(),
	laps: integer('laps').notNull(),
	createdBy: text('created_by').notNull(),
	createdAt: integer('created_at').notNull()
});
