import { GlbLoader } from "@/components/glb-loader";
import AsobiCover from "@/app/asobi/components/cover";
import data from "@/data/asobi.json";

/**
 * モデルを表示するサンプル
 * @returns
 */
export default function GlbSample1() {
  return (
    <AsobiCover title={data[0].title} description={data[0].description}>
      <GlbLoader />
    </AsobiCover>
  );
}
