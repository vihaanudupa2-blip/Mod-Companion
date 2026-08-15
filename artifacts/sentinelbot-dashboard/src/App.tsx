import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Hash,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Radio,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  type AuthUser,
  type DashboardGuild,
  type GuildSettings,
  type ReactionRole,
  getGetDashboardGuildsQueryKey,
  getGetGuildSettingsQueryKey,
  getGetMeQueryKey,
  getGetReactionRolesQueryKey,
  useAddBannedWord,
  useGetDashboardGuilds,
  useGetGuildSettings,
  useGetMe,
  useGetReactionRoles,
  useRemoveBannedWord,
  useUpdateGuildSettings,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function Avatar({ user, size = 'md' }: { user?: AuthUser | DashboardGuild; size?: 'sm' | 'md' | 'lg' }) {
  const isUser = Boolean(user && 'username' in user);
  const name = user ? ('username' in user ? user.username : user.name) : 'S';
  const src = user ? ('username' in user ? user.avatarUrl : user.iconUrl ?? undefined) : undefined;
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className={cn('avatar', `avatar-${size}`)} data-testid={`avatar-${name}`}>
      {src ? <img src={src} alt="" /> : <span>{initials}</span>}
    </div>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="brand" data-testid="link-home">
      <span className="brand-mark"><ShieldCheck size={20} strokeWidth={2.6} /></span>
      <span>sentinel<span className="brand-dot">.</span>bot</span>
    </Link>
  );
}

function LoadingPanel({ label = 'Synchronizing server data' }: { label?: string }) {
  return (
    <div className="loading-panel" data-testid="status-loading">
      <div className="loading-orbit"><span /></div>
      <strong>{label}</strong>
      <p>SentinelBot is checking your command center.</p>
    </div>
  );
}

function ErrorPanel({ retry, title = 'We lost the signal' }: { retry?: () => void; title?: string }) {
  return (
    <div className="empty-panel error-panel" data-testid="status-error">
      <span className="panel-icon danger"><AlertTriangle size={21} /></span>
      <h2>{title}</h2>
      <p>We could not reach SentinelBot right now. Your last saved configuration is safe.</p>
      {retry && <button className="button button-dark" onClick={retry} data-testid="button-retry"><RefreshCw size={15} /> Try again</button>}
    </div>
  );
}

function Login() {
  const [, setLocation] = useLocation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const login = async () => {
    setPending(true);
    setError('');
    try {
      window.location.href = '/api/auth/login';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start Discord sign-in.');
      setPending(false);
    }
  };
  return (
    <main className="login-screen">
      <div className="login-grid" />
      <div className="login-shell">
        <div className="login-brand"><Wordmark /><span className="eyebrow">command center</span></div>
        <section className="login-card">
          <div className="login-emblem"><ShieldCheck size={34} /></div>
          <p className="eyebrow">discord moderation, made steady</p>
          <h1>A calmer server starts here.</h1>
          <p className="login-copy">Keep the welcome warm and the hard work quiet. SentinelBot gives server owners a clear view of the things that matter.</p>
          <button className="discord-button" onClick={login} disabled={pending} data-testid="button-discord-login">
            <span className="discord-glyph">D</span>
            {pending ? 'Opening Discord…' : 'Continue with Discord'}
            {!pending && <ArrowRight size={17} />}
          </button>
          {error && <p className="form-error" data-testid="status-login-error">{error}</p>}
          <div className="login-assurance"><Check size={14} /> We never ask for your Discord password</div>
        </section>
        <p className="login-footer">Built for the people who keep communities kind.</p>
      </div>
    </main>
  );
}

type Page = 'overview' | 'settings' | 'moderation' | 'reaction-roles';

