"use client";

import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, useBox, useSphere } from "@react-three/cannon";
import { useGLTF } from "@react-three/drei";
import {
  Group,
  Material,
  Mesh,
  Object3D,
  Object3DEventMap,
  Vector3,
} from "three";
import gsap from "gsap";

function Ball({
  isBallRolling,
  isPreparingBowlingGame,
  initializeBowlingGame,
  clickBall,
}: {
  isBallRolling: boolean;
  isPreparingBowlingGame: boolean;
  initializeBowlingGame: boolean;
  clickBall: () => void;
}) {
  const [ref, api] = useSphere(
    () => ({
      args: [1],
      mass: 3,
      position: [0, 1, -15],
    }),

    useRef<Mesh>(null)
  );
  const { nodes, materials } = useGLTF("/assets/3d/BowlingBall.glb");
  const [curScale, setCurScale] = useState(1);
  const scaleValue = useRef(1);

  useEffect(() => {
    if (isBallRolling) {
      throwBall();
    }
  }, [isBallRolling]);

  function throwBall() {
    api.velocity.set(0, 0, 50);
  }

  const onClick = () => {
    clickBall();
  };

  useEffect(() => {
    if (initializeBowlingGame) {
      gsap.to(scaleValue, {
        duration: 0.8,
        current: 0.01,
        ease: "power4.inOut",
        onUpdate: () => {
          setCurScale(scaleValue.current);
        },
      });
    }
  }, [initializeBowlingGame]);

  useEffect(() => {
    if (isPreparingBowlingGame) {
      gsap.to(scaleValue, {
        duration: 0.8,
        current: 1,
        ease: "power4.inOut",
        onUpdate: () => {
          setCurScale(scaleValue.current);
        },
      });

      api.velocity.set(0, 2, 0);
      api.angularVelocity.set(0, 0, 0);
      api.position.set(0, 2, -15);
      api.rotation.set(0, 0, 0);
    }
  }, [isPreparingBowlingGame]);

  return (
    <mesh ref={ref} onClick={onClick}>
      {/* <primitive object={scene} receiveShadow castShadow /> */}
      <mesh
        scale={[curScale, curScale, curScale]}
        castShadow
        receiveShadow
        material={materials["Material.001"]}
        geometry={(nodes["Sphere"] as Mesh).geometry}
      />
      <mesh
        scale={[curScale, curScale, curScale]}
        castShadow
        receiveShadow
        material={materials["BallMat"]}
        geometry={(nodes["Sphere_1"] as Mesh).geometry}
      />
    </mesh>
  );
}

function BallRing({
  isBallRolling,
  isPreparingBowlingGame,
}: {
  isBallRolling: boolean;
  isPreparingBowlingGame: boolean;
}) {
  const ref = useRef<Mesh>(null);
  const [curScale, setCurScale] = useState(1);
  const scaleValue = useRef(1);

  const { nodes, materials } = useGLTF("/assets/3d/BowlingRing.glb");
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
    }
  });

  useEffect(() => {
    if (isBallRolling) {
      gsap.to(scaleValue, {
        duration: 0.6,
        current: 0.01,
        ease: "power4.out",
        onUpdate: () => {
          setCurScale(scaleValue.current);
        },
      });
    }
  }, [isBallRolling]);

  useEffect(() => {
    if (isPreparingBowlingGame) {
      gsap.to(scaleValue, {
        duration: 0.6,
        current: 1,
        ease: "power4.inOut",
        onUpdate: () => {
          setCurScale(scaleValue.current);
        },
      });
    }
  }, [isPreparingBowlingGame]);

  return (
    <group>
      <mesh
        ref={ref}
        rotation={[0, 0.1, 0]}
        position={[0, 0.1, -15]}
        castShadow
        receiveShadow
        material={materials["RingMat"]}
        geometry={(nodes["Ring"] as Mesh).geometry}
        scale={[curScale, curScale, curScale]}
      />
    </group>
  );
}

