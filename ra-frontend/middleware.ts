// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublic = createRouteMatcher([
  '/',                 // landing
  '/sign-in(.*)',      // auth UI
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublic(req)) return;     // allow without auth

  // Protect everything else
  const { userId } = await auth();
  if (!userId) {
    return Response.redirect(new URL('/sign-in', req.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next/.*|.*\\..*|api/.*).*)',  // skip static + API
  ],
};
