"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3DEventMap,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Vector2,
  Vector3,
} from "three";
import Matter, { Events } from "matter-js";
import {
  createEnvironment,
  GROUND_HEIGHT_HALF,
  GROUND_WIDTH_HALF,
} from "../lib/environment";
import gsap from "gsap";
import {
  Item,
  ITEM_SIZES,
  ITEM_TYPE_SIZE,
  ItemType,
  BODY_ITEM,
  PLAYER_HEIGHT_HALF,
  PLAYER_WIDTH_HALF,
} from "../lib/constants";
import { MutableRefObject } from "react";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";

const isDebug = false;

export function GameScene() {
  const { scene, camera } = useThree();

  const engineRef = useRef(
    Matter.Engine.create({
      enableSleeping: false,
    })
  );
  const objectsRef = useRef<BODY_ITEM[]>([]);
  const playerRef = useRef<Mesh | null>(null);
  const nextItemRef: React.MutableRefObject<Item | null> = useRef<Item | null>(
    null
  );
  const isFallRef = useRef(false);
  const { scene: cherryObject } = useGLTF("/assets/3d/suica-cherry.glb");
  const { scene: strabberyObject } = useGLTF("/assets/3d/suica-straberry.glb");
  const { scene: pearlObject } = useGLTF("/assets/3d/suica-pearl.glb");
  const { scene: appleObject } = useGLTF("/assets/3d/suica-apple.glb");
  const { scene: pineAppleObject } = useGLTF("/assets/3d/suica-pineapple.glb");
  const { scene: melonObject } = useGLTF("/assets/3d/suica-melon.glb");
  const { scene: watermelonObject } = useGLTF(
    "/assets/3d/suica-watermelon.glb"
  );
  const { scene: frameObject } = useGLTF("/assets/3d/suica-frame.glb");
  const { scene: duckObject } = useGLTF("/assets/3d/suica-duck.glb");

  const gameObjectsRef = useRef<Group[]>([
    cherryObject,
    strabberyObject,
    pearlObject,
    appleObject,
    pineAppleObject,
    melonObject,
    watermelonObject,
  ]);
  const [mousePosition, setMousePosition] = useState(new Vector2());
  const playerMove = useRef(0);

  useEffect(() => {
    if (!scene || !gameObjectsRef.current) return;
    // gameObjectRefがすべてあるか確認、なければreturnする
    gameObjectsRef.current.forEach((obj) => {
      if (!obj) {
        return;
      }
    });

    const engine = engineRef.current;
    const world = engine.world;
    const runner = Matter.Runner.create({
      isFixed: true,
      delta: 1000 / 60,
    });
    Matter.Runner.run(runner, engine);
    scene.add(frameObject);
    frameObject.position.y = -GROUND_HEIGHT_HALF;
    const { ground, leftWall, rightWall } = createEnvironment(scene);
    Matter.World.add(world, [ground, leftWall, rightWall]);

    // addnextItem
    addItem(scene, gameObjectsRef.current, nextItemRef, isFallRef);

    Events.on(engine, "collisionStart", function (event) {
      const pairs = event.pairs;
      pairs.forEach(function (pair) {
        const { bodyA, bodyB } = pair;

        if (bodyA.label === bodyB.label) {
          Matter.World.remove(world, bodyA);
          Matter.World.remove(world, bodyB);

          objectsRef.current.forEach((obj) => {
            if (obj.body === bodyA || obj.body === bodyB) {
              scene.remove(obj.group);
            }
          });
          objectsRef.current = objectsRef.current.filter(
            (obj) => obj.body !== bodyA && obj.body !== bodyB
          );

          // ここに衝突時の処理を追加
          const nextlabel = parseInt(bodyA.label) + 1;
          if (nextlabel < ITEM_TYPE_SIZE) {
            // add mesh
            const itemType = nextlabel as ItemType;

            const gameObject = gameObjectsRef.current[nextlabel];
            const clonedObject = SkeletonUtils.clone(gameObject);
            const group = new Group();
            group.add(clonedObject);

            if (isDebug) {
              const geometry = new SphereGeometry(ITEM_SIZES[itemType], 16, 16);
              const mesh = new Mesh(
                geometry,
                new MeshStandardMaterial({
                  color: "white",
                  wireframe: true,
                  transparent: true,
                  opacity: 0.1,
                })
              );
              group.add(mesh);
            }
            scene.add(group);

            const posX = (bodyA.position.x + bodyB.position.x) / 2;
            const posY =
              (bodyA.position.y + bodyB.position.y) / 2 - ITEM_SIZES[itemType];

            const nextItemBody = Matter.Bodies.circle(
              posX,
              posY,
              ITEM_SIZES[itemType],
              {
                restitution: 0.6,
                friction: 0.1,
                // mass: ITEM_MASS[itemType],
                label: nextlabel.toString(),
              }
            );
            Matter.World.add(world, [nextItemBody]);
            objectsRef.current.push({
              body: nextItemBody,
              group: group,
              type: itemType,
            });
          }
        }
        // ここに衝突時の処理を追加
      });
    });

    // イベントハンドラーの定義
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      setMousePosition(
        new Vector2(
          (clientX / window.innerWidth) * 2 - 1,
          -(clientY / window.innerHeight) * 2 + 1
        )
      );
      // 必要に応じて追加の処理をここに記述
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) {
        const { clientX, clientY } = touch;
        setMousePosition(
          new Vector2(
            (clientX / window.innerWidth) * 2 - 1,
            -(clientY / window.innerHeight) * 2 + 1
          )
        );
        // 必要に応じて追加の処理をここに記述
      }
    };

    function fallItem() {
      if (!isFallRef.current && nextItemRef.current) {
        isFallRef.current = true;
        // 落下アニメーション
        const nextItemBody = Matter.Bodies.circle(
          nextItemRef.current.group.position.x,
          -nextItemRef.current.group.position.y,
          ITEM_SIZES[nextItemRef.current.type],
          {
            restitution: 0.6,
            friction: 0.1,
            // mass: ITEM_MASS[nextItemRef.current.type],
            label: nextItemRef.current.type.toString(),
          }
        );

        Matter.World.add(world, [nextItemBody]);
        objectsRef.current.push({
          body: nextItemBody,
          group: nextItemRef.current.group,
          type: nextItemRef.current.type,
        });
        nextItemRef.current = null;

        // 1秒後にアイテムを追加
        gsap.delayedCall(1, addItem, [
          scene,
          gameObjectsRef.current,
          nextItemRef,
          isFallRef,
        ]);

        gsap.to(playerMove, {
          current: -10,
          duration: 0.1,
        });
        gsap.to(playerMove, {
          current: 0,
          duration: 0.1,
          delay: 0.1,
        });
      }
    }

    // 新規追加: マウスアップイベントハンドラー
    const handleMouseUp = () => {
      // 必要に応じて追加の処理をここに記述
      fallItem();
    };

    // 新規追加: タッチエンドイベントハンドラー
    const handleTouchEnd = () => {
      // 必要に応じて追加の処理をここに記述
      fallItem();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("mouseup", handleMouseUp); // 追加
    window.addEventListener("touchend", handleTouchEnd); // 追加

    return () => {
      objectsRef.current.forEach(({ group }) => scene.remove(group));
      Matter.Runner.stop(runner);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleMouseUp); // 追加
      window.removeEventListener("touchend", handleTouchEnd); // 追加
    };
  }, [scene, frameObject]);

  useFrame(() => {
    objectsRef.current.forEach(({ body, group }) => {
      group.position.x = body.position.x;
      group.position.y = -body.position.y;
      group.rotation.z = -body.angle;
    });

    const newobjectPos = calcPlayerPosition(
      mousePosition,
      camera as PerspectiveCamera
    );

    if (playerRef.current) {
      if (newobjectPos.x < -GROUND_WIDTH_HALF + PLAYER_WIDTH_HALF) {
        newobjectPos.x = -GROUND_WIDTH_HALF + PLAYER_WIDTH_HALF;
      } else if (newobjectPos.x > GROUND_WIDTH_HALF - PLAYER_WIDTH_HALF) {
        newobjectPos.x = GROUND_WIDTH_HALF - PLAYER_WIDTH_HALF;
      }
      playerRef.current.position.x = newobjectPos.x;
      playerRef.current.position.y = newobjectPos.y + playerMove.current;
      playerRef.current.position.z = newobjectPos.z;
    }

    if (nextItemRef.current) {
      moveItem(
        newobjectPos,
        nextItemRef.current.group,
        ITEM_SIZES[nextItemRef.current.type]
      );
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      {/* <pointLight position={[0, 10, -10]} intensity={1} /> */}
      <spotLight
        angle={Math.PI}
        castShadow
        decay={0.1}
        intensity={Math.PI}
        penumbra={1}
        position={[0, 200, 100]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      {/* player */}
      <primitive object={duckObject} ref={playerRef} />
    </>
  );
}

// マウス位置を空間のプレイヤーの位置に変換する
function calcPlayerPosition(mousePosition: Vector2, camera: PerspectiveCamera) {
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();

  const playerPosition = new Vector3(
    0,
    GROUND_HEIGHT_HALF + PLAYER_HEIGHT_HALF,
    0
  );
  const renderedPlayerPosition = playerPosition
    .applyMatrix4(camera.matrixWorldInverse)
    .applyMatrix4(camera.projectionMatrix);

  const objectPosition = new Vector3(
    mousePosition.x,
    playerPosition.y,
    renderedPlayerPosition.z
  );

  const newobjectPos = objectPosition
    .applyMatrix4(camera.projectionMatrixInverse)
    .applyMatrix4(camera.matrixWorld);

  return newobjectPos;
}

function moveItem(newobjectPos: Vector3, item: Group, itemHalfSize: number) {
  const itemPosition = newobjectPos
    .clone()
    .add(new Vector3(0, -PLAYER_HEIGHT_HALF - itemHalfSize, 0));
  item.position.copy(itemPosition);
}

function addItem(
  scene: Scene,
  items: Group<Object3DEventMap>[],
  nextItemRef: MutableRefObject<Item | null>,
  isFallRef: MutableRefObject<boolean>
) {
  const itemType = Math.floor((Math.random() * ITEM_TYPE_SIZE) / 3) as ItemType;

  const targetItem = items[itemType];
  const group = new Group();
  const clonedSuicaScene = SkeletonUtils.clone(targetItem);
  group.add(clonedSuicaScene);

  if (isDebug) {
    const geometry = new SphereGeometry(ITEM_SIZES[itemType], 16, 16);
    const material = new MeshStandardMaterial({
      color: "white",
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const debugMesh = new Mesh(geometry, material);
    group.add(debugMesh);
  }

  scene.add(group);
  nextItemRef.current = {
    group,
    type: itemType,
  };

  isFallRef.current = false;
}
