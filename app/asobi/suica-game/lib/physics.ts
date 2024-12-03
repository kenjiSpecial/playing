import * as THREE from "three";
import Matter from "matter-js";

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"];

export const createPhysicsObjects = (scene: THREE.Scene) => {
  const objects = Array.from({ length: 30 }, (_, i) => {
    const x = Math.random() * 20 - 10;
    const y = -15 + i * -2;

    return Matter.Bodies.circle(x, y, 1, {
      restitution: 0.6,
      friction: 0.5,
      density: 100, // 密度を下げて軽くする
      slop: 0.05, // 貫通防止のための許容値
    });
  });

  const objectMeshes = objects.map((body) => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const geometry = new THREE.SphereGeometry(1, 16, 16);

    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color,
        metalness: 0.2,
        roughness: 0.8,
      })
    );

    scene.add(mesh);
    return { body, mesh };
  });

  return { objects, objectMeshes };
};
