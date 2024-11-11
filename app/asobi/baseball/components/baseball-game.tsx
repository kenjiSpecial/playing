"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  CollideEvent,
  Debug,
  Physics,
  PublicApi,
  useBox,
  usePlane,
  useSphere,
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
import { DoubleSide, Group, Mesh, ShaderMaterial, Vector3 } from "three";
import { FireEffect } from "./fire-effect";
import { smoothstep } from "three/src/math/MathUtils.js";
import { TouchEffect } from "./touch-effect";

function Ball({
  position,
  isThrowing,
  setEffectPosition,
  setIsThrowing,
  setFireEffect,
  setIsFireEffectOn,
}: {
  position: [number, number, number];
  isThrowing: boolean;
  setEffectPosition: Dispatch<SetStateAction<[number, number, number]>>;
  setIsThrowing: Dispatch<SetStateAction<boolean>>;
  setFireEffect: Dispatch<SetStateAction<boolean>>;
  setIsFireEffectOn: Dispatch<SetStateAction<boolean>>;
}) {
  const { nodes, materials } = useGLTF("/assets/3d/baseball-ball.glb");
  const [forceReset, setForceReset] = useState(false);
  const [throwValue, setThrowValue] = useState(0);
  const [ballScale, setBallScale] = useState(1);
  const [ballThrowingScale, setBallThrowingScale] = useState(1);
  const [strechScale, setStrechScale] = useState(1);
  const throwValueRef = useRef(0);
  const ballScaleRef = useRef(1);
  const ballThrowingScaleRef = useRef(1);
  const strechScaleRef = useRef(1);

  const [ref, api] = useSphere(
    () => ({
      mass: 1,
      position,
      args: [0.3],
      onCollide: handleCollide,
    }),
    useRef<Group>(null)
  );

  const batApiRef = useRef<PublicApi | null>(null);

  useEffect(() => {
    batApiRef.current = api;
  }, [api]);

  useEffect(() => {
    startAutoThrow();
  }, []);

  useEffect(() => {
    if (isThrowing) {
      api.velocity.set(0, 0, 20);
      setIsThrowing(false);
      // マンガエフェクトを起動
      setFireEffect(true);
      // change manage effect position to ball position
      setEffectPosition([position[0], position[1] - 0.5, position[2]]);
      // ボールのスケールをかえる。 スローイングスケール。
      gsap.killTweensOf(ballThrowingScaleRef);
      gsap.to(ballThrowingScaleRef, {
        current: 1.6,
        duration: 0.1,
        ease: "Power4.out",
        onUpdate: () => {
          setBallThrowingScale(ballThrowingScaleRef.current);
        },
        onComplete: () => {
          setBallThrowingScale(ballThrowingScaleRef.current);
        },
      });
      gsap.to(ballThrowingScaleRef, {
        current: 1,
        duration: 0.8,
        delay: 0.1,
        // ease: "Power4.inOut",
        onUpdate: () => {
          setBallThrowingScale(ballThrowingScaleRef.current);
        },
        onComplete: () => {
          setBallThrowingScale(ballThrowingScaleRef.current);
        },
      });

      // 3秒後にボールのスケールを小さくして、フェードアウトする。
      gsap.killTweensOf([ballScaleRef, strechScaleRef]);
      gsap.to(ballScaleRef, {
        current: 0.01,
        duration: 0.6,
        delay: 3,
        ease: "Power4.Out",
        onStart: () => {
          setBallScale(ballScaleRef.current);
          api.applyImpulse([0, 6, 0], [0, 0, 0]);
        },
        onUpdate: () => {
          setBallScale(ballScaleRef.current);
        },
        onComplete: () => {
          setBallScale(ballScaleRef.current);
          setForceReset(true);
        },
      });
      gsap.to(strechScaleRef, {
        current: 1,
        duration: 0.4,
        delay: 3.0,
        ease: "Back.out",
        startAt: { current: 2 },
        onUpdate: () => {
          setStrechScale(strechScaleRef.current);
        },
        onComplete: () => {
          setStrechScale(strechScaleRef.current);
        },
      });
    }
  }, [isThrowing]);

  // ボールをリセットする。
  // 最初の位置に戻す。
  const resetThrowBall = () => {
    api.velocity.set(0, 0, 0);
    api.rotation.set(0, 0, 0);
    api.angularVelocity.set(0, 0, 0);
    api.position.set(position[0], position[1] + 1, position[2]);
  };

  const startAutoThrow = () => {
    gsap.killTweensOf([throwValueRef, ballScaleRef, strechScaleRef]);
    // 投球のゲージが増えるアニメーション
    gsap.to(throwValueRef, {
      startAt: { current: 0 },
      current: 1,
      duration: 2,
      onUpdate: () => {
        setThrowValue(throwValueRef.current);
      },
      onComplete: () => {
        setThrowValue(throwValueRef.current);
        setIsThrowing(true);
        gsap.to(throwValueRef, {
          current: 2,
          duration: 0.1,
          ease: "Power4.out",
          onUpdate: () => {
            setThrowValue(throwValueRef.current);
          },
        });
      },
    });

    // ボールのスケールのアニメーション
    gsap.to(ballScaleRef, {
      current: 1,
      duration: 0.2,
      ease: "Back.out",
      onUpdate: () => {
        setBallScale(ballScaleRef.current);
      },
    });

    gsap.to(strechScaleRef, {
      startAt: { current: 2 },
      current: 1,
      duration: 0.8,
      ease: "Power4.inOut",
      onUpdate: () => {
        setStrechScale(strechScaleRef.current);
      },
      onComplete: () => {
        setStrechScale(strechScaleRef.current);
      },
    });
  };

  useEffect(() => {
    if (forceReset) {
      // 球場内のボールをリセットし、投球のゲージをリセットする。
      // 最初の位置に戻す。
      resetThrowBall();

      // 投球のゲージをリセットする。
      startAutoThrow();
      ballScaleRef.current = 0.01;
      setBallScale(0.01);

      // ボールの登場エフェクトに使うフラグをtrueにする。
      setIsFireEffectOn(true);
      setForceReset(false);
    }
  }, [forceReset]);

  const handleCollide = (e: CollideEvent) => {
    const collidedBody = e.body;
    if (collidedBody.userData.type === "bat") {
      const collisionPoint = e.contact.contactPoint as [number, number, number];
      setEffectPosition(collisionPoint);
      setFireEffect(true);
      const collisionNormal = e.contact.contactNormal as [
        number,
        number,
        number
      ];
      applyPulseToBat(
        collisionPoint,
        collisionNormal,
        e.contact.impactVelocity
      );
    }
  };

  const applyPulseToBat = (
    point: [number, number, number],
    normal: [number, number, number],
    impactVal: number
  ) => {
    if (batApiRef.current) {
      const forceMagnitude = Math.min(Math.max(impactVal * 2, 0), 100);
      const force = new Vector3(normal[0], normal[1], normal[2]).multiplyScalar(
        forceMagnitude
      );
      // .add(new Vector3(0, 10, 0));
      batApiRef.current.applyImpulse(force.toArray(), point);
    }
  };

  return (
    <group>
      <group position={[0.5, 0.5 + 0.3, -6]}>
        <mesh>
          <planeGeometry args={[0.3, 1]} />
          <meshBasicMaterial
            color="#ffffff"
            side={DoubleSide}
            transparent
            opacity={0.2}
          />
        </mesh>

        <mesh
          position={[0, -0.5 * (1 - throwValue), 0.01]}
          scale={[1, throwValue < 1 ? throwValue : 2 - throwValue, 1]}
        >
          <planeGeometry args={[0.22, 0.9]} />
          <meshBasicMaterial color="#ffffff" side={DoubleSide} />
        </mesh>
      </group>

      <group ref={ref} castShadow>
        <mesh
          scale={[
            ballScale / ballThrowingScale / Math.sqrt(strechScale),
            ballScale * strechScale,
            (ballScale * ballThrowingScale) / Math.sqrt(strechScale),
          ]}
          geometry={(nodes["baseball"] as Mesh).geometry}
          material={materials["Material.001"]}
          castShadow
          receiveShadow
        />
      </group>
    </group>
  );
}

