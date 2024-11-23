import { FlyingRocket } from "@/app/asobi/bitcoin-rocket/components/flying-rocket";
import AsobiCover from "@/app/asobi/components/cover";
import data from "@/data/asobi.json";

/**
 * モデルを表示するサンプル
 * @returns
 */
export default function GlbSample1() {
  const { title, description } = data[3];
  return (
    <AsobiCover title={title} description={description}>
      <FlyingRocket />
    </AsobiCover>
  );
}
