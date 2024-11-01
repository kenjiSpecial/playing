import { GlbLoader } from "@/components/glb-loader";
import AsobiLayout from "@/app/asobi/layout";
import data from "@/data/asobi.json";

/**
 * モデルを表示するサンプル
 * @returns
 */
export default function GlbSample1() {
  return (
    <AsobiLayout title={data[0].title} description={data[0].description}>
      <GlbLoader />
    </AsobiLayout>
  );
}
