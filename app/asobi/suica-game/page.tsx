import AsobiCover from "@/app/asobi/components/cover";
import data from "@/data/asobi.json";
import PhysicsScene from "./components/PhysicsScene";

/**
 * モデルを表示するサンプル
 * @returns
 */
export default function GlbSample1() {
  const { title, description } = data[5];

  return (
    <AsobiCover title={title} description={description}>
      <PhysicsScene />
    </AsobiCover>
  );
}
