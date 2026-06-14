import { Link } from "wouter";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    content: `By inviting U-bot to your Discord server or interacting with it in any way, you agree to be bound by these Terms of Service. If you do not agree to these terms, please remove U-bot from your server immediately.

These terms apply to all users, server administrators, and any other parties who interact with U-bot.`,
  },
  {
    title: "Description of Service",
    content:
      "U-bot is a Discord bot that provides server moderation, auto-moderation, member management, welcome/goodbye messages, reaction roles, and related utility features. The service is provided free of charge and is subject to change at any time without prior notice.",
  },
  {
    title: "Acceptable Use",
    content: "You agree NOT to use U-bot to:",
    list: [
      "Violate Discord's Terms of Service or Community Guidelines",
      "Harass, threaten, or harm other users",
      "Conduct illegal activities of any kind",
      "Attempt to exploit, reverse engineer, or abuse the bot",
      "Spam or flood the bot with commands in a way that degrades service",
      "Use the bot to collect, store, or distribute user data beyond its intended purpose",
    ],
    footer:
      "Violation of these terms may result in your server or user account being blacklisted from using U-bot.",
  },
  {
    title: "Server Administrator Responsibility",
    content:
      "Server administrators who invite U-bot are responsible for ensuring it is configured appropriately for their community. Administrators are responsible for how the bot is used in their server and must ensure their members are aware of any moderation features in use, including auto-moderation and logging.",
  },
  {
    title: "Data and Privacy",
    content:
      "Your use of U-bot is also governed by our Privacy Policy. By using U-bot, you consent to the data practices described in that policy. U-bot stores only the minimum data necessary to provide its features, including server settings and moderation records.",
  },
  {
    title: "Availability and Uptime",
    content:
      "U-bot is provided on a best-effort basis. We do not guarantee continuous, uninterrupted availability. The bot may go offline for maintenance, updates, or other reasons at any time. We are not liable for any consequences resulting from downtime or unavailability.",
  },
  {
    title: "Disclaimer of Warranties",
    content:
      'U-bot is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the bot will be error-free, secure, or free from harmful components. You use U-bot entirely at your own risk.',
  },
  {
    title: "Limitation of Liability",
    content:
      "To the maximum extent permitted by law, the U-bot development team shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the bot, even if we have been advised of the possibility of such damages.",
  },
  {
    title: "Termination",
    content:
      "We reserve the right to restrict or terminate access to U-bot for any server or user at any time, with or without notice, for conduct that we believe violates these Terms of Service or is otherwise harmful to other users, the service, or third parties.",
  },
  {
    title: "Changes to These Terms",
    content:
      "These Terms of Service may be updated at any time. Continued use of U-bot following any changes constitutes acceptance of the revised terms. It is your responsibility to review these terms periodically.",
  },
  {
    title: "Contact",
    content:
      "If you have questions about these Terms of Service, please contact the U-bot development team through the official support server.",
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ShieldAlert className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg tracking-tight">
              Sentinel<span className="text-primary">Bot</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-12 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto max-w-3xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
              <ShieldAlert className="w-4 h-4" />
              Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-base">
              Last Updated:{" "}
              <span className="text-foreground font-medium">June 14, 2026</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 pb-24">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-panel rounded-2xl border border-white/10 divide-y divide-white/5"
          >
            {SECTIONS.map((section, i) => (
              <div key={i} className="p-8 space-y-4">
                <h2 className="text-xl font-bold font-display text-foreground">
                  {section.title}
                </h2>
                {section.content && (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                )}
                {section.list && (
                  <ul className="space-y-2 ml-1">
                    {section.list.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-muted-foreground">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {section.footer && (
                  <p className="text-muted-foreground leading-relaxed border-t border-white/5 pt-4 mt-4">
                    {section.footer}
                  </p>
                )}
              </div>
            ))}
          </motion.div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Have questions?{" "}
            <a href="#" className="text-primary hover:underline">
              Reach out on our support server.
            </a>
          </p>
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
