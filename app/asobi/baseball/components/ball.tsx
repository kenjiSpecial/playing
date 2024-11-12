import { CollideEvent, PublicApi, useSphere } from "@react-three/cannon";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BufferGeometry, Material, Group, Vector3 } from "three";
import gsap from "gsap";

export function Ball({
  geometry,
  material,
  isThrowing,
  isActive,
  position,
  setEffectPosition,
  setFireEffect,
  setMangaEffectScale,
}: {
  geometry: BufferGeometry;
  material: Material;
  position: [number, number, number];
  isThrowing: boolean;
  isActive: boolean;
  setEffectPosition: Dispatch<SetStateAction<[number, number, number]>>;
  setFireEffect: Dispatch<SetStateAction<boolean>>;
  setMangaEffectScale: Dispatch<SetStateAction<number>>;
}) {
  const [ref, api] = useSphere(
    () => ({
      mass: 1,
      position: [-9999, 0, 0],
      args: [0.3],
      onCollide: handleCollide,
    }),
    useRef<Group>(null)
  );

  const [ballScale, setBallScale] = useState(0);
  const [ballThrowingScale] = useState(1);
  const [strechScale, setStrechScale] = useState(1);

  const ballScaleRef = useRef(1);
  const strechScaleRef = useRef(1);
  const positionRef = useRef<[number, number, number]>([0, 0, 0]);

  const { isThrow, isPrepare } = useMemo(() => {
    return {
      isThrow: isActive && isThrowing,
      isPrepare: isActive && !isThrowing,
    };
  }, [isActive, isThrowing]);

  const batApiRef = useRef<PublicApi | null>(null);

  useEffect(() => {
    if (isThrow) {
      // console.log(index, "isThrow");
      api.velocity.set(0, -3 + Math.random() * 2, 15 + Math.random() * 10);
      // setEffectPosition(api.position., api.position.y - 0.5, api.position.z);

      setEffectPosition([
        positionRef.current[0],
        positionRef.current[1],
        positionRef.current[2],
      ]);

      // setIsThrowing(false);
      // ボールのスケールをかえる。 スローイングスケール。
      gsap.killTweensOf([ballScaleRef]);

      // 3秒後にボールのスケールを小さくして、フェードアウトする。
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
          // setForceReset(true);
        },
      });
    }
  }, [isThrow]);

  useEffect(() => {
    if (isPrepare) {
      resetThrowBall();
      prepareThrow();
    }
  }, [isPrepare]);

  useEffect(() => {
    batApiRef.current = api;
  }, [api]);

  const handleCollide = (e: CollideEvent) => {
    const collidedBody = e.body;
    if (collidedBody.userData.type === "bat") {
      const collisionPoint = e.contact.contactPoint as [number, number, number];

      setEffectPosition(collisionPoint);
      setFireEffect(true);
      setMangaEffectScale(1);

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

  // 最初の位置に戻す。
  const resetThrowBall = () => {
    api.velocity.set(0, 0, 0);
    api.rotation.set(0, 0, 0);
    api.angularVelocity.set(0, 0, 0);
    api.position.set(position[0], position[1] + 0.5, position[2]);
  };

  const applyPulseToBat = (
    point: [number, number, number],
    normal: [number, number, number],
    impactVal: number
  ) => {
    if (batApiRef.current) {
      const forceMagnitude = Math.min(Math.max(impactVal * 2, 0), 100);
      const force = new Vector3(normal[0], normal[1], normal[2])
        .multiplyScalar(forceMagnitude)
        .add(new Vector3(0, 3, 0));
      batApiRef.current.applyImpulse(force.toArray(), point);
    }
  };

  const prepareThrow = () => {
    // ボールのスケールのアニメーション
    gsap.killTweensOf([ballScaleRef, strechScaleRef]);
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
    api.position.subscribe((value) => {
      positionRef.current = value;
    });
  }, []);

  return (
    <group ref={ref} castShadow>
      {ballScale > 0.01 && (
        <mesh
          scale={[
            ballScale / ballThrowingScale / Math.sqrt(strechScale),
            ballScale * strechScale,
            (ballScale * ballThrowingScale) / Math.sqrt(strechScale),
          ]}
          geometry={geometry}
          material={material}
          castShadow
          receiveShadow
        />
      )}
    </group>
  );
}
