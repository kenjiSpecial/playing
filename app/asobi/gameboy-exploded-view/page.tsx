import { GlbLoader } from "@/components/glb-loader";
import AsobiTemplate from "@/app/asobi/template";
import data from "@/data/asobi.json";

/**
 * モデルを表示するサンプル
 * @returns
 */
export default function GlbSample1() {
  return (
    <AsobiTemplate title={data[0].title} description={data[0].description}>
      <GlbLoader />
    </AsobiTemplate>
  );
}
