import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0807] text-[#faf5ef] px-4 text-center">
      <div className="h-12 w-12 rounded-2xl bg-[#ff5722]/15 border border-[#ff5722]/40 text-[#ff5722] flex items-center justify-center text-xl font-bold mb-4">
        404
      </div>
      <h1 className="text-2xl sm:text-3xl font-black mb-2">Page Not Found</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        The requested intelligence workstation or page does not exist or has been relocated.
      </p>
      <Link
        href="/"
        className="btn-tactile inline-flex items-center gap-2 rounded-xl bg-[#ff5722] text-[#1a0a04] px-4 py-2 text-xs font-bold shadow-lg shadow-[#ff5722]/25"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
}