function Shell({
  user,
  guilds,
  selectedGuild,
  setSelectedGuild,
  page,
  children,
}: {
  user: AuthUser;
  guilds: DashboardGuild[];
  selectedGuild?: DashboardGuild;
  setSelectedGuild: (id: string) => void;
  page: Page;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, setLocation] = useLocation();
  const nav = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard, path: '/' },
    { id: 'settings' as const, label: 'Server settings', icon: SlidersHorizontal, path: '/settings' },
    { id: 'moderation' as const, label: 'Moderation', icon: ShieldAlert, path: '/moderation' },
    { id: 'reaction-roles' as const, label: 'Reaction roles', icon: Radio, path: '/reaction-roles' },
  ];
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    queryClient.removeQueries();
    setLocation('/login');
  };
  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)} data-testid="button-close-menu" />}
      <aside className={cn('sidebar', mobileOpen && 'sidebar-open')}>
        <div className="sidebar-top">
          <Wordmark />
          <button className="mobile-close" onClick={() => setMobileOpen(false)} data-testid="button-close-sidebar"><X size={18} /></button>
        </div>
        <div className="guild-picker-wrap">
          <span className="eyebrow sidebar-label">MANAGING</span>
          <div className="guild-picker">
            <Avatar user={selectedGuild} size="sm" />
            <select value={selectedGuild?.id ?? ''} onChange={(event) => setSelectedGuild(event.target.value)} data-testid="select-guild">
              {guilds.map((guild) => <option value={guild.id} key={guild.id}>{guild.name}</option>)}
            </select>
            <ChevronDown size={15} />
          </div>
        </div>
        <nav className="nav-list" aria-label="Main navigation">
          <span className="eyebrow sidebar-label">COMMAND CENTER</span>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.path} key={item.id} onClick={() => setMobileOpen(false)} className={cn('nav-item', page === item.id && 'nav-item-active')} data-testid={`link-nav-${item.id}`}>
                <Icon size={17} /><span>{item.label}</span>{page === item.id && <ChevronRight size={15} className="nav-arrow" />}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-quiet">
          <div className="signal-dot" />
          <div><strong>SentinelBot is on watch</strong><span>All systems operational</span></div>
        </div>
        <div className="sidebar-user">
          <Avatar user={user} size="sm" />
          <div className="user-detail"><strong data-testid="text-username">{user.username}<span className="discriminator">#{user.discriminator}</span></strong><span>Server owner</span></div>
          <button onClick={logout} aria-label="Sign out" data-testid="button-logout"><LogOut size={16} /></button>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} data-testid="button-open-menu"><Menu size={20} /></button>
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{selectedGuild?.name ?? 'Your server'}</strong></div>
          <div className="topbar-actions"><span className="live-badge"><span /> Live</span><button className="help-button" title="Help" data-testid="button-help"><CircleHelp size={18} /></button></div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <div className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>{children && <div className="header-actions">{children}</div>}</div>;
}

function Overview({ guild, settings, reactionRoles }: { guild?: DashboardGuild; settings?: GuildSettings; reactionRoles?: ReactionRole[] }) {
  const [, setLocation] = useLocation();
  const protectedCount = settings?.bannedWords.length ?? 0;
  const activeFeatures = [settings?.welcomeEnabled, settings?.goodbyeEnabled, settings?.autoModEnabled].filter(Boolean).length;
  return (
    <>
      <PageHeader eyebrow="overview / today" title={`Good to see you, ${guild?.name ?? 'owner'}.`} description="Your community’s guardrails, at a glance.">
        <button className="button button-dark" onClick={() => setLocation('/settings')} data-testid="button-open-settings"><SlidersHorizontal size={15} /> Configure server</button>
      </PageHeader>
      <section className="signal-banner" data-testid="status-system">
        <div className="banner-orbit"><ShieldCheck size={24} /></div>
        <div><strong>Your server is in a good place.</strong><span>SentinelBot is monitoring {guild?.name ?? 'your community'} quietly in the background.</span></div>
        <span className="banner-time">Updated just now</span>
      </section>
      <div className="metric-grid">
        <div className="metric-card metric-primary"><span className="metric-label">Protection status</span><strong>{settings?.autoModEnabled ? 'Active' : 'Standby'}</strong><span className="metric-foot"><span className="mini-dot" /> AutoMod {settings?.autoModEnabled ? 'enabled' : 'paused'}</span><ShieldCheck className="metric-art" size={84} /></div>
        <div className="metric-card"><span className="metric-label">Guardrails active</span><strong>{activeFeatures}<small> / 3</small></strong><span className="metric-foot">Welcome, goodbye & AutoMod</span><Sparkles className="metric-icon" size={21} /></div>
        <div className="metric-card"><span className="metric-label">Blocked words</span><strong>{protectedCount}</strong><span className="metric-foot">Custom terms being watched</span><ShieldAlert className="metric-icon warning" size={21} /></div>
        <div className="metric-card"><span className="metric-label">Reaction roles</span><strong>{reactionRoles?.length ?? 0}</strong><span className="metric-foot">Self-serve role assignments</span><MessageSquare className="metric-icon" size={21} /></div>
      </div>
      <div className="overview-grid">
        <section className="content-card configuration-card">
          <div className="card-heading"><div><p className="eyebrow">configuration</p><h2>How SentinelBot is showing up</h2></div><Link href="/settings" className="text-link" data-testid="link-settings-summary">View settings <ArrowRight size={14} /></Link></div>
          <div className="config-list">
            <FeatureRow icon={<MessageSquare size={17} />} title="Welcome messages" detail={settings?.welcomeEnabled ? `Posting in #${settings.welcomeChannelId ?? 'your welcome channel'}` : 'Not currently enabled'} enabled={Boolean(settings?.welcomeEnabled)} />
            <FeatureRow icon={<LogOut size={17} />} title="Goodbye messages" detail={settings?.goodbyeEnabled ? 'A thoughtful farewell, every time' : 'Not currently enabled'} enabled={Boolean(settings?.goodbyeEnabled)} />
            <FeatureRow icon={<ShieldAlert size={17} />} title="AutoMod protection" detail={settings?.autoModEnabled ? `${protectedCount} custom terms + threshold rules` : 'Not currently enabled'} enabled={Boolean(settings?.autoModEnabled)} />
          </div>
        </section>
        <section className="content-card next-card">
          <div className="card-heading"><div><p className="eyebrow">quick check</p><h2>Keep your setup healthy</h2></div><span className="check-circle"><Check size={16} /></span></div>
          <div className="health-item"><div className="health-number">01</div><div><strong>Set a welcome message</strong><span>Give new members a reason to stay.</span></div><Link href="/settings" className="round-arrow" data-testid="link-health-welcome"><ArrowRight size={15} /></Link></div>
          <div className="health-item"><div className="health-number">02</div><div><strong>Review your word list</strong><span>Keep the filter relevant to your community.</span></div><Link href="/moderation" className="round-arrow" data-testid="link-health-moderation"><ArrowRight size={15} /></Link></div>
        </section>
      </div>
    </>
  );
}

