import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ShieldAlert, ArrowLeft, Shield, Search, Smile,
  MessageSquare, Zap, Hash, Users, Trash2, Clock,
  AlertTriangle, ChevronRight
} from "lucide-react";

const INVITE_LINK =
  "https://discord.com/oauth2/authorize?client_id=1509885542966366319&permissions=1099780328534&scope=bot";

const CATEGORIES = [
  {
    icon: Shield,
    label: "Moderation",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    glow: "rgba(239,68,68,0.15)",
    commands: [
      {
        name: "!ban",
        usage: "!ban @user [reason]",
        description: "Permanently bans a member from the server. The bot DMs them the reason before banning.",
        perms: "Moderator",
      },
      {
        name: "!kick",
        usage: "!kick @user [reason]",
        description: "Kicks a member from the server. They can rejoin with an invite.",
        perms: "Moderator",
      },
      {
        name: "!mute",
        usage: "!mute @user [minutes] [reason]",
        description: "Times out a member. Default is 10 minutes, max is 40,320 minutes (28 days). The bot DMs them the reason.",
        perms: "Moderator",
      },
      {
        name: "!unmute",
        usage: "!unmute @user",
        description: "Removes an active timeout from a member, restoring their ability to send messages.",
        perms: "Moderator",
      },
      {
        name: "!warn",
        usage: "!warn @user [reason]",
        description: "Issues a formal warning to a member. Warnings are tracked and viewable with !warnings.",
        perms: "Moderator",
      },
      {
        name: "!warnings",
        usage: "!warnings @user",
        description: "Displays all recorded warnings for a member, including dates and reasons.",
        perms: "Moderator",
      },
      {
        name: "!clearwarnings",
        usage: "!clearwarnings @user",
        description: "Clears all warnings on record for a member. This action is irreversible.",
        perms: "Admin only",
      },
      {
        name: "!purge",
        usage: "!purge <1–100>",
        description: "Bulk-deletes the specified number of recent messages in the current channel.",
        perms: "Moderator",
      },
      {
        name: "!slowmode",
        usage: "!slowmode <0–21600>",
        description: "Sets a slowmode delay in seconds on the current channel. Use 0 to turn it off. Max is 21600 (6 hours).",
        perms: "Moderator",
      },
    ],
  },
  {
    icon: Search,
    label: "Info",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "rgba(59,130,246,0.15)",
    commands: [
      {
        name: "!userinfo",
        usage: "!userinfo [@user]",
        description: "Displays an info embed for a member: join date, account age, roles, warnings, and mute status. Omit @user to view your own.",
        perms: "Anyone",
      },
      {
        name: "!help",
        usage: "!help",
        description: "Shows a summary of all available commands and their usage in a Discord embed.",
        perms: "Anyone",
      },
    ],
  },
  {
    icon: Smile,
    label: "Reaction Roles",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    glow: "rgba(88,101,242,0.15)",
    commands: [
      {
        name: "!reactionrole create",
        usage: "!reactionrole create",
        description: "Posts a reaction role panel in the current channel. Copy the message ID it returns for the next steps.",
        perms: "Admin only",
      },
      {
        name: "!reactionrole add",
        usage: "!reactionrole add <emoji> @role <messageId>",
        description: "Links an emoji to a role on a specific panel message. The bot auto-reacts to show users what to click.",
        perms: "Admin only",
      },
      {
        name: "!reactionrole list",
        usage: "!reactionrole list",
        description: "Lists all active reaction role mappings for the server, including emoji, role, and message ID.",
        perms: "Admin only",
      },
      {
        name: "!reactionrole remove",
        usage: "!reactionrole remove <messageId> <emoji>",
        description: "Removes a specific emoji-role mapping from a panel message.",
        perms: "Admin only",
      },
    ],
  },
  {
    icon: Zap,
    label: "Auto-Moderation",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    glow: "rgba(234,179,8,0.15)",
    description:
      "These run automatically on every message. No command needed. Moderators and Admins are always exempt. Configure thresholds in the Dashboard.",
    commands: [
      {
        name: "Bad Words Filter",
        usage: "Automatic",
        description:
          "Deletes messages containing built-in banned words (profanity, slurs, scam phrases) plus any custom words set in the Dashboard. Issues a warning.",
        perms: "Automatic",
      },
      {
        name: "Invite Link Filter",
        usage: "Automatic",
        description:
          "Deletes any message containing a discord.gg invite link. Helps prevent server raiding or spam.",
        perms: "Automatic",
      },
      {
        name: "Anti-Spam",
        usage: "Automatic",
        description:
          "Deletes messages if a user sends more than 5 messages in 4 seconds. Stops raid bots and fast-spammers.",
        perms: "Automatic",
      },
      {
        name: "Duplicate Spam",
        usage: "Automatic",
        description:
          "Deletes messages if the same content is sent 3 or more times within 5 seconds by the same user.",
        perms: "Automatic",
      },
      {
        name: "Mention Limit",
        usage: "Automatic",
        description:
          "Deletes messages that mention more than the configured max number of users/roles (default: 5). Issues a warning.",
        perms: "Automatic",
      },
      {
        name: "Caps Limit",
        usage: "Automatic",
        description:
          "Deletes messages where more than the configured % of letters are uppercase (default: 70%) in messages longer than 10 characters.",
        perms: "Automatic",
      },
      {
        name: "Emoji Limit",
        usage: "Automatic",
        description:
          "Deletes messages containing more than the configured max number of emojis (default: 10).",
        perms: "Automatic",
      },
    ],
  },
  {
    icon: MessageSquare,
    label: "Welcome & Goodbye",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    glow: "rgba(34,197,94,0.15)",
    description:
      "Fully automatic. Configure messages and toggle on/off per server in the Dashboard.",
    commands: [
      {
        name: "Welcome Message",
        usage: "Automatic — on member join",
        description:
          "Sends a message when a new member joins. Uses your custom text if set, or a default embed. Supports {user} and {server} placeholders.",
        perms: "Automatic",
      },
      {
        name: "Goodbye Message",
        usage: "Automatic — on member leave",
        description:
          "Sends a message when a member leaves the server. Uses your custom text if set, or a default embed. Supports {user} and {server} placeholders.",
        perms: "Automatic",
      },
    ],
  },
];

