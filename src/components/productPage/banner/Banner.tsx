import type { Banner } from "@/types/banner.type";

export default function Banner({ banner }: { banner: Banner }) {
  return (
    <div className="w-full max-w-full aspect-[14/2.5] sm:aspect-[8/1.25] max-h-64 rounded-lg overflow-hidden bg-gray-100">
      <a href={banner.link_url} key={banner.id} className="w-full h-full block">
        <img
          src={banner.image_url}
          alt={banner.name}
          className="w-full h-full max-w-full object-contain"
        />
      </a>
    </div>
  );
}
