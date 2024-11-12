"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Debug,
  Physics,
  useBox,
  usePlane,
  useTrimesh,
} from "@react-three/cannon";
import { OrbitControls, useGLTF } from "@react-three/drei";
import {
  useState,
  useRef,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
} from "react";
import gsap from "gsap";
import {
  DoubleSide,
  Group,
  Mesh,
  PerspectiveCamera,
  ShaderMaterial,
  Vector3,
} from "three";
import { FireEffect } from "./fire-effect";
import { smoothstep } from "three/src/math/MathUtils.js";
import { TouchEffect } from "./touch-effect";
import { PitchingMachine } from "./pitching-machine";

function Bat({ isSwinging }: { isSwinging: boolean }) {
  const swingRef = useRef(0);
  const [theta, setTheta] = useState(-Math.PI / 2);
  const [buttonProgress, setButtonProgress] = useState(0);
  const [buttonActiveProgress, setButtonActiveProgress] = useState(0);
  const [buttonIdleProgress, setButtonIdleProgress] = useState(0);
  const buttonProgressRef = useRef(0);
  const buttonIdleProgressRef = useRef(0);

  const rad = 0.4;
  const [ref, api] = useBox(
    () => ({
      mass: 10,
      position: [-0.9 + Math.cos(-theta) * rad, 0.3, Math.sin(-theta) * rad],
      rotation: [0, theta, 0],
      args: [2, 0.1, 0.1],
      type: "Kinematic",
      userData: { type: "bat" },
    }),
    useRef<Group>(null)
  );
  const { nodes: batNodes, materials: batMaterials } = useGLTF(
    "/assets/3d/baseball-bat.glb"
  );
  const { nodes: playerNodes, materials: playerMaterials } = useGLTF(
    "/assets/3d/baseball-player.glb"
  );

  const duration = 0.2;
  useEffect(() => {
    if (isSwinging) {
      gsap.killTweensOf([swingRef, buttonProgressRef, buttonIdleProgressRef]);
      gsap.to(swingRef, {
        current: 1,
        duration: duration,
        ease: "Power2.out",
        onUpdate: () => {
          setTheta(swingRef.current * Math.PI - Math.PI / 2);
        },
      });
      gsap.to(buttonProgressRef, {
        current: 1,
        duration: 0.1,
        onUpdate: () => {
          setButtonProgress(buttonProgressRef.current);
        },
      });
      gsap.to(buttonIdleProgressRef, {
        current: 0,
        duration: 0.1,
        onUpdate: () => {
          setButtonIdleProgress(buttonIdleProgressRef.current);
        },
      });
    } else {
      gsap.killTweensOf([swingRef, buttonProgressRef, buttonIdleProgressRef]);
      gsap.to(swingRef, {
        current: 0,
        duration: duration,
        ease: "Power2.out",
        onUpdate: () => {
          setTheta(swingRef.current * Math.PI - Math.PI / 2);
        },
      });
      gsap.to(buttonProgressRef, {
        current: 0,
        duration: 0.1,
        onUpdate: () => {
          setButtonProgress(buttonProgressRef.current);
        },
      });

      gsap.to(buttonIdleProgressRef, {
        current: 1,
        duration: 0.1,
        onUpdate: () => {
          setButtonIdleProgress(buttonIdleProgressRef.current);
        },
      });
    }
  }, [isSwinging]);

  useFrame(() => {
    const rad = 0.4;
    api.position.set(
      -0.9 + Math.cos(-theta) * rad,
      0.3,
      Math.sin(-theta) * rad
    );
    api.rotation.set(0, theta, 0);

    setButtonActiveProgress((buttonActiveProgress + 1 / 60) % 1);
  });

  const { opacity: circleOpacity, scale: circleScale } = useMemo(() => {
    const progress =
      smoothstep(buttonActiveProgress, 0.0, 0.1) *
      (1 - smoothstep(buttonActiveProgress, 0.5, 1.0));
    const opacity = progress * 0.3 * buttonIdleProgress;
    const scale = buttonActiveProgress + 0.5;

    return { opacity, scale };
  }, [buttonActiveProgress, buttonIdleProgress]);

  return (
    <>
      <group ref={ref}>
        <mesh
          geometry={(batNodes["Bat"] as Mesh).geometry}
          material={batMaterials["Material.001"]}
          scale={[0.4, 0.4, 0.4]}
          position={[0.3, 0.0, 0]}
          castShadow
          receiveShadow
        />
      </group>
      <group position={[-0.9, 0, 0]}>
        <group rotation={[0, theta, 0]}>
          <mesh
            geometry={(playerNodes["Arm_L"] as Mesh).geometry}
            material={playerMaterials["BlackMaterial"]}
            position={[0.27, 0.3, -0.11]}
            castShadow
            receiveShadow
          />
          <mesh
            geometry={(playerNodes["Arm_R"] as Mesh).geometry}
            material={playerMaterials["BlackMaterial"]}
            position={[0.27, 0.3, 0.11]}
            castShadow
            receiveShadow
          />
          <mesh
            geometry={(playerNodes["Hand_L"] as Mesh).geometry}
            material={playerMaterials["Skin"]}
            position={[0.41, 0.3, 0.07]}
            castShadow
            receiveShadow
          />
          <mesh
            geometry={(playerNodes["Hand_R"] as Mesh).geometry}
            material={playerMaterials["Skin"]}
            position={[0.41, 0.3, -0.07]}
            castShadow
            receiveShadow
          />
          <mesh
            geometry={(playerNodes["Body"] as Mesh).geometry}
            material={playerMaterials["BallHat"]}
            position={[0, 0.3, 0]}
            castShadow
            receiveShadow
          />
        </group>
        <group>
          <mesh
            geometry={(playerNodes["Button"] as Mesh).geometry}
            material={playerMaterials["Material.003"]}
            position={[0, 0.8 - buttonProgress * 0.05, 0]}
            castShadow
            receiveShadow
          />
          <mesh
            geometry={(playerNodes["Cap"] as Mesh).geometry}
            material={playerMaterials["BallHat"]}
            position={[0, 0.6, 0]}
            castShadow
            receiveShadow
          />
          <mesh
            geometry={(playerNodes["head"] as Mesh).geometry}
            material={playerMaterials["Skin"]}
            position={[0, 0.6, 0]}
            castShadow
            receiveShadow
          />
          <mesh
            geometry={(playerNodes["shoes"] as Mesh).geometry}
            material={playerMaterials["ShoesMat"]}
            castShadow
            receiveShadow
          />
        </group>
      </group>
      <mesh
        position={[-0.9, 0.85, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[circleScale, circleScale, circleScale]}
        castShadow
        receiveShadow
      >
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={circleOpacity}
        />
      </mesh>
    </>
  );
}

function Stadium() {
  usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    // Start of Selection
    position: [0, 0, 0],
  }));
  const { nodes, materials } = useGLTF("/assets/3d/baseball-stadium.glb");
  const { scene: whitelineScene } = useGLTF(
    "/assets/3d/baseball-whiteline.glb"
  );
  const geometry = (nodes["StadiumMesh"] as Mesh).geometry;

  useTrimesh(
    () => ({
      args: [geometry.attributes.position.array, geometry.index?.array ?? []],
      type: "Static",
    }),
    useRef<Mesh>(null)
  );

  return (
    <group>
      {/* <primitive object={scene} position={[0, 0, 0]} /> */}
      <primitive object={whitelineScene} position={[0, 0, 0]} />
      <mesh
        castShadow
        receiveShadow
        geometry={geometry}
        material={materials["Stand"]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["StadiumMesh_1"] as Mesh).geometry}
        material={materials["Grass"]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["StadiumMesh_2"] as Mesh).geometry}
        material={materials["Soil"]}
      />
    </group>
  );
}

