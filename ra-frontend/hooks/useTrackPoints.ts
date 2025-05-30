"use client";
import { useEffect, useState } from "react";

export function useTrackPoints(track: string) {
    const [pts, setPts] = useState<[number, number, number, number][]>([]);
    const [err, setErr] = useState<Error | null>(null);

    useEffect(() => {
        setPts([]);
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/track/${track}`)
            .then(r => r.json())
            .then(d => setPts(d.points))
            .catch(e => setErr(e));
    }, [track]);

    return { pts, err };
}
