"use client";

import { Canvas } from "@react-three/fiber";
import { GameScene } from "./Scene";

export default function PhysicsScene() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 400], fov: 75, near: 1, far: 10000 }}>
        <color attach="background" args={["#333"]} />
        <fog attach="fog" args={["#333", 500, 2000]} />
        <GameScene />
      </Canvas>
    </div>
  );
}
