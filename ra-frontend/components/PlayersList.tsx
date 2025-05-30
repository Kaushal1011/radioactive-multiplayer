"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import clsx from "clsx";
import type { PlayerSnapshot } from "@/hooks/useRaceSocket";

export default function PlayersList({
  cars,
  meId,
}: {
  cars: Record<string, PlayerSnapshot>;
  meId?: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2 text-lg font-semibold">Drivers</CardHeader>
      <CardContent className="py-2">
        {Object.values(cars).length === 0 && (
          <p className="text-sm text-muted-foreground">Waiting…</p>
        )}
        {Object.entries(cars).map(([id, car]) => (
          <div key={id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                style={car.color ? { backgroundColor: car.color } : {}}
                className={clsx(
                  "h-3 w-3 rounded-full",
                  car.color ? "" : "bg-gray-500"
                )}
              ></span>
              <span className="text-sm font-medium">
                {meId === id ? "You" : `${id.slice(0, 2)}…${id.slice(-3)}`}
              </span>

            </div>
            <span className="text-xs text-muted-foreground">
              {car.v ? `${Math.round(car.v *3600/1000)} kmph` : "--"}
            </span>
            
          </div>
        ))}
        
      </CardContent>
    </Card>
  );
}
