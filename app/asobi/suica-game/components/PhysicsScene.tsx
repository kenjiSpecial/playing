"use client";

import { Canvas } from "@react-three/fiber";
import { GameScene } from "./Scene";
import { useState } from "react";

export default function PhysicsScene() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <div className="w-full h-full">
        <Canvas
          camera={{ position: [0, 0, 400], fov: 75, near: 1, far: 10000 }}
        >
          <color attach="background" args={["#333"]} />
          <fog attach="fog" args={["#333", 500, 2000]} />
          <GameScene setIsLoading={setIsLoading} />
        </Canvas>
      </div>
      <div
        className={`absolute top-0 left-0 w-full h-full items-center justify-center transition-opacity duration-300 ${
          // Start of Selection
          isLoading ? "flex" : "hidden"
        }`}
      >
        LOADING...
      </div>
    </>
  );
}
