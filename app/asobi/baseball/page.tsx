import { BaseballGame } from "@/app/asobi/baseball/components/baseball-game";
import AsobiCover from "@/app/asobi/components/cover";
import data from "@/data/asobi.json";

/**
 * モデルを表示するサンプル
 * @returns
 */
export default function Page() {
  return (
    <AsobiCover title={data[2].title} description={data[2].description}>
      <BaseballGame />
    </AsobiCover>
  );
}
