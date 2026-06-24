"use client";

import { useEffect } from "react";
import { useGame } from "@/lib/store";
import { GameHeartbeat } from "@/components/GameHeartbeat";

export function GameBoot() {
  const hydrate = useGame((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <GameHeartbeat />;
}