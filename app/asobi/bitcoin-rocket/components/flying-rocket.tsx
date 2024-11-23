"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import {
  BufferGeometry,
  Group,
  Material,
  MathUtils,
  Mesh,
  Vector3,
} from "three";
import { OrbitControls, Stars } from "@react-three/drei";

function Fire({
  geometry,
  material,
  position,
  baseScale,
}: {
  geometry: BufferGeometry;
  material: Material;
  position: Vector3;
  baseScale: number;
}) {
  const [fireScale, setFireScale] = useState(1);

  useFrame(() => {
    setFireScale(MathUtils.randFloat(0.95, 1.05) * baseScale);
  });

  return (
    <group position={position} scale={fireScale}>
      <mesh geometry={geometry} material={material} />
    </group>
  );
}

const fireData = [
  { position: new Vector3(0, 0, 0), baseScale: 1 },
  { position: new Vector3(0.76, 0.37, 0), baseScale: 0.25 },
  { position: new Vector3(-0.76, 0.37, 0), baseScale: 0.25 },
  { position: new Vector3(0, 0.37, 0.76), baseScale: 0.25 },
  { position: new Vector3(0, 0.37, -0.76), baseScale: 0.25 },
];

function Rocket({ index }: { index: number }) {
  const rocketRef = useRef<Group>(null);
  const { scene } = useGLTF("/assets/3d/bitcoin-rocket.glb");
  const { camera } = useThree();
  const { nodes: fireNodes, materials: fireMaterials } = useGLTF(
    "/assets/3d/bitcoin-rocket-fire.glb"
  );

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (rocketRef.current) {
      rocketRef.current.position.y += delta * 2;
      rocketRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.05; // 少し揺れるアニメーション

      camera.lookAt(rocketRef.current.position);
    }
  });

  return (
    <group ref={rocketRef} position={[0, -20 * index - 3, 0]}>
      <primitive object={scene} />
      {fireData.map((fire) => (
        <Fire
          key={fire.position.toString()}
          geometry={(fireNodes.Fire as Mesh).geometry}
          material={fireMaterials.Fire}
          position={fire.position}
          baseScale={fire.baseScale}
        />
      ))}
    </group>
  );
}

export function FlyingRocket() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }} shadows>
      <color attach="background" args={["#000"]} />
      <ambientLight intensity={0.4} />
      <spotLight
        angle={Math.PI * 0.5}
        castShadow
        decay={0.4}
        intensity={Math.PI}
        penumbra={1}
        position={[0, 2, 10]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <Rocket index={0} />
      <Stars />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
