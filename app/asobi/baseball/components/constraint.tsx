import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics, useBox, useLockConstraint } from "@react-three/cannon";

function Box(props) {
  const [ref] = useBox(() => ({ mass: 1, ...props }));
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

export default function Boxes() {
  const [boxARef] = useBox(() => ({ mass: 1, position: [-1.5, 10, 4] }));
  const [boxBRef] = useBox(() => ({ mass: 1, position: [1.5, 10, 4] }));

  useLockConstraint(boxARef, boxBRef, {});

  return (
    <>
      <Box ref={boxARef} />
      <Box ref={boxBRef} />
    </>
  );
}
