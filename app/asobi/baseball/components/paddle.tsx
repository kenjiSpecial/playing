// useCannon physics hooks
import { useBox, useHingeConstraint } from "@react-three/cannon";
import gsap from "gsap";
// react
import { useRef, useEffect } from "react";
import { BoxGeometry } from "three";

export const BaseballBat = ({
  position,
  speed,
  color,
  isSwinging,
}: {
  position: [number, number, number];
  speed: number;
  color: string;
  isSwinging: boolean;
}) => {
  const speedRef = useRef(0);
  const [doorFrameRef] = useBox(
    () => ({
      args: [0.25, 2, 0.25],
      position,
    }),
    useRef(null)
  );

  const [doorRef] = useBox(
    () => ({
      args: [0.25, 2, 1.75],
      position: [position[0], position[1], position[2] + 1.25],
      mass: 20,
    }),
    useRef(null)
  );

  const [, , hingeApi] = useHingeConstraint(doorRef, doorFrameRef, {
    collideConnected: false,
    axisA: [0, 1, 0],
    axisB: [0, 1, 0],
    pivotA: [0, 0, -1.25],
    pivotB: [0, 0, 0],
  });

  useEffect(() => {
    hingeApi.enableMotor();
  }, []);

  useEffect(() => {
    // positive speed is counter-clockwise
    // hingeApi.setMotorSpeed(speed);
    console.log(isSwinging);
    const duration = 0.1;
    if (isSwinging) {
      gsap.to(speedRef, {
        current: 10,
        duration: duration,
        ease: "power1.out",
        onUpdate: () => {
          hingeApi.setMotorSpeed(speedRef.current);
        },
        onComplete: () => {
          hingeApi.setMotorSpeed(0);
        },
      });

      gsap.to(speedRef, {
        current: -10,
        duration: duration,
        delay: duration,
        onUpdate: () => {
          hingeApi.setMotorSpeed(speedRef.current);
        },
        onComplete: () => {
          hingeApi.setMotorSpeed(0);
        },
      });
    }
  }, [isSwinging]);

  return (
    <group>
      <mesh ref={doorFrameRef}>
        <boxGeometry args={[0.25, 2, 0.25]} />
        <meshStandardMaterial color={color} transparent />
      </mesh>
      <mesh ref={doorRef}>
        <boxGeometry args={[0.25, 2, 1.75]} />
        <meshStandardMaterial color={color} transparent />
      </mesh>
    </group>
  );
};
