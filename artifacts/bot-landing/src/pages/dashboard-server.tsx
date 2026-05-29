import { useState } from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ShieldAlert, ArrowLeft, LogOut, Shield, MessageSquare,
  Hash, Plus, X, Save, Smile, AlertTriangle, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useGetMe, useGetGuildSettings, useUpdateGuildSettings, useAddBannedWord, useRemoveBannedWord, useGetReactionRoles } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function DashboardServer() {
  const { guildId } = useParams<{ guildId: string }>();
  const { toast } = useToast();
  const [newWord, setNewWord] = useState("");

  const { data: me } = useGetMe();
  const { data: settings, isLoading } = useGetGuildSettings(guildId!);
  const { data: reactionRoles } = useGetReactionRoles(guildId!);

  const updateSettings = useUpdateGuildSettings();
  const addWord = useAddBannedWord();
  const removeWord = useRemoveBannedWord();

  const handleToggle = (key: string, value: boolean) => {
    updateSettings.mutate(
      { guildId: guildId!, data: { [key]: value } },
      {
        onSuccess: () => toast({ title: "Saved!", description: "Settings updated." }),
        onError: () => toast({ title: "Error", description: "Failed to save.", variant: "destructive" }),
      }
    );
  };

  const handleSlider = (key: string, value: number) => {
    updateSettings.mutate(
      { guildId: guildId!, data: { [key]: value } },
      {
        onSuccess: () => toast({ title: "Saved!", description: "Settings updated." }),
        onError: () => toast({ title: "Error", description: "Failed to save.", variant: "destructive" }),
      }
    );
  };

  const handleAddWord = () => {
    if (!newWord.trim()) return;
    addWord.mutate(
      { guildId: guildId!, data: { word: newWord.trim() } },
      {
        onSuccess: () => {
          setNewWord("");
          toast({ title: "Word added" });
        },
        onError: () => toast({ title: "Error", description: "Failed to add word.", variant: "destructive" }),
      }
    );
  };

  const handleRemoveWord = (word: string) => {
    removeWord.mutate(
      { guildId: guildId!, word },
      { onError: () => toast({ title: "Error", description: "Failed to remove word.", variant: "destructive" }) }
    );
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/dashboard/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Servers</span>
            </Link>
            <span className="text-white/20">/</span>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Settings</span>
            </div>
          </div>
          {me && (
            <div className="flex items-center gap-3">
              <img src={me.avatarUrl} alt={me.username} className="w-8 h-8 rounded-full border border-white/10" />
              <Button size="sm" variant="ghost" onClick={handleLogout} className="gap-1.5 text-muted-foreground">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-28 pb-16 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display mb-1">Server Settings</h1>
          <p className="text-muted-foreground text-sm">Configure SentinelBot for this server.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : settings ? (
          <Tabs defaultValue="automod" className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10 p-1 h-auto gap-1">
              <TabsTrigger value="automod" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Shield className="w-4 h-4" />
                Auto-Mod
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <MessageSquare className="w-4 h-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="words" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <AlertTriangle className="w-4 h-4" />
                Banned Words
              </TabsTrigger>
              <TabsTrigger value="reactions" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Smile className="w-4 h-4" />
                Reaction Roles
              </TabsTrigger>
            </TabsList>

            {/* AUTO-MOD TAB */}
            <TabsContent value="automod" className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-xl border border-white/10 divide-y divide-white/5">
                {/* Master toggle */}
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Auto-Moderation</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Enable or disable all auto-mod features</p>
                  </div>
                  <Switch
                    checked={settings.autoModEnabled}
                    onCheckedChange={(v) => handleToggle("autoModEnabled", v)}
                  />
                </div>

                {/* Max mentions */}
                <div className="p-5 space-y-3 opacity-100 transition-opacity" style={{ opacity: settings.autoModEnabled ? 1 : 0.4 }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium text-sm">Max Mentions</p>
                    </div>
                    <Badge variant="secondary">{settings.maxMentions}</Badge>
                  </div>
                  <Slider
                    min={1} max={20} step={1}
                    value={[settings.maxMentions]}
                    onValueCommit={([v]) => handleSlider("maxMentions", v)}
                    disabled={!settings.autoModEnabled}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Messages with more than this many mentions will be deleted.</p>
                </div>

                {/* Max emojis */}
                <div className="p-5 space-y-3 transition-opacity" style={{ opacity: settings.autoModEnabled ? 1 : 0.4 }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smile className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium text-sm">Max Emojis</p>
                    </div>
                    <Badge variant="secondary">{settings.maxEmojis}</Badge>
                  </div>
                  <Slider
                    min={1} max={30} step={1}
                    value={[settings.maxEmojis]}
                    onValueCommit={([v]) => handleSlider("maxEmojis", v)}
                    disabled={!settings.autoModEnabled}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Messages with more than this many emojis will be deleted.</p>
                </div>

                {/* Caps ratio */}
                <div className="p-5 space-y-3 transition-opacity" style={{ opacity: settings.autoModEnabled ? 1 : 0.4 }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium text-sm">Max Caps %</p>
                    </div>
                    <Badge variant="secondary">{settings.maxCapsRatio}%</Badge>
                  </div>
                  <Slider
                    min={30} max={100} step={5}
                    value={[settings.maxCapsRatio]}
                    onValueCommit={([v]) => handleSlider("maxCapsRatio", v)}
                    disabled={!settings.autoModEnabled}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Messages where more than this % are uppercase will be deleted.</p>
                </div>
              </motion.div>
            </TabsContent>

            {/* MESSAGES TAB */}
            <TabsContent value="messages" className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-xl border border-white/10 divide-y divide-white/5">
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Welcome Messages</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Send a message when a member joins</p>
                  </div>
                  <Switch
                    checked={settings.welcomeEnabled}
                    onCheckedChange={(v) => handleToggle("welcomeEnabled", v)}
                  />
                </div>

                <div className="p-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Goodbye Messages</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Send a message when a member leaves</p>
                  </div>
                  <Switch
                    checked={settings.goodbyeEnabled}
                    onCheckedChange={(v) => handleToggle("goodbyeEnabled", v)}
                  />
                </div>
              </motion.div>

              <div className="glass-panel rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                <span className="text-primary font-medium">Tip:</span> Messages are sent to your server's System Channel. Set it in Discord: Server Settings → Overview → System Messages Channel.
              </div>
            </TabsContent>

            {/* BANNED WORDS TAB */}
            <TabsContent value="words" className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-xl border border-white/10 p-5 space-y-4">
                <div>
                  <p className="font-semibold mb-1">Banned Words</p>
                  <p className="text-sm text-muted-foreground">Messages containing these words will be auto-deleted.</p>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a word..."
                    value={newWord}
                    onChange={e => setNewWord(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddWord()}
                    className="bg-white/5 border-white/10"
                  />
                  <Button onClick={handleAddWord} disabled={!newWord.trim() || addWord.isPending} className="gap-1.5 shrink-0">
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>

                {settings.bannedWords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {settings.bannedWords.map(word => (
                      <Badge
                        key={word}
                        variant="secondary"
                        className="gap-1.5 pr-1 pl-3 py-1.5 text-sm bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                      >
                        {word}
                        <button
                          onClick={() => handleRemoveWord(word)}
                          className="w-4 h-4 rounded-full hover:bg-red-500/30 flex items-center justify-center transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No banned words added yet.</p>
                )}
              </motion.div>
            </TabsContent>

            {/* REACTION ROLES TAB */}
            <TabsContent value="reactions" className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-xl border border-white/10 p-5 space-y-4">
                <div>
                  <p className="font-semibold mb-1">Reaction Roles</p>
                  <p className="text-sm text-muted-foreground">Roles automatically assigned when members react to a message.</p>
                </div>

                {reactionRoles && reactionRoles.length > 0 ? (
                  <div className="space-y-2">
                    {reactionRoles.map(rr => (
                      <div key={rr.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-2xl">{rr.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">Role ID: {rr.roleId}</p>
                          <p className="text-xs text-muted-foreground truncate">Message: {rr.messageId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <Smile className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">No reaction roles set up yet.</p>
                    <p className="text-xs text-muted-foreground">Use <code className="bg-white/10 px-1.5 py-0.5 rounded">!reactionrole create</code> in Discord to create a panel.</p>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="glass-panel rounded-xl p-10 text-center border border-white/10">
            <p className="text-muted-foreground">Could not load settings. Please try again.</p>
          </div>
        )}
      </main>
    </div>
  );
}
