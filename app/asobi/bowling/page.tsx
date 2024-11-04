import { BowlingGame } from "@/components/bowling-game";
import AsobiCover from "@/app/asobi/components/cover";
import data from "@/data/asobi.json";

/**
 * モデルを表示するサンプル
 * @returns
 */
export default function GlbSample1() {
  return (
    <AsobiCover title={data[1].title} description={data[1].description}>
      <BowlingGame />
    </AsobiCover>
  );
}
