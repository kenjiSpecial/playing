import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { DoubleSide, Mesh } from "three";

export function TouchEffect({ isSwinging }: { isSwinging: boolean }) {
  const { nodes: touchEffectNodes } = useGLTF(
    "/assets/3d/baseball-touch-arrow.glb"
  );
  const [progress, setProgress] = useState(0);
  const [alpha, setAlpha] = useState(1.0);
  const alphaRef = useRef(1.0);
  useFrame(() => {
    setProgress((progress + 0.01) % 1);
  });

  useEffect(() => {
    if (isSwinging && alphaRef.current === 1.0) {
      gsap.killTweensOf(alphaRef);
      gsap.to(alphaRef, {
        current: 0.0,
        duration: 0.6,
        onUpdate: () => {
          setAlpha(alphaRef.current);
        },
      });
    }
  }, [isSwinging]);

  // Arrow Touch
  return (
    <>
      {alpha > 0 && (
        <group position={[-0.9, 0, 0]}>
          <mesh
            geometry={(touchEffectNodes.Touch as Mesh).geometry}
            position={[0, -0.05, 0]}
          >
            <meshStandardMaterial
              color="white"
              transparent
              opacity={0.5 * alpha}
            />
          </mesh>
          <mesh
            geometry={(touchEffectNodes.Arrow as Mesh).geometry}
            position={[0, 1.05 - progress * 0.05, 0]}
          >
            <meshStandardMaterial
              color="white"
              transparent
              opacity={(0.5 - 0.5 * progress) * alpha}
              side={DoubleSide}
            />
          </mesh>
        </group>
      )}
    </>
  );
}
