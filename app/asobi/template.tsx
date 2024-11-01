import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AsobiLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    // full width and height
    <div className="relative w-full h-full">
      {/* children */}
      {children}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
        <div className="absolute top-4 left-4">
          <h1 className="text-2xl font-bold text-white mb-2 pointer-events-auto">
            {title}
          </h1>
          <p className="text-white/90 text-sm pointer-events-auto">
            {description}
          </p>
        </div>
        <div className="absolute bottom-4 left-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-white hover:bg-black/20 pointer-events-auto"
            asChild
          >
            <Link href="/" className="pointer-events-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
