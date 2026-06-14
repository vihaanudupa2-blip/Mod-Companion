import { Link } from "wouter";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const SECTIONS = [
  {
    title: "Introduction",
    content: `Thank you for using U-bot. This Privacy Policy explains what information U-bot collects, how it is used, and how it is protected.

By using U-bot, you agree to the collection and use of information in accordance with this policy.`,
  },
  {
    title: "Information We Collect",
    content: "U-bot may collect and store the following information:",
    list: [
      "Discord User IDs",
      "Discord Server IDs",
      "Discord Channel IDs",
      "Discord Role IDs",
      "Command usage data",
      "Moderation records (warnings, mutes, bans, and logs)",
      "Configuration settings required for bot functionality",
    ],
    footer:
      "U-bot does not collect passwords, payment information, or private messages unless explicitly required by a feature and permitted by Discord.",
  },
  {
    title: "How Information Is Used",
    content: "Collected information is used solely to:",
    list: [
      "Provide bot functionality",
      "Store server settings",
      "Manage moderation systems",
      "Improve performance and reliability",
      "Prevent abuse and misuse",
    ],
  },
  {
    title: "Data Sharing",
    content:
      "U-bot does not sell, rent, or share user data with third parties except when required by law.",
  },
  {
    title: "Data Retention",
    content:
      "Data is stored only as long as necessary for the operation of U-bot. Server administrators may request removal of server-specific data when applicable.",
  },
  {
    title: "Security",
    content:
      "Reasonable measures are taken to protect stored information. However, no system can guarantee absolute security.",
  },
  {
    title: "Changes to This Policy",
    content:
      "This Privacy Policy may be updated at any time. Continued use of U-bot after updates constitutes acceptance of the revised policy.",
  },
  {
    title: "Contact",
    content:
      "For questions regarding this Privacy Policy, please contact the U-bot development team through the official support server.",
  },
];

export default function Privacy() {
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
              Privacy Policy
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