function Pin({
  nodes,
  materials,
  position,
  initializeBowlingGame,
  checkIfFallenAfterThrow,
  isPreparingBowlingGame,
  index,
  pins,
  setPins,
}: {
  pinScene: Group;
  nodes: { [name: string]: Object3D<Object3DEventMap> };
  materials: { [name: string]: Material };
  position: [number, number, number];
  isFallen: boolean;
  checkIfFallenAfterThrow: boolean;
  initializeBowlingGame: boolean;
  isBallRolling: boolean;
  isPreparingBowlingGame: boolean;
  index: number;
  pins: IPinInfo[];
  setPins: Dispatch<SetStateAction<IPinInfo[]>>;
}) {
  const [ref, api] = useBox(
    () => ({
      mass: 0.1,
      position,
      args: [1.5, 4.8, 1.5],
    }),
    useRef<Group>(null)
  );
  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const positionRef = useRef<[number, number, number]>([0, 0, 0]);
  const thresholdAngle = Math.PI / 4;
  const [curScale, setCurScale] = useState(1);
  const scaleValue = useRef(1);

  useEffect(() => {
    if (initializeBowlingGame) {
      console.log("initializeBowlingGame");
      gsap.to(scaleValue, {
        duration: 0.8,
        current: 0.001,
        delay: index * 0.06,
        ease: "power4.inOut",
        onUpdate: () => {
          setCurScale(scaleValue.current);
        },
      });
    }
  }, [initializeBowlingGame]);

  // ピンを初期化
  useEffect(() => {
    if (isPreparingBowlingGame) {
      if (ref.current) {
      }

      gsap.to(scaleValue, {
        duration: 0.8,
        current: 1,
        delay: index * 0.06,
        ease: "power4.inOut",
        onStart: () => {
          if (ref.current) {
            api.position.set(
              ref.current.position.x,
              ref.current.position.y + 1.5,
              ref.current.position.z
            );
            api.rotation.set(
              ref.current.rotation.x,
              ref.current.rotation.y,
              ref.current.rotation.z
            );
            api.velocity.set(0, 1.5, 0);
            api.angularVelocity.set(0, 0, 0);
          }
        },
        onUpdate: () => {
          setCurScale(scaleValue.current);
        },
      });
    }
  }, [isPreparingBowlingGame]);

  useEffect(() => {
    if (checkIfFallenAfterThrow) {
      const pin = pins.find((pin) => pin.index === index);
      if (pin) {
        const distance = Math.sqrt(
          (positionRef.current[0] - position[0]) ** 2 +
            (positionRef.current[1] - position[1]) ** 2 +
            (positionRef.current[2] - position[2]) ** 2
        );

        // Check if the pin is tilted beyond a certain angle (e.g., 45 degrees)
        const isFallen =
          Math.abs(rotationRef.current[0]) > thresholdAngle ||
          Math.abs(rotationRef.current[2]) > thresholdAngle ||
          distance > 0.5;

        if (isFallen) {
          pin.isFallen = true;
        }
      }

      setPins([...pins]); // pins clone
    }
  }, [checkIfFallenAfterThrow, pins, setPins, index, position, thresholdAngle]);

  useEffect(() => {
    const unsubscribe = api.rotation.subscribe((rotation) => {
      rotationRef.current = [rotation[0], rotation[1], rotation[2]];
    });
    return () => unsubscribe();
  }, [api.rotation]);

  useEffect(() => {
    const unsubscribe = api.position.subscribe((position) => {
      positionRef.current = [position[0], position[1], position[2]];
    });
    return () => unsubscribe();
  }, [api.position]);

  return (
    <group ref={ref}>
      {/* <primitive object={scene} receiveShadow castShadow /> */}
      <mesh
        castShadow
        receiveShadow
        material={materials["PinBaseMaterial"]}
        geometry={(nodes["Cube"] as Mesh).geometry}
        scale={[curScale, curScale, curScale]}
      />
      <mesh
        castShadow
        receiveShadow
        material={materials["Material"]}
        geometry={(nodes["Cube_1"] as Mesh).geometry}
        scale={[curScale, curScale, curScale]}
      />
    </group>
  );
}

function Lane() {
  const { nodes, materials } = useGLTF("/assets/3d/BowlingLane.glb");

  const [ref] = useBox(
    () => ({
      type: "Static",
      position: [0, -0.5, 0],
      args: [13, 1, 44],
      userData: { isFloor: true },
    }),
    useRef<Group>(null)
  );

  return (
    <group ref={ref}>
      <mesh
        castShadow
        receiveShadow
        material={materials["FloorMaterial"]}
        geometry={(nodes["Cube"] as Mesh).geometry}
      />
      <mesh
        castShadow
        receiveShadow
        material={materials["Material.003"]}
        geometry={(nodes["Cube_1"] as Mesh).geometry}
      />
    </group>
  );
}

interface IPinInfo {
  index: number;
  isFallen: boolean;
  position: [number, number, number];
}