function FeatureRow({ icon, title, detail, enabled }: { icon: ReactNode; title: string; detail: string; enabled: boolean }) {
  return <div className="feature-row"><span className={cn('feature-icon', enabled && 'feature-icon-on')}>{icon}</span><div><strong>{title}</strong><span>{detail}</span></div><span className={cn('status-pill', enabled ? 'status-on' : 'status-off')}>{enabled ? 'Enabled' : 'Off'}</span></div>;
}

function SettingsPage({ guild, settings, onUpdate, saving }: { guild?: DashboardGuild; settings?: GuildSettings; onUpdate: (data: Partial<GuildSettings>) => void; saving: boolean }) {
  const [draft, setDraft] = useState<Partial<GuildSettings>>({});
  useEffect(() => { if (settings) setDraft(settings); }, [settings]);
  if (!settings) return <LoadingPanel />;
  const value = <T extends keyof GuildSettings>(key: T) => (draft[key] ?? settings[key]) as GuildSettings[T];
  const update = (data: Partial<GuildSettings>) => setDraft((current) => ({ ...current, ...data }));
  return (
    <>
      <PageHeader eyebrow="configuration / server settings" title="Set the tone." description={`Make ${guild?.name ?? 'your server'} feel like somewhere people want to be.`}>
        <button className="button button-dark" onClick={() => onUpdate(draft)} disabled={saving} data-testid="button-save-settings">{saving ? 'Saving…' : 'Save changes'} {!saving && <Check size={15} />}</button>
      </PageHeader>
      <div className="settings-layout">
        <div className="settings-main">
          <section className="content-card settings-section"><SectionTitle number="01" title="Welcome" detail="First impressions matter. Give new members a warm arrival." /><ToggleRow label="Welcome messages" detail="Send a message whenever someone joins." checked={Boolean(value('welcomeEnabled'))} onChange={(checked) => update({ welcomeEnabled: checked })} testId="toggle-welcome" /><div className="field-grid"><Field label="Channel" hint="Where should it appear?"><div className="input-with-icon"><Hash size={16} /><input value={String(value('welcomeChannelId') ?? '')} onChange={(e) => update({ welcomeChannelId: e.target.value })} placeholder="welcome" data-testid="input-welcome-channel" /></div></Field><Field label="Message" hint="Use {member} to mention the new member."><textarea value={String(value('welcomeMessage') ?? '')} onChange={(e) => update({ welcomeMessage: e.target.value })} placeholder="Welcome to the community, {member}." rows={3} data-testid="input-welcome-message" /></Field></div></section>
          <section className="content-card settings-section"><SectionTitle number="02" title="Goodbye" detail="A quiet, considered farewell when someone leaves." /><ToggleRow label="Goodbye messages" detail="Send a message when someone leaves the server." checked={Boolean(value('goodbyeEnabled'))} onChange={(checked) => update({ goodbyeEnabled: checked })} testId="toggle-goodbye" /><Field label="Message" hint="Keep it kind and concise."><textarea value={String(value('goodbyeMessage') ?? '')} onChange={(e) => update({ goodbyeMessage: e.target.value })} placeholder="We'll miss you, {member}." rows={3} data-testid="input-goodbye-message" /></Field></section>
          <section className="content-card settings-section"><SectionTitle number="03" title="AutoMod" detail="Let SentinelBot handle the noise, so you can focus on the people." /><ToggleRow label="AutoMod protection" detail="Flag messages that cross your community’s boundaries." checked={Boolean(value('autoModEnabled'))} onChange={(checked) => update({ autoModEnabled: checked })} testId="toggle-automod" /><div className="threshold-note"><ShieldCheck size={17} /><span>Fine-tune thresholds and manage your custom word list in <Link href="/moderation" data-testid="link-settings-moderation">Moderation.</Link></span></div></section>
        </div>
        <aside className="settings-aside"><div className="aside-sticky"><div className="preview-card"><div className="preview-top"><span className="discord-mini">D</span><span><strong>{guild?.name ?? 'Your server'}</strong><small># general</small></span><span className="preview-live">LIVE</span></div><div className="preview-message"><span className="bot-avatar"><Bot size={15} /></span><div><strong>SentinelBot <span className="bot-tag">BOT</span></strong><p>{String(value('welcomeMessage') || 'Welcome to the community, {member}.').replace('{member}', 'new member')}</p></div></div></div><div className="aside-tip"><Sparkles size={16} /><div><strong>A little goes a long way</strong><p>Specific messages feel more human. Mention what makes your server worth joining.</p></div></div></div></aside>
      </div>
    </>
  );
}

