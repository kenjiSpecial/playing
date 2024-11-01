import Image from "next/image";
import Link from "next/link";
import images from "@/data/asobi.json";
export default function Component() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        あそびば - Asobiba -
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((artwork, index) => (
          <div
            key={index}
            className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <Link href={artwork.link}>
              <div className="relative aspect-video">
                <Image
                  src={artwork.src}
                  alt={artwork.alt}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h2
                  className="text-lg md:text-xl font-semibold text-gray-800 truncate"
                  title={artwork.title}
                >
                  {artwork.title}
                </h2>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