const pinInfos: IPinInfo[] = [
  { index: 0, isFallen: false, position: [0, 2.4, 13] },
  { index: 1, isFallen: false, position: [1, 2.4, 15] },
  { index: 2, isFallen: false, position: [-1, 2.4, 15] },
  { index: 3, isFallen: false, position: [2, 2.4, 17] },
  { index: 4, isFallen: false, position: [0, 2.4, 17] },
  { index: 5, isFallen: false, position: [-2, 2.4, 17] },
  { index: 6, isFallen: false, position: [3, 2.4, 19] },
  { index: 7, isFallen: false, position: [1, 2.4, 19] },
  { index: 8, isFallen: false, position: [-1, 2.4, 19] },
  { index: 9, isFallen: false, position: [-3, 2.4, 19] },
];

function Scene({
  isBallRolling,
  clickBall,
  checkIfFallenAfterThrow,
  initializeBowlingGame,
  isPreparingBowlingGame,
}: {
  isBallRolling: boolean;
  clickBall: () => void;
  checkIfFallenAfterThrow: boolean;
  initializeBowlingGame: boolean;
  isPreparingBowlingGame: boolean;
}) {
  const {
    scene: pinScene,
    nodes,
    materials,
  } = useGLTF("/assets/3d/BowlingPin.glb");
  const [pins, setPins] = useState<IPinInfo[]>(pinInfos);
  const { camera } = useThree();

  const cameraPos = new Vector3(0, 4, -30);
  const lookAtPos = new Vector3(0, 2, 0);
  useEffect(() => {
    camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
    camera.lookAt(lookAtPos);
  }, [cameraPos, lookAtPos]);

  return (
    <>
      {/* <ambientLight intensity={1} /> */}
      <ambientLight intensity={0.5 * Math.PI} />
      <pointLight
        decay={0}
        intensity={Math.PI * 0.1}
        position={[0, 40, -40]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <spotLight
        castShadow
        decay={0}
        intensity={Math.PI * 0.1}
        penumbra={1}
        position={[-20, 20, -20]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <spotLight
        castShadow
        decay={0}
        intensity={Math.PI * 0.1}
        penumbra={1}
        position={[20, 20, -20]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      {/* <Debug scale={1.1}> */}
      <Lane />
      <Ball
        isBallRolling={isBallRolling}
        initializeBowlingGame={initializeBowlingGame}
        isPreparingBowlingGame={isPreparingBowlingGame}
        clickBall={clickBall}
      />
      <BallRing
        isBallRolling={isBallRolling}
        isPreparingBowlingGame={isPreparingBowlingGame}
      />
      {pins.map(({ index, isFallen, position }) => (
        <Pin
          key={index}
          pinScene={pinScene}
          nodes={nodes}
          materials={materials}
          checkIfFallenAfterThrow={checkIfFallenAfterThrow}
          isFallen={isFallen}
          initializeBowlingGame={initializeBowlingGame}
          isBallRolling={isBallRolling}
          isPreparingBowlingGame={isPreparingBowlingGame}
          index={index}
          pins={pins}
          setPins={setPins}
          position={position}
        />
      ))}
      {/* </Debug> */}
    </>
  );
}

export function BowlingGame() {
  const [isBallRolling, setIsBallRolling] = useState(false);
  // ボールを投げる前の準備に使う　アニメーションに使用する
  const [isPreparingBowlingGame, setIsPreparingBowlingGame] = useState(false);
  const [checkIfFallenAfterThrow] = useState(false);
  const [initializeBowlingGame, setInitializeBowlingGame] = useState(false);

  const clickBall = () => {
    if (!isBallRolling) {
      // 初期化
      setIsBallRolling(true);
      setInitializeBowlingGame(false);
      setIsPreparingBowlingGame(false);

      setTimeout(resetBowlingGame, 1500);
      setTimeout(preparingBowlingGame, 2500);
      setTimeout(readyBowlingGame, 3500);
    }
  };

  const resetBowlingGame = () => {
    setInitializeBowlingGame(true);
  };

  const preparingBowlingGame = () => {
    // ボールを投げる前の準備
    setIsPreparingBowlingGame(true);
  };

  const readyBowlingGame = () => {
    // ボールをタッチできますよ。
    setIsBallRolling(false);
  };

  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [0, 8 + 4, -30], fov: 30 }}>
        <color attach="background" args={["#FF7F1E"]} />
        <Physics>
          <Scene
            isBallRolling={isBallRolling}
            checkIfFallenAfterThrow={checkIfFallenAfterThrow}
            initializeBowlingGame={initializeBowlingGame}
            isPreparingBowlingGame={isPreparingBowlingGame}
            clickBall={clickBall}
          />
        </Physics>
      </Canvas>
    </div>
  );
}
