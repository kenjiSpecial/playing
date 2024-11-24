import { MoneyPrinter } from "@/app/asobi/money-printer/components/money-printer";
import AsobiCover from "@/app/asobi/components/cover";
import data from "@/data/asobi.json";

/**
 * モデルを表示するサンプル
 * @returns
 */
export default function GlbSample1() {
  const { title, description } = data[4];
  return (
    <AsobiCover title={title} description={description}>
      <MoneyPrinter />
    </AsobiCover>
  );
}
