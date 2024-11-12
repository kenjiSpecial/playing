import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState, Dispatch, SetStateAction } from "react";
import { DoubleSide, Mesh } from "three";
import { Ball } from "./ball";
import gsap from "gsap";

const MAX_BALL_COUNT = 3;

//       isPreparing
// -----|---------------|

export function PitchingMachine({
  position,
  isThrowing,
  setEffectPosition,
  setIsThrowing,
  setFireEffect,
  setIsFireEffectOn,
  setMangaEffectScale,
}: {
  position: [number, number, number];
  isThrowing: boolean;
  setEffectPosition: Dispatch<SetStateAction<[number, number, number]>>;
  setIsThrowing: Dispatch<SetStateAction<boolean>>;
  setFireEffect: Dispatch<SetStateAction<boolean>>;
  setIsFireEffectOn: Dispatch<SetStateAction<boolean>>;
  setMangaEffectScale: Dispatch<SetStateAction<number>>;
}) {
  const { nodes, materials } = useGLTF("/assets/3d/baseball-ball.glb");
  const throwValueRef = useRef(0);
  const [throwValue, setThrowValue] = useState(0);
  const [activeBallIndex, setActiveBallIndex] = useState(0);

  useEffect(() => {
    // resetPitching();
  }, []);

  // 投球のゲージを増やすアニメーション
  const startGaugeAnimation = () => {
    gsap.killTweensOf([throwValueRef]);
    // 投球のゲージが増えるアニメーション
    gsap.to(throwValueRef, {
      startAt: { current: 0 },
      current: 1,
      duration: 1.5,
      onUpdate: () => {
        setThrowValue(throwValueRef.current);
      },
      onComplete: () => {
        setThrowValue(throwValueRef.current);
        startPitching();

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
  };

  const resetPitching = () => {
    setActiveBallIndex((activeBallIndex + 1) % MAX_BALL_COUNT);
    setIsThrowing(false);
  };

  const startPitching = () => {
    setIsThrowing(true);

    gsap.delayedCall(1, resetPitching);
  };

  useEffect(() => {
    if (isThrowing) {
      // マンガエフェクトを起動
      setFireEffect(true);
      setMangaEffectScale(2);
      // マンガエフェクトの位置を更新
      // setEffectPosition([position[0], position[1] - 0.5, position[2]]);
    } else {
      startGaugeAnimation();
      setIsFireEffectOn(true);
    }
  }, [isThrowing]);

  return (
    <group>
      <group position={[0.7, 0.5 + 0.3, -6]}>
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

      {Array.from({ length: MAX_BALL_COUNT }, (_, index) => {
        return (
          <Ball
            key={index}
            position={position}
            isThrowing={isThrowing}
            isActive={activeBallIndex === index}
            setEffectPosition={setEffectPosition}
            setFireEffect={setFireEffect}
            geometry={(nodes["baseball"] as Mesh).geometry}
            material={materials["Material.001"]}
            setMangaEffectScale={setMangaEffectScale}
          />
        );
      })}
    </group>
  );
}
