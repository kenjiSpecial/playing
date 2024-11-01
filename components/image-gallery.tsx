import Image from "next/image";
import Link from "next/link";

export default function Component() {
  const images = [
    {
      src: "/assets/images/asobi/glb-sample1/thumbnail.png",
      alt: "Image 1",
      width: 640,
      height: 360,
      link: "/asobi/glb-sample1",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Image Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-video overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <Link href={image.link}>
              <Image
                src={image.src}
                alt={image.alt}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 hover:scale-105"
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