function Bat({ isSwinging }: { isSwinging: boolean }) {
  const swingRef = useRef(0);
  const [theta, setTheta] = useState(0);
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
  const { camera } = useThree();
  const [effectPosition, setEffectPosition] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const [fireEffect, setFireEffect] = useState(false);
  const [isFireEffectOn, setIsFireEffectOn] = useState(false);

  useEffect(() => {
    if (camera) {
      camera.lookAt(new Vector3(0, 0, -5));
    }
  }, [camera]);

  useEffect(() => {
    if (camera) {
      if (isDebug) {
        camera.position.set(0, 5, 20);
      } else {
        camera.position.set(0, 2, 4);
      }
    }
  }, [isDebug]);

  return (
    <Physics
      iterations={20}
      defaultContactMaterial={{
        friction: 0.1,
        restitution: 0.3,
      }}
      gravity={[0, -20, 0]}
    >
      <ToggleDebug isDebug={isDebug}>
        {/* <Ground /> */}
        <MangaEffect
          position={effectPosition}
          fireEffect={fireEffect}
          setFireEffect={setFireEffect}
        />
        <Stadium />
        <FireEffect
          position={[ballPosition[0], 1, ballPosition[2]]}
          isFireEffectOn={isFireEffectOn}
          setIsFireEffectOn={setIsFireEffectOn}
        />
        <Ball
          setEffectPosition={setEffectPosition}
          position={ballPosition}
          isThrowing={isThrowing}
          setIsThrowing={setIsThrowing}
          setFireEffect={setFireEffect}
          setIsFireEffectOn={setIsFireEffectOn}
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
}: {
  position: [number, number, number];
  fireEffect: boolean;
  setFireEffect: Dispatch<SetStateAction<boolean>>;
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
    float mask = smoothstep(0.0, 1.0 * u_progress, radius);
    float mask2 = 1.0 - smoothstep(0.1, 0.5 , radius);
    float color = mask;
    gl_FragColor = vec4(color, color, color, color * mask2);
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
        <mesh rotation={[-Math.PI / 2, 0, 0]} ref={ref}>
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

  const swingStart = () => {
    setIsSwinging(true);
  };
  const swingEnd = () => {
    setIsSwinging(false);
  };

  return (
    <div className="w-full h-screen relative">
      <Canvas
        shadows
        onPointerDown={swingStart}
        onPointerUp={swingEnd}
        camera={{ fov: 60, position: [0, 1.5, 2] }}
      >
        <color attach="background" args={["#333"]} />
        {isDebug ? <OrbitControls /> : null}
        {isDebug && <axesHelper position={[0, 0.1, 0]} />}
        <ambientLight intensity={0.4} />
        <spotLight
          angle={Math.PI * 0.1}
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
    </div>
  );
}