function SectionTitle({ number, title, detail }: { number: string; title: string; detail: string }) {
  return <div className="section-title"><span className="section-number">{number}</span><div><h2>{title}</h2><p>{detail}</p></div></div>;
}

function ToggleRow({ label, detail, checked, onChange, testId }: { label: string; detail: string; checked: boolean; onChange: (value: boolean) => void; testId: string }) {
  return <div className="toggle-row"><div><strong>{label}</strong><span>{detail}</span></div><button className={cn('toggle', checked && 'toggle-on')} role="switch" aria-checked={checked} onClick={() => onChange(!checked)} data-testid={testId}><span /></button></div>;
}

function Field({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return <label className="field"><span className="field-label">{label}<small>{hint}</small></span>{children}</label>;
}

function ModerationPage({ settings, onAdd, onRemove, onUpdate, pending }: { settings?: GuildSettings; onAdd: (word: string) => void; onRemove: (word: string) => void; onUpdate: (data: Partial<GuildSettings>) => void; pending: boolean }) {
  const [word, setWord] = useState('');
  const [thresholds, setThresholds] = useState({ maxMentions: settings?.maxMentions ?? 5, maxEmojis: settings?.maxEmojis ?? 8, maxCapsRatio: settings?.maxCapsRatio ?? 0.7 });
  useEffect(() => { if (settings) setThresholds({ maxMentions: settings.maxMentions, maxEmojis: settings.maxEmojis, maxCapsRatio: settings.maxCapsRatio }); }, [settings]);
  if (!settings) return <LoadingPanel />;
  const submit = (event: FormEvent) => { event.preventDefault(); if (word.trim()) { onAdd(word.trim()); setWord(''); } };
  return (
    <>
      <PageHeader eyebrow="protection / moderation" title="Keep the noise out." description="Thoughtful guardrails for the conversations that matter." />
      <div className="moderation-layout">
        <div className="moderation-main">
          <section className="content-card moderation-card"><div className="card-heading"><div><p className="eyebrow">custom filter</p><h2>Words to watch</h2><p className="card-description">Messages containing these terms are flagged for your moderators.</p></div><span className="count-badge">{settings.bannedWords.length} terms</span></div><form className="word-form" onSubmit={submit}><input value={word} onChange={(e) => setWord(e.target.value)} placeholder="Add a word or phrase" data-testid="input-banned-word" /><button className="button button-dark" type="submit" disabled={pending || !word.trim()} data-testid="button-add-word"><Plus size={16} /> Add term</button></form><div className="word-list">{settings.bannedWords.length ? settings.bannedWords.map((item) => <div className="word-chip" key={item}><span>{item}</span><button onClick={() => onRemove(item)} aria-label={`Remove ${item}`} data-testid={`button-remove-word-${item}`}><X size={14} /></button></div>) : <div className="small-empty"><ShieldCheck size={18} /><span>Your custom list is clear. Add terms that are specific to your community.</span></div>}</div></section>
          <section className="content-card moderation-card"><div className="card-heading"><div><p className="eyebrow">message thresholds</p><h2>When should AutoMod step in?</h2><p className="card-description">Set the point where a message needs a second look.</p></div><span className={cn('status-pill', settings.autoModEnabled ? 'status-on' : 'status-off')}>{settings.autoModEnabled ? 'AutoMod on' : 'AutoMod off'}</span></div><ThresholdSlider label="Mention limit" detail="Flag messages with more than this many mentions." value={thresholds.maxMentions} min={1} max={20} suffix=" mentions" onChange={(value) => setThresholds({ ...thresholds, maxMentions: value })} testId="slider-max-mentions" /><ThresholdSlider label="Emoji limit" detail="Flag messages with more than this many emoji characters." value={thresholds.maxEmojis} min={1} max={30} suffix=" emoji" onChange={(value) => setThresholds({ ...thresholds, maxEmojis: value })} testId="slider-max-emojis" /><ThresholdSlider label="Capitalization" detail="Flag messages when this portion is written in capitals." value={Math.round(thresholds.maxCapsRatio * 100)} min={10} max={100} suffix="%" onChange={(value) => setThresholds({ ...thresholds, maxCapsRatio: value / 100 })} testId="slider-max-caps" /><button className="button button-dark save-thresholds" onClick={() => onUpdate(thresholds)} disabled={pending} data-testid="button-save-thresholds">{pending ? 'Saving…' : 'Save thresholds'}<Check size={15} /></button></section>
        </div>
        <aside className="moderation-aside"><div className="protection-card"><div className="protection-graphic"><div className="graphic-ring ring-one" /><div className="graphic-ring ring-two" /><ShieldCheck size={32} /></div><p className="eyebrow">sentinel protocol</p><h2>Quietly vigilant.</h2><p>When a message crosses a line, SentinelBot gives your moderators the context they need — without turning your server into a courtroom.</p><div className="protection-rule"><span /><span /><span /></div></div><div className="tip-card"><AlertTriangle size={17} /><div><strong>Good to know</strong><p>AutoMod only acts when enabled in Server settings.</p><Link href="/settings" data-testid="link-enable-automod">Review AutoMod <ArrowRight size={13} /></Link></div></div></aside>
      </div>
    </>
  );
}

function ThresholdSlider({ label, detail, value, min, max, suffix, onChange, testId }: { label: string; detail: string; value: number; min: number; max: number; suffix: string; onChange: (v: number) => void; testId: string }) {
  return <div className="threshold-row"><div className="threshold-copy"><strong>{label}<span className="threshold-value">{value}{suffix}</span></strong><span>{detail}</span></div><input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} data-testid={testId} /></div>;
}

