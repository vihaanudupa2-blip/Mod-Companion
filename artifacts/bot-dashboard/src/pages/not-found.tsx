import { ShieldAlert } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-primary mx-auto" />
        <h1 className="text-2xl font-bold font-display">Page Not Found</h1>
        <p className="text-muted-foreground text-sm">This page doesn't exist.</p>
        <Link href="/" className="inline-block text-primary hover:underline text-sm">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