const PERM_COLORS: Record<string, string> = {
  "Anyone": "bg-green-500/10 text-green-400 border-green-500/20",
  "Moderator": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Admin only": "bg-red-500/10 text-red-400 border-red-500/20",
  "Automatic": "bg-primary/10 text-primary border-primary/20",
};

export default function Commands() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg tracking-tight">
              Sentinel<span className="text-primary">Bot</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <a
              href={INVITE_LINK}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-colors"
            >
              Add to Server
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-12 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
              <Hash className="w-4 h-4" />
              Command Reference
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight">
              All Commands
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
              Every command SentinelBot offers, organized by category. All commands work as both{" "}
              <code className="bg-primary/20 text-primary px-2 py-0.5 rounded font-mono text-sm">/slash</code>{" "}
              and{" "}
              <code className="bg-white/10 px-2 py-0.5 rounded text-foreground font-mono text-sm">!prefix</code>{" "}
              commands.
            </p>
          </motion.div>

          {/* Quick jump pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-wrap gap-2 mt-8"
          >
            {CATEGORIES.map((cat) => (
              <a
                key={cat.label}
                href={`#${cat.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors hover:opacity-80 ${cat.bg} ${cat.border} ${cat.color}`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 pb-24">
        <div className="container mx-auto max-w-4xl space-y-10">
          {CATEGORIES.map((cat, ci) => (
            <motion.div
              key={cat.label}
              id={cat.label.toLowerCase().replace(/\s+/g, "-")}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: ci * 0.05 }}
            >
              {/* Category header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${cat.bg} ${cat.border}`}>
                  <cat.icon className={`w-5 h-5 ${cat.color}`} />
                </div>
                <h2 className="text-xl font-bold font-display">{cat.label}</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cat.bg} ${cat.border} ${cat.color}`}>
                  {cat.commands.length} {cat.commands.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              {cat.description && (
                <p className="text-sm text-muted-foreground mb-4 pl-12">{cat.description}</p>
              )}

              {/* Command cards */}
              <div className="glass-panel rounded-2xl border border-white/10 divide-y divide-white/5">
                {cat.commands.map((cmd, i) => (
                  <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="text-sm font-mono font-bold text-foreground bg-white/8 px-2.5 py-1 rounded-md border border-white/10">
                          {cmd.usage}
                        </code>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${PERM_COLORS[cmd.perms] ?? "bg-white/5 text-muted-foreground border-white/10"}`}>
                          {cmd.perms}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {cmd.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center space-y-4"
          >
            <h3 className="text-2xl font-bold font-display">Ready to try it out?</h3>
            <p className="text-muted-foreground">Add SentinelBot to your server and start moderating in seconds.</p>
            <a
              href={INVITE_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-colors shadow-lg shadow-primary/20"
            >
              Add to Discord
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 bg-black/80">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg tracking-tight">SentinelBot</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground flex gap-8">
            <Link href="/commands" className="hover:text-primary transition-colors">Commands</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SentinelBot. Not affiliated with Discord.
          </p>
        </div>
      </footer>
    </div>
  );
}