type SceneProps = {
  ballPosition: [number, number, number];
  isThrowing: boolean;
  setIsThrowing: React.Dispatch<React.SetStateAction<boolean>>;
  isSwinging: boolean;
  isDebug: boolean;
};

export function Scene({
  ballPosition,
  isThrowing,
  setIsThrowing,
  isSwinging,
  isDebug,
}: SceneProps) {
  const { camera, size } = useThree();
  const [effectPosition, setEffectPosition] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const [fireEffect, setFireEffect] = useState(false);
  const [isFireEffectOn, setIsFireEffectOn] = useState(false);
  const [mangaEffectScale, setMangaEffectScale] = useState(1);
  useEffect(() => {
    if (camera) {
      camera.lookAt(new Vector3(0, 0, -5));
    }
  }, [camera]);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const rate = height / width > 1 ? height / width : 1;
    const fov = Math.atan((rate * 1.4 * 2) / 6) * 2 * (180 / Math.PI);
    (camera as PerspectiveCamera).fov = fov;
    (camera as PerspectiveCamera).aspect = size.width / size.height;
    (camera as PerspectiveCamera).updateProjectionMatrix();
  }, [camera, size]);

  return (
    <Physics
      iterations={20}
      defaultContactMaterial={{
        friction: 5,
        restitution: 0.7,
      }}
      gravity={[0, -20, 0]}
    >
      <ToggleDebug isDebug={isDebug}>
        {/* <Ground /> */}
        <MangaEffect
          position={effectPosition}
          fireEffect={fireEffect}
          setFireEffect={setFireEffect}
          mangaEffectScale={mangaEffectScale}
        />
        <Stadium />
        <FireEffect
          position={[ballPosition[0], 1, ballPosition[2]]}
          isFireEffectOn={isFireEffectOn}
          setIsFireEffectOn={setIsFireEffectOn}
        />
        <PitchingMachine
          setEffectPosition={setEffectPosition}
          position={ballPosition}
          isThrowing={isThrowing}
          setIsThrowing={setIsThrowing}
          setFireEffect={setFireEffect}
          setIsFireEffectOn={setIsFireEffectOn}
          setMangaEffectScale={setMangaEffectScale}
        />
        <Bat isSwinging={isSwinging} />
        <TouchEffect isSwinging={isSwinging} />
      </ToggleDebug>
    </Physics>
  );
}

