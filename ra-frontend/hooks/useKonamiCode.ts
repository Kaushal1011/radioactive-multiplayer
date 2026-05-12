'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Easter egg hook: detects the Konami Code sequence.
 * ↑ ↑ ↓ ↓ ← → ← → B A
 *
 * Returns `true` once the sequence is completed, resets after 3 seconds.
 */
const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

export function useKonamiCode(): boolean {
  const [activated, setActivated] = useState(false);
  const [index, setIndex] = useState(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const expected = KONAMI_SEQUENCE[index];
    if (e.code === expected) {
      const next = index + 1;
      if (next === KONAMI_SEQUENCE.length) {
        setActivated(true);
        setIndex(0);
        // auto-reset after 3 seconds
        setTimeout(() => setActivated(false), 3000);
      } else {
        setIndex(next);
      }
    } else {
      setIndex(0);
    }
  }, [index]);

  useEffect(() => {
