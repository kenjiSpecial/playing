import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Cover({
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
    <div className="relative w-full h-svh flex items-center justify-center">
      {/* children */}
      {children}
      <div className="absolute inset-0  pointer-events-none">
        <div className="absolute top-0 left-0 p-4">
          <h1 className="text-2xl font-bold text-white mb-2 pointer-events-auto select-none">
            {title}
          </h1>
          <p className="text-white/90 text-sm pointer-events-auto select-none">
            {description}
          </p>
        </div>
        <div className="absolute bottom-4 left-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-white hover:bg-black/20 pointer-events-auto select-none"
            asChild
          >
            <Link href="/" className="pointer-events-auto select-none">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
