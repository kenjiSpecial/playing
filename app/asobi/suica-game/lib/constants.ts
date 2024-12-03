import Matter from "matter-js";
import { Group } from "three";

export const ITEM_TYPE_SIZE = 7;
export type ItemType = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Item = {
  group: Group;
  type: ItemType;
};

export type BODY_ITEM = {
  body: Matter.Body;
  group: Group;
  type: ItemType;
};

export const ITEM_SIZES: Record<ItemType, number> = {
  0: 9,
  1: 14,
  2: 22,
  3: 29,
  4: 40,
  5: 52,
  6: 70,
};

export const ITEM_MASS: Record<ItemType, number> = {
  0: 1,
  1: 1,
  2: 5,
  3: 2.5,
  4: 1,
  5: 0.5,
  6: 0.25,
};

export const PLAYER_WIDTH = 40;
export const PLAYER_WIDTH_HALF = PLAYER_WIDTH / 2;
export const PLAYER_HEIGHT = 20;
export const PLAYER_HEIGHT_HALF = PLAYER_HEIGHT / 2;
export const PLAYER_DEPTH = 20;
