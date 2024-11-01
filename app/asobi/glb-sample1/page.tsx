import { GlbLoader } from "@/components/glb-loader";
import AsobiLayout from "@/app/asobi/layout";

/**
 * モデルを表示するサンプル
 * @returns
 */
export default function GlbSample1() {
  return (
    <AsobiLayout>
      <GlbLoader />
    </AsobiLayout>
  );
}
