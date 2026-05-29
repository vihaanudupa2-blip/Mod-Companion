import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { Button } from "@/components/ui/button";

export default function DashboardLogin() {
  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-panel rounded-2xl p-10 border border-white/10 text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-display">
              Sentinel<span className="text-primary">Bot</span> Dashboard
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sign in with Discord to manage your servers — configure auto-mod, banned words, welcome messages, and more.
            </p>
          </div>

          <Button
            onClick={handleLogin}
            size="lg"
            className="w-full h-12 gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold shadow-lg shadow-[#5865F2]/25"
          >
            <SiDiscord className="w-5 h-5" />
            Sign in with Discord
          </Button>

          <p className="text-xs text-muted-foreground">
            Only servers where you have the <span className="text-foreground font-medium">Manage Server</span> permission will appear.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