function ToggleDebug({
  isDebug,
  children,
}: {
  isDebug: boolean;
  children: React.ReactNode;
}) {
  return (
    <>{isDebug ? <Debug scale={1.1}>{children}</Debug> : <>{children}</>}</>
  );
}

function MangaEffect({
  position,
  fireEffect,
  setFireEffect,
  mangaEffectScale,
}: {
  position: [number, number, number];
  fireEffect: boolean;
  setFireEffect: Dispatch<SetStateAction<boolean>>;
  mangaEffectScale: number;
}) {
  const [progress, setProgress] = useState(1);
  const progressRef = useRef(0);

  useEffect(() => {
    if (fireEffect) {
      gsap.killTweensOf(progressRef);
      progressRef.current = 0;
      gsap.to(progressRef, {
        current: 1,
        duration: 0.2,
        onUpdate: () => {
          setProgress(progressRef.current);
        },
        onComplete: () => {
          setProgress(progressRef.current);
          setFireEffect(false);
        },
      });
    }
  }, [fireEffect]);
  const vertexShader = `
  varying vec2 vUv;

  void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `;
  const fragmentShader = `
  uniform float u_progress;
  varying vec2 vUv;

void main() {
    vec2 st = vUv ;
    vec2 toCenter = st - vec2(0.5);
    float angle = atan(toCenter.y, toCenter.x);
    float radius = length(toCenter);
    // float mask = smoothstep(0.5 * u_progress, 1.0 * u_progress, radius);
    float mask2 = 1.0 - smoothstep(0.4, 0.5, radius);
    float fadeout = clamp(1.0 - u_progress , 0.0, 1.0) * 0.8;
    gl_FragColor = vec4(vec3(1.0),  mask2 * fadeout * min(u_progress * 5.0, 1.0));
}
  `;

  const [uniforms] = useState({
    u_progress: { value: 0 },
  });
  const ref = useRef<Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      (ref.current.material as ShaderMaterial).uniforms.u_progress.value =
        progress;
    }
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={position}>
      {progress < 1 ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          ref={ref}
          scale={mangaEffectScale * progress + 0.5}
        >
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            transparent
            side={DoubleSide}
            fragmentShader={fragmentShader}
            vertexShader={vertexShader}
            uniforms={uniforms}
          />
        </mesh>
      ) : null}
    </group>
  );
}

export function BaseballGame() {
  const [ballPosition] = useState<[number, number, number]>([0, 0.8, -6]);
  const [isThrowing, setIsThrowing] = useState(false);
  const [isSwinging, setIsSwinging] = useState(false);
  const [isDebug] = useState(false);
  const fov = useMemo(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const rate = height / width > 1 ? height / width : 1;
    const fov = Math.atan((rate * 1.4 * 2) / 6) * 2 * (180 / Math.PI);
    return fov;
  }, []);

  const swingStart = () => {
    setIsSwinging(true);
  };
  const swingEnd = () => {
    setIsSwinging(false);
  };

  return (
    <Canvas
      shadows
      onPointerDown={swingStart}
      onPointerUp={swingEnd}
      camera={{ fov: fov, position: [0, 1, 3] }}
    >
      <color attach="background" args={["#287ABE"]} />
      {isDebug ? <OrbitControls /> : null}
      {isDebug && <axesHelper position={[0, 0.1, 0]} />}
      <ambientLight intensity={0.4} />
      <spotLight
        angle={Math.PI * 0.3}
        castShadow
        decay={0}
        intensity={Math.PI * 0.4}
        penumbra={1}
        position={[0, 20, 30]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      <Scene
        ballPosition={ballPosition}
        isThrowing={isThrowing}
        setIsThrowing={setIsThrowing}
        isSwinging={isSwinging}
        isDebug={isDebug}
      />
    </Canvas>
  );
}
