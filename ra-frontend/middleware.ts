// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
// middleware.ts
import { NextResponse } from 'next/server';
const isPublic = createRouteMatcher([
  '/',                 // landing
  '/howtoplay(.*)',    // tutorial is always public
  '/sign-in(.*)',      // Clerk auth UIs
  '/sign-up(.*)',
  '/please-sign',      // custom gate
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublic(req)) return;          // public route → no auth needed

  // console.log('Middleware: checking auth for', req.nextUrl.pathname);

  /* ---- protected routes ---- */
  const { userId } = await auth();

  if (!userId) {
    // console.log('Middleware: no userId found, redirecting to sign-in');
    // redirect guests to our fancy gate, preserving where they wanted to go
    const target = new URL('/please-sign', req.url);
    target.searchParams.set('redirect_to', req.nextUrl.pathname);
    // return Response.redirect(target, 307);
    return NextResponse.redirect(target, 307);

  }


});

export const config = {
  matcher: [
    '/((?!_next/.*|.*\\..*|api/.*).*)', // run only on “real” pages
  ],
};
