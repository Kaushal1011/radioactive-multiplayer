"use client";
import type { PlayerSnapshot } from "@/hooks/useRaceSocket";

export default function TelemetryBar({ car }: { car?: PlayerSnapshot | '' }) {
  return (
    <div className="flex items-center gap-6 bg-neutral-900 p-3 text-sm text-white/90">
      <div>
        Speed:{" "}
        <span className="font-semibold">
          {car ? `${Math.round(car.v * 3600/1000)} km/h` : "--"}
        </span>
      </div>
      <div>
        ERS:{" "}
        <span className="font-semibold">
          {car ? `${Math.round(car.ers)}%` : "--"}
        </span>
      </div>
      <div>
        Mode:{" "}
        <span className="font-semibold">
          {car ? car.mode : "--"}
        </span>
      </div>
      
    </div>
  );
}
