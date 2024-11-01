"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  useAnimations,
} from "@react-three/drei";
import { useControls } from "leva";

function Model({ url }: { url: string }) {
  // const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, scene);
  console.log(names);
  // const actionRef = useRef<AnimationAction | null>(null);

  // Levaによるアニメーションコントロール
  useControls("Animation Control", {
    // timeline
    timeline: {
      value: 0,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => {
        names.forEach((name) => {
          const action = actions[name];
          if (action) {
            action.time = action.getClip().duration * value;
            // action.play();
          }
        });
      },
    },
  });

  useEffect(() => {
    // console.log(actionRef.current);
    // namesのすべてのアニメーションを再生し、pausedにする
    names.forEach((name) => {
      const action = actions[name];
      if (action) {
        action.reset().play();
        action.paused = true;
      }
    });
  }, []);

  return <primitive object={scene} />;
}

export function GlbLoader() {
  const [gameBodyUrl] = useState("/assets/3d/gameboy.glb");

  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        {/* <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={0.5}
          intensity={10}
        /> */}
        {/* <pointLight position={[-10, -10, -10]} intensity={10} /> */}

        <group>
          <Model url={gameBodyUrl} />
        </group>

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <Environment preset="apartment" background />
      </Canvas>
    </div>
  );
}
