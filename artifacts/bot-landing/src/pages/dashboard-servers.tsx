import { motion } from "framer-motion";
import { Link } from "wouter";
import { ShieldAlert, Settings, Plus, LogOut, ChevronRight } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useGetMe, useGetDashboardGuilds } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

const INVITE_LINK =
  "https://discord.com/oauth2/authorize?client_id=1509885542966366319&permissions=1099511893078&scope=bot";

function GuildCard({ guild }: { guild: { id: string; name: string; iconUrl?: string | null; botPresent: boolean } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-5 border border-white/10 hover:border-primary/40 transition-colors flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-white/10 flex items-center justify-center">
        {guild.iconUrl ? (
          <img src={guild.iconUrl} alt={guild.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl font-bold text-foreground/60">{guild.name[0]}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{guild.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {guild.botPresent ? (
            <span className="text-green-400">● Bot active</span>
          ) : (
            <span className="text-yellow-400">● Bot not in server</span>
          )}
        </p>
      </div>

      {guild.botPresent ? (
        <Link href={`/dashboard/server/${guild.id}`}>
          <Button size="sm" variant="outline" className="gap-1.5 border-white/15 hover:bg-white/5 shrink-0">
            <Settings className="w-3.5 h-3.5" />
            Manage
          </Button>
        </Link>
      ) : (
        <a href={`${INVITE_LINK}&guild_id=${guild.id}`} target="_blank" rel="noreferrer">
          <Button size="sm" className="gap-1.5 bg-primary/80 hover:bg-primary shrink-0">
            <Plus className="w-3.5 h-3.5" />
            Add Bot
          </Button>
        </a>
      )}
    </motion.div>
  );
}

export default function DashboardServers() {
  const { data: me, isLoading: meLoading } = useGetMe();
  const { data: guilds, isLoading: guildsLoading } = useGetDashboardGuilds();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/dashboard/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <span className="font-display font-bold tracking-tight">
              Sentinel<span className="text-primary">Bot</span>
            </span>
          </Link>

          {meLoading ? (
            <Skeleton className="h-8 w-32 rounded-full" />
          ) : me ? (
            <div className="flex items-center gap-3">
              <img
                src={me.avatarUrl}
                alt={me.username}
                className="w-8 h-8 rounded-full border border-white/10"
              />
              <span className="text-sm font-medium hidden sm:block">{me.username}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : null}
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-28 pb-16 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display mb-1">Your Servers</h1>
          <p className="text-muted-foreground text-sm">
            Select a server to configure SentinelBot.
          </p>
        </div>

        {guildsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : guilds && guilds.length > 0 ? (
          <div className="space-y-3">
            {guilds.map((guild) => (
              <GuildCard key={guild.id} guild={guild} />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-xl p-10 text-center border border-white/10 space-y-4">
            <SiDiscord className="w-10 h-10 text-muted-foreground mx-auto" />
            <div>
              <p className="font-semibold">No servers found</p>
              <p className="text-sm text-muted-foreground mt-1">
                You need to be an admin of a server to manage it here.
              </p>
            </div>
            <a href={INVITE_LINK} target="_blank" rel="noreferrer">
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                Add to a Server
              </Button>
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
