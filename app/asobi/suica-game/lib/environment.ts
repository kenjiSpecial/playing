import Matter from "matter-js";
import {
  GridHelper,
  Mesh,
  MeshPhongMaterial,
  PlaneGeometry,
  Scene,
} from "three";
export const GROUND_HEIGHT = 300;
export const GROUND_HEIGHT_HALF = GROUND_HEIGHT / 2;
export const GROUND_WIDTH = 180;
export const GROUND_WIDTH_HALF = GROUND_WIDTH / 2;
export const WALL_THICKNESS = 100;
export const WALL_THICKNESS_HALF = WALL_THICKNESS / 2;
export const FRAME_HEIGHT = 20;

export const createEnvironment = (scene: Scene) => {
  // 物理演算用の静的オブジェクト
  const ground = Matter.Bodies.rectangle(
    0,
    GROUND_HEIGHT_HALF + WALL_THICKNESS_HALF,
    GROUND_WIDTH,
    WALL_THICKNESS,
    { isStatic: true }
  );

  const leftWall = Matter.Bodies.rectangle(
    -GROUND_WIDTH_HALF - WALL_THICKNESS_HALF,
    0,
    WALL_THICKNESS,
    GROUND_HEIGHT,
    { isStatic: true }
  );

  const rightWall = Matter.Bodies.rectangle(
    GROUND_WIDTH_HALF + WALL_THICKNESS_HALF,
    0,
    WALL_THICKNESS,
    GROUND_HEIGHT,
    { isStatic: true }
  );

  // 床オブジェクトをシーンに追加
  const groundMesh = new Mesh(
    new PlaneGeometry(5000, 5000),
    new MeshPhongMaterial({ color: 0xbbbbbb, depthWrite: false })
  );
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  groundMesh.position.y = -GROUND_HEIGHT_HALF - FRAME_HEIGHT;
  scene.add(groundMesh);

  const grid = new GridHelper(5000, 10, 0x000000, 0x000000);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  grid.position.y = -GROUND_HEIGHT_HALF - FRAME_HEIGHT;
  scene.add(grid);

  return {
    ground,
    leftWall,
    rightWall,
  };
};
