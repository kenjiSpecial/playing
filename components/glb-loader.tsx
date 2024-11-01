"use client";

import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  useAnimations,
} from "@react-three/drei";
// import { Group } from "three";
import { button, useControls } from "leva";
import { AnimationAction, LoopOnce, LoopRepeat } from "three";

function Model({ url }: { url: string }) {
  // const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, scene);
  console.log(names);
  // const actionRef = useRef<AnimationAction | null>(null);
  const [isReversing, setIsReversing] = useState(false);
  const targetTime = 0.5; // 停止したい時間（秒）

  // Levaによるアニメーションコントロール
  const animationControls = useControls("Animation Control", {
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

    // Animation: {
    //   options: names.reduce((acc, name) => {
    //     acc[name] = name;
    //     return acc;
    //   }, {} as Record<string, string>),
    //   value: names[0],
    //   label: "Selected Animation",
    // },
    // PlaybackSpeed: {
    //   value: 1,
    //   min: 0.1,
    //   max: 3,
    //   step: 0.1,
    //   label: "Playback Speed",
    // },
    // LoopPlayback: {
    //   value: false,
    //   label: "Loop Playback",
    // },
    // /** 再生ボタン */
    // play: button(() => {
    //   const selectedAction = actions[animationControls.Animation];
    //   if (selectedAction) {
    //     selectedAction.reset().play();

    //     actionRef.current = selectedAction;
    //     setIsReversing(false);

    //     // selectedAction.reset();
    //     // selectedAction.timeScale = -1;
    //     // selectedAction.time = selectedAction.getClip().duration;
    //     // selectedAction.play();
    //   }
    // }),
  });

  useEffect(() => {
    // Stop all actions
    Object.values(actions).forEach((action) => {
      action?.stop();
    });

    // Play the selected animation
    const selectedAction = actions[animationControls.Animation];
    if (selectedAction) {
      selectedAction.setLoop(
        animationControls.LoopPlayback ? LoopRepeat : LoopOnce, // 2: Loop, 0: No Repeat
        Infinity
      );
      selectedAction.timeScale = animationControls.PlaybackSpeed;
      // selectedAction.reset().play();
      actionRef.current = selectedAction;
      setIsReversing(false);
    }
  }, [
    actions,
    animationControls.Animation,
    animationControls.PlaybackSpeed,
    animationControls.LoopPlayback,
  ]);

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

  useFrame(() => {
    // if (actionRef.current) {
    //   const currentTime = actionRef.current.time;
    //   console.log(currentTime);
    //   if (!isReversing && currentTime >= targetTime) {
    //     // ターゲット時間に達したら停止してリバース
    //     actionRef.current.fadeOut(0.1);
    //     actionRef.current.stopFading();
    //     // actionRef.current.timeScale = -1;
    //     // actionRef.current.play();
    //     setIsReversing(true);
    //   }
    //   // if (isReversing && currentTime <= 0) {
    //   //   // リバース再生が終了したら停止
    //   //   actionRef.current.stop();
    //   //   actionRef.current.timeScale = animationControls.PlaybackSpeed;
    //   //   setIsReversing(false);
    //   // }
    // }
  });

  return <primitive object={scene} />;
}

export function GlbLoader() {
  const [gameBodyUrl, setGameBodyUrl] = useState("/assets/3d/gameboy.glb");

  useEffect(() => {
    // モデルのURLを動的に設定することもできます
    // 例: setModelUrl('https://example.com/path/to/your/model.glb')
  }, []);

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
