"use client";
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {useAuth} from '@clerk/nextjs';
import { useEffect } from 'react';

export default function Home() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    // anytime sign in state changes, we can log it or perform other actions
    console.log('User signed in:', isSignedIn);
    if (isSignedIn) {
      const res = fetch('http://localhost:8787' + '/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      res.then(response => {
        console.log('User registered:', response);
      }).catch(error => {
        console.error('Error registering user:', error);
      }
      );
      
    }
  }, [isSignedIn]);

  return (
    <>
      <Navbar />
      <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black px-6">
        {/* hero graphic */}
        {/* <Image
          src="/f1_hero.png"
          alt="Formula 1 car on neon track"
          fill
          priority
          className="-z-10 object-cover opacity-80"
        /> */}

        {/* copy */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
            Own the <span className="text-red-600">strategy</span>, <br /> win the&nbsp;race.
          </h1>
          <p className="mt-6 text-lg text-zinc-300">
            Radioactive is a real-time multiplayer F1 manager. Draft tactics, deploy ERS boosts, and out-smart friends lap
            after lap.
          </p>
          { isSignedIn ? (
            <Link href="/dashboard">
              <Button size="lg" className="mt-8 bg-red-600 text-white hover:bg-red-500">
                Go to Dashboard&nbsp;<ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/sign-in">
              <Button size="lg" className="mt-8 bg-red-600 text-white hover:bg-red-500">
                Sign In&nbsp;<ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
