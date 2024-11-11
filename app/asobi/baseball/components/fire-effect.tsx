import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Mesh, ShaderMaterial } from "three";

const fireVertexShader = `
// 頂点シェーダー
varying vec2 vUv;
varying vec3 vPos;
void main() {
  vUv = uv;
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fireFragmentShader = `
// フラグメントシェーダー
  uniform float time;
  uniform float u_progress;
  varying vec3 vPos;
  varying vec2 vUv;

void main() {
  

  float progressOpacity = smoothstep(0.0, 0.1, 1.4 * u_progress - 0.4 * (1.0 -vUv.y) ) * (1.0 - smoothstep(0.9, 1.0, 1.4 * u_progress - 0.4 * (1.0 - vUv.y) ));
  gl_FragColor = vec4( vec3(1.0), progressOpacity * 0.4);
}
`;

// three.js の FireEffect を描画する。
export function FireEffect({
  position,
  isFireEffectOn,
  setIsFireEffectOn,
}: {
  position: [number, number, number];
  isFireEffectOn: boolean;
  setIsFireEffectOn: Dispatch<SetStateAction<boolean>>;
}) {
  const meshRef = useRef<Mesh>(null);
  const [progress, setProgress] = useState(0.0);
  const progressRef = useRef(0.0);

  const [uniforms] = useState({
    time: { value: 1.0 },
    u_progress: { value: 0.0 },
  });

  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as ShaderMaterial).uniforms.time.value =
        state.clock.elapsedTime;
      (meshRef.current.material as ShaderMaterial).uniforms.u_progress.value =
        progress;
    }
  });

  useEffect(() => {
    if (isFireEffectOn) {
      gsap.killTweensOf(progressRef);
      gsap.to(progressRef, {
        current: 1.0,
        duration: 0.6,
        startAt: { current: 0.0 },
        onUpdate: () => {
          setProgress(progressRef.current);
        },
        onComplete: () => {
          setIsFireEffectOn(false);
        },
      });
    }
  }, [isFireEffectOn]);

  return (
    <mesh position={position} ref={meshRef}>
      <cylinderGeometry args={[0.5, 0.5, 2, 10, 1, true]} />
      {/* <meshStandardMaterial color="red" /> */}
      <shaderMaterial
        uniforms={uniforms}
        fragmentShader={fireFragmentShader}
        vertexShader={fireVertexShader}
        transparent
      />
    </mesh>
  );
}
