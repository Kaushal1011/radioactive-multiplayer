"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RoomForm() {
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [track, setTrack]   = useState("monza");
  const [laps,  setLaps]    = useState(30);
  const [pending, start]    = useTransition();
  const router              = useRouter();

  const API = 'http://localhost:8787' ;

  /* ---------------- create ---------------- */
  const createRoom = () =>
    start(async () => {
      try {
        const res = await fetch(`${API}/api/room`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: roomName, track, laps })
        });
        if (!res.ok) throw new Error(await res.text());
        const { roomId } = await res.json();
        // wait a bit for the room to be created
        await new Promise(resolve => setTimeout(resolve, 2000));
        router.push(`/game/${roomId}`);      // go to the room!
      } catch (e) {
        console.error("create failed:", e);
        alert("Could not create room check console");
      }
    });

  /* ---------------- join ------------------ */
  const joinRoom = () => {
    if (roomCode.trim().length === 0) return;
    router.push(`/game/${roomCode.trim()}`);
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* ---------- Create ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Create Room</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            placeholder="Room name"
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
          />

          <select
            className="rounded-md border bg-background p-2"
            value={track}
            onChange={e => setTrack(e.target.value)}
          >
            <option value="monza">Monza</option>
            <option value="monaco">Monaco</option>
            <option value="suzuka">Suzuka</option>
          </select>

          <Input
            type="number"
            min={1}
            value={laps}
            onChange={e => setLaps(parseInt(e.target.value))}
            placeholder="Number of laps"
          />

          <Button onClick={createRoom} disabled={pending}>
            {pending ? "Creating…" : "Create"}
          </Button>
        </CardContent>
      </Card>

      {/* ---------- Join ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Join Room</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            placeholder="Room code"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value)}
          />
          <Button variant="secondary" onClick={joinRoom}>
            Join
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
