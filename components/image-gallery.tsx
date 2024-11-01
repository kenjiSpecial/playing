import Image from "next/image";

export default function Component() {
  const images = [
    {
      src: "/placeholder.svg?height=300&width=400",
      alt: "Image 1",
      width: 400,
      height: 300,
    },
    {
      src: "/placeholder.svg?height=400&width=300",
      alt: "Image 2",
      width: 300,
      height: 400,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Image Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <Image
              src={image.src}
              alt={image.alt}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
