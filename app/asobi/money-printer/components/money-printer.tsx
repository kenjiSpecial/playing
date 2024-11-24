"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Clone, useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { Group, MathUtils, Mesh, Vector3 } from "three";
import { Stars } from "@react-three/drei";
import gsap from "gsap";

function Printer() {
  const { scene: baseScene } = useGLTF("/assets/3d/Printer-Base.glb");
  const { scene: printerBottomScene } = useGLTF(
    "/assets/3d/Printer-hand-bottom.glb"
  );
  const { scene: printerTopScene } = useGLTF("/assets/3d/Printer-hand-top.glb");
  const { scene: printerCylinderTopScene } = useGLTF(
    "/assets/3d/Printer-cylinder-top.glb"
  );
  const { scene: printerCylinderBottomScene } = useGLTF(
    "/assets/3d/Printer-cylinder-bottom.glb"
  );
  // useref
  const printerBottomRef = useRef<Mesh>(null);
  const printerTopRef = useRef<Mesh>(null);
  const printerCylinderTopRef = useRef<Mesh>(null);
  const printerCylinderBottomRef = useRef<Mesh>(null);

  useEffect(() => {
    [
      baseScene,
      printerBottomScene,
      printerTopScene,
      printerCylinderTopScene,
      printerCylinderBottomScene,
    ].forEach((scene) => {
      scene.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    });
  }, [
    baseScene,
    printerBottomScene,
    printerTopScene,
    printerCylinderTopScene,
    printerCylinderBottomScene,
  ]);

  useFrame(() => {
    if (printerTopRef.current) {
      printerTopRef.current.children[0].rotation.x -= Math.PI * 0.01;
    }
    if (printerBottomRef.current) {
      printerBottomRef.current.children[0].rotation.x += Math.PI * 0.01;
    }
    if (printerCylinderTopRef.current) {
      printerCylinderTopRef.current.children[0].rotation.x -= Math.PI * 0.01;
    }
    if (printerCylinderBottomRef.current) {
      printerCylinderBottomRef.current.children[0].rotation.x += Math.PI * 0.01;
    }
  });

  return (
    <>
      <primitive object={baseScene} />
      <primitive object={printerBottomScene} ref={printerBottomRef} />
      <primitive object={printerTopScene} ref={printerTopRef} />

      <primitive object={printerCylinderTopScene} ref={printerCylinderTopRef} />
      <primitive
        object={printerCylinderBottomScene}
        ref={printerCylinderBottomRef}
      />
    </>
  );
}

function Bill({
  initialPosition,
}: {
  initialPosition: [number, number, number];
}) {
  const { scene: billDollarScene } = useGLTF(
    "/assets/3d/Printer-bill-dollar.glb"
  );
  const billRef = useRef<Group>(null);
  const velocity = useRef(new Vector3(0, 0, 15 / 60));
  const rotationRange = 0.08;
  const rotationVelocity = useRef(
    new Vector3(
      MathUtils.randFloat(-rotationRange, rotationRange),
      MathUtils.randFloat(-rotationRange, rotationRange),
      MathUtils.randFloat(-rotationRange, rotationRange)
    )
  );
  // const gravity = useRef(new Vector3(0, 0, (-9.8 * 1) / 60));
  const [isFlying, setIsFlying] = useState(false);

  useFrame(() => {
    if (billRef.current) {
      if (!isFlying) {
        billRef.current.position.z += 0.05;
        if (billRef.current.position.z > -1) {
          billRef.current.visible = true;
        } else {
          billRef.current.visible = false;
        }

        if (billRef.current.position.z > 1) {
          setIsFlying(true);
        }
      } else {
        // velocity.current.add(gravity.current);
        velocity.current.z *= 0.95;
        if (velocity.current.y > -5 / 60) {
          velocity.current.y -= 1.5 / 60;
        }
        billRef.current.position.add(velocity.current);

        billRef.current.rotation.x += rotationVelocity.current.x;
        billRef.current.rotation.y += rotationVelocity.current.y;
        billRef.current.rotation.z += rotationVelocity.current.z;
      }
    }
  });

  const resetIsFlying = () => {
    if (billRef.current) {
      billRef.current.position.set(0, 2.5, -1);
      billRef.current.rotation.set(0, 0, 0);
      velocity.current.set(0, 0, 15 / 60);
      rotationVelocity.current.set(
        MathUtils.randFloat(-rotationRange, rotationRange),
        MathUtils.randFloat(-rotationRange, rotationRange),
        MathUtils.randFloat(-rotationRange, rotationRange)
      );
    }
    setIsFlying(false);
  };

  useEffect(() => {
    if (isFlying) {
      gsap.delayedCall(2, resetIsFlying);
    }
  }, [isFlying]);

  return (
    <group position={initialPosition} ref={billRef}>
      <Clone object={billDollarScene} />
    </group>
  );
}

export function MoneyPrinter() {
  return (
    <Canvas camera={{ position: [0, -10, 15], fov: 50 }} shadows>
      <color attach="background" args={["#000"]} />
      <ambientLight intensity={0.4} />
      <spotLight
        angle={Math.PI * 0.3}
        castShadow
        decay={0}
        intensity={Math.PI}
        penumbra={1}
        position={[5, 10, 15]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <Printer />
      <Bill initialPosition={[0, 2.5, -1]} />
      <Bill initialPosition={[0, 2.5, -2.5]} />
      <Bill initialPosition={[0, 2.5, -4]} />
      <Bill initialPosition={[0, 2.5, -5.5]} />
      <Bill initialPosition={[0, 2.5, -7]} />
      <Stars />
    </Canvas>
  );
}