function ReactionRolesPage({ roles, loading, error, retry }: { roles?: ReactionRole[]; loading: boolean; error: boolean; retry: () => void }) {
  return (
    <>
      <PageHeader eyebrow="engagement / reaction roles" title="Let members choose." description="A simple overview of the roles your community can self-assign." />
      {loading ? <LoadingPanel label="Loading reaction roles" /> : error ? <ErrorPanel retry={retry} /> : roles?.length ? <section className="content-card roles-card"><div className="card-heading"><div><p className="eyebrow">active assignments</p><h2>Reaction roles</h2></div><span className="count-badge">{roles.length} active</span></div><div className="roles-table"><div className="roles-table-head"><span>EMOJI</span><span>ROLE ID</span><span>CHANNEL</span><span>MESSAGE</span></div>{roles.map((role) => <div className="role-row" key={role.id}><span className="role-emoji" data-testid={`text-emoji-${role.id}`}>{role.emoji}</span><span className="mono">{role.roleId}</span><span className="mono">{role.channelId}</span><span className="mono">{role.messageId}</span></div>)}</div></section> : <div className="empty-panel" data-testid="status-reaction-roles-empty"><span className="panel-icon"><Radio size={21} /></span><h2>No reaction roles yet</h2><p>Once you create a self-serve role in Discord, it will appear here for a quick overview.</p><Link href="/" className="button button-dark" data-testid="link-empty-overview">Back to overview <ArrowRight size={15} /></Link></div>}
    </>
  );
}

