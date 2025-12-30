import Banners from "@/components/productPage/banner/Banners";
import type { Banner } from "@/types/banner.type";

interface MainBannerProps {
  banners: Banner[];
}

export default function MainBanner({ banners }: MainBannerProps) {
  return (
    <div className="mb-2">
      <Banners banners={banners} />
    </div>
  );
}
