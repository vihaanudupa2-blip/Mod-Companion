import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, 
  Terminal, 
  MessageSquareWarning, 
  Trash2, 
  UserPlus, 
  Zap, 
  ChevronRight,
  Command,
  Activity,
  Lock,
  MessageSquare,
  ShieldCheck,
  Bot
} from "lucide-react";
import { SiDiscord } from "react-icons/si";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const INVITE_LINK = "https://discord.com/oauth2/authorize?client_id=1509885542966366319&permissions=1099511893078&scope=bot";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/30 text-foreground">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg tracking-tight">Sentinel<span className="text-primary">Bot</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#commands" className="hover:text-foreground transition-colors">Commands</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <a href={INVITE_LINK} target="_blank" rel="noreferrer">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <SiDiscord className="w-4 h-4" />
              <span className="hidden sm:inline">Add to Server</span>
            </Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel text-sm text-primary font-medium mb-4 border border-primary/20">
              <Zap className="w-4 h-4" />
              <span>Next-generation server protection</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-bold font-display tracking-tight text-glow leading-tight">
              Control your community <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">with absolute precision.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Auto-moderate bad actors, execute swift commands, and track warnings seamlessly. 
              The ultimate control room for Discord server owners who take their communities seriously.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a href={INVITE_LINK} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 px-8 text-base gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                  <SiDiscord className="w-5 h-5" />
                  Add to Discord
                </Button>
              </a>
              <a href="#commands" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full h-14 px-8 text-base gap-2 border-white/10 hover:bg-white/5">
                  <Terminal className="w-5 h-5" />
                  View Commands
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Social Proof Marquee (Simulated) */}
      <section className="py-10 border-y border-white/5 bg-black/40">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
            <div className="space-y-2">
              <h3 className="text-3xl font-display font-bold text-primary">99.9%</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Uptime</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-display font-bold text-primary">Zero</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Config needed</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-display font-bold text-primary">Instant</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Auto-moderation</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-display font-bold text-primary">100%</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Free to use</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">A fortress for your server</h2>
            <p className="text-muted-foreground text-lg">Everything you need to maintain order, built into one cohesive system.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="glass-panel p-8 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-colors"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Lock className="w-32 h-32 text-primary" />
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-display">Auto-Moderation</h3>
              <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                Relentless protection. Automatically deletes banned words, sneaky invite links, spam, and excessive caps or mentions before anyone even sees them.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="glass-panel p-8 rounded-2xl relative overflow-hidden group hover:border-cyan-500/50 transition-colors"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="w-32 h-32 text-cyan-400" />
              </div>
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                <MessageSquareWarning className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-display">Warning Tracker</h3>
              <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                Keep a permanent record. Mods can easily issue, view, and clear a member's warning history to identify repeat offenders instantly.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-8 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-colors"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <UserPlus className="w-32 h-32 text-purple-400" />
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-display">Stylish Greetings</h3>
              <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                Make an impression. Professional, customizable welcome and goodbye messages when members join or leave your community.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Terminal Showcase Section */}
      <section id="commands" className="py-32 bg-black/60 border-y border-white/5 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 leading-tight">The prefix is mightier<br/><span className="text-primary">than the sword.</span></h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Using the <code className="bg-primary/20 px-2 py-1 rounded text-primary font-mono border border-primary/30">!</code> prefix, your moderation team has instant access to powerful tools without navigating clunky menus.
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  { cmd: "!ban @user [reason]", desc: "Permanently remove a threat from the server." },
                  { cmd: "!kick @user [reason]", desc: "Boot a user, allowing them to return later." },
                  { cmd: "!warn @user [reason]", desc: "Log a formal warning to the user's record." },
                  { cmd: "!purge [number]", desc: "Bulk delete up to 100 messages at once." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 transition-colors">
                    <div className="mt-0.5 bg-primary/20 p-2 rounded border border-primary/20">
                      <Terminal className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <code className="text-foreground font-mono font-bold block mb-1">{item.cmd}</code>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Simulated Discord UI */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="rounded-xl overflow-hidden border border-white/10 bg-[#313338] shadow-2xl box-glow"
            >
              <div className="bg-[#2B2D31] px-4 py-3 border-b border-black/40 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-xs font-semibold text-gray-400 font-sans flex items-center gap-2">
                  <span className="text-gray-500 text-lg leading-none">#</span>
                  moderation-log
                </div>
              </div>
              
              <div className="p-4 space-y-6 font-sans text-[15px]">
                {/* Message 1 */}
                <div className="flex gap-4 hover:bg-black/10 p-2 -mx-2 rounded transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-white hover:underline cursor-pointer">SentinelBot</span>
                      <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wide flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Bot
                      </span>
                      <span className="text-xs text-gray-400">Today at 10:24 AM</span>
                    </div>
                    <div className="mt-1 text-gray-200 bg-[#2B2D31] p-3 rounded border-l-4 border-red-500 shadow-md">
                      <div className="font-bold text-red-400 mb-2">Member Banned</div>
                      <div className="grid grid-cols-[60px_1fr] gap-1 text-sm">
                        <span className="text-gray-400 font-bold">User:</span>
                        <span>Spammer123</span>
                        <span className="text-gray-400 font-bold">Mod:</span>
                        <span>Admin</span>
                        <span className="text-gray-400 font-bold">Reason:</span>
                        <span>Posting malicious links</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message 2 */}
                <div className="flex gap-4 hover:bg-black/10 p-2 -mx-2 rounded transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div className="w-full">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-white hover:underline cursor-pointer">Admin</span>
                      <span className="text-xs text-gray-400">Today at 10:26 AM</span>
                    </div>
                    <div className="mt-1 text-gray-200">
                      !purge 50
                    </div>
                  </div>
                </div>

                 {/* Message 3 */}
                 <div className="flex gap-4 hover:bg-black/10 p-2 -mx-2 rounded transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg">
                     <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-white hover:underline cursor-pointer">SentinelBot</span>
                      <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wide flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Bot
                      </span>
                      <span className="text-xs text-gray-400">Today at 10:26 AM</span>
                    </div>
                    <div className="mt-1 text-gray-200 flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-green-400" />
                      Successfully deleted 50 messages.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Auto-Mod Showcase */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold">Zero tolerance for spam.</h2>
            <p className="text-xl text-muted-foreground">
              SentinelBot's auto-moderation engine works 24/7. It instantly detects and removes bad words, unauthorized invite links, mass mentions, and spam behavior before human mods even need to look.
            </p>
            <div className="flex justify-center gap-4 pt-8 flex-wrap">
              {['Anti-Spam', 'Link Filtering', 'Word Filters', 'Caps Lock Protection'].map((feature, i) => (
                <div key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-gray-300">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-black/40 border-y border-white/5">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">Everything you need to know about SentinelBot.</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border-white/10 glass-panel px-6 rounded-lg data-[state=open]:border-primary/50 transition-colors">
              <AccordionTrigger className="text-lg font-medium hover:no-underline py-6">Do I need to host the bot myself?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                Not at all. SentinelBot is fully hosted and maintained 24/7. Just invite it to your server and it works instantly without any complex setup.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border-white/10 glass-panel px-6 rounded-lg data-[state=open]:border-primary/50 transition-colors">
              <AccordionTrigger className="text-lg font-medium hover:no-underline py-6">How do the welcome messages work?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                The bot automatically detects when members join or leave your server and sends a clean, professional message in your designated channel. No configuration required beyond ensuring it has permission to post there.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border-white/10 glass-panel px-6 rounded-lg data-[state=open]:border-primary/50 transition-colors">
              <AccordionTrigger className="text-lg font-medium hover:no-underline py-6">What permissions does the bot need?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                SentinelBot requires standard moderation permissions: Kick, Ban, Manage Messages, Read Message History, and Send Messages. It uses these strictly for executing your commands and auto-moderating content.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="border-white/10 glass-panel px-6 rounded-lg data-[state=open]:border-primary/50 transition-colors">
              <AccordionTrigger className="text-lg font-medium hover:no-underline py-6">Is it free to use?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                Yes. The core moderation suite including auto-mod, warnings, and purge commands is 100% free to use for any server, regardless of size.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/20 blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-8 glass-panel p-12 md:p-16 rounded-3xl border-primary/30 bg-card/60"
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold text-glow">Ready to secure your server?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of community leaders who trust SentinelBot to keep their Discord servers clean, safe, and professional.
            </p>
            <a href={INVITE_LINK} target="_blank" rel="noreferrer" className="inline-block mt-8">
              <Button size="lg" className="h-16 px-12 text-lg font-bold gap-3 bg-primary hover:bg-primary/90 shadow-[0_0_40px_rgba(88,101,242,0.4)] transition-shadow hover:shadow-[0_0_60px_rgba(88,101,242,0.6)]">
                <SiDiscord className="w-6 h-6" />
                Add to Server Now
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black/80">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl tracking-tight text-white">SentinelBot</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Support Server</a>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            © {new Date().getFullYear()} SentinelBot. Not affiliated with Discord.
          </p>
        </div>
      </footer>
    </div>
  );
}