function ProtectedRouter() {
  const [location, setLocation] = useLocation();
  const meQuery = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const guildsQuery = useGetDashboardGuilds({ query: { queryKey: getGetDashboardGuildsQueryKey(), enabled: !!meQuery.data } });
  const guilds = guildsQuery.data ?? [];
  const storedGuild = typeof window !== 'undefined' ? localStorage.getItem('sentinel.guild') : null;
  const [selectedId, setSelectedId] = useState(storedGuild ?? '');
  const guild = guilds.find((item) => item.id === selectedId) ?? guilds[0];
  const guildId = guild?.id ?? '';
  const settingsQuery = useGetGuildSettings(guildId, { query: { enabled: !!guildId, queryKey: getGetGuildSettingsQueryKey(guildId) } });
  const rolesQuery = useGetReactionRoles(guildId, { query: { enabled: !!guildId, queryKey: getGetReactionRolesQueryKey(guildId) } });
  const settingsMutation = useUpdateGuildSettings();
  const addWordMutation = useAddBannedWord();
  const removeWordMutation = useRemoveBannedWord();
  useEffect(() => { if (guild?.id) { setSelectedId(guild.id); localStorage.setItem('sentinel.guild', guild.id); } }, [guild?.id]);
  const setGuild = (id: string) => { setSelectedId(id); localStorage.setItem('sentinel.guild', id); };
  const invalidateSettings = () => queryClient.invalidateQueries({ queryKey: getGetGuildSettingsQueryKey(guildId) });
  const update = (data: Partial<GuildSettings>) => { if (!guildId) return; settingsMutation.mutate({ guildId, data }, { onSuccess: invalidateSettings }); };
  const add = (word: string) => { if (!guildId) return; addWordMutation.mutate({ guildId, data: { word } }, { onSuccess: invalidateSettings }); };
  const remove = (word: string) => { if (!guildId) return; removeWordMutation.mutate({ guildId, word }, { onSuccess: invalidateSettings }); };
  const page: Page = location === '/settings' ? 'settings' : location === '/moderation' ? 'moderation' : location === '/reaction-roles' ? 'reaction-roles' : 'overview';
  if (meQuery.isLoading) return <LoadingPanel label="Connecting to Discord" />;
  if (meQuery.isError || !meQuery.data) return <Login />;
  if (guildsQuery.isLoading) return <LoadingPanel label="Finding your servers" />;
  if (guildsQuery.isError) return <ErrorPanel retry={() => guildsQuery.refetch()} title="Your server list is out of reach" />;
  if (!guilds.length) return <NoServers user={meQuery.data} />;
  return <Shell user={meQuery.data} guilds={guilds} selectedGuild={guild} setSelectedGuild={setGuild} page={page}>{page === 'overview' && <Overview guild={guild} settings={settingsQuery.data} reactionRoles={rolesQuery.data} />}{page === 'settings' && <SettingsPage guild={guild} settings={settingsQuery.data} onUpdate={update} saving={settingsMutation.isPending} />}{page === 'moderation' && <ModerationPage settings={settingsQuery.data} onAdd={add} onRemove={remove} onUpdate={update} pending={addWordMutation.isPending || removeWordMutation.isPending || settingsMutation.isPending} />}{page === 'reaction-roles' && <ReactionRolesPage roles={rolesQuery.data} loading={rolesQuery.isLoading} error={rolesQuery.isError} retry={() => rolesQuery.refetch()} />}</Shell>;
}

function NoServers({ user }: { user: AuthUser }) {
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); window.location.href = '/login'; };
  return <main className="login-screen"><div className="login-grid" /><div className="login-shell"><div className="login-brand"><Wordmark /><span className="eyebrow">command center</span></div><section className="login-card"><div className="login-emblem soft"><Bot size={34} /></div><p className="eyebrow">nothing to watch yet</p><h1>We couldn’t find a server.</h1><p className="login-copy">Hi {user.username}. SentinelBot needs a server where you have permission to manage the community. Add the bot, then come back here.</p><button className="button button-dark full-button" onClick={logout} data-testid="button-sign-out-empty">Sign out <LogOut size={15} /></button></section></div></main>;
}

function Router() {
  return <ErrorBoundary resetKey={window.location.pathname}><Switch><Route path="/login" component={Login} /><Route path="/404" component={NotFound} /><Route component={ProtectedRouter} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;