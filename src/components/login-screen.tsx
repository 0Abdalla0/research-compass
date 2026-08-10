import { useState } from "react";
import { useWorkspace } from "@/lib/workspace-store";
import { LogIn, UserPlus, Sparkles, Mail, Lock, ShieldAlert, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function LoginScreen() {
  const ws = useWorkspace();
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  
  // Sign In state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState("Researcher");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    // Check if email matches a pre-seeded member (for convenience)
    const matched = ws.members.find((m) => m.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      ws.loginUser(matched);
      toast.success(`Welcome back, ${matched.name}!`, {
        description: `Logged in as ${matched.role}`,
      });
    } else {
      // Otherwise, create a mock user
      const name = email.split("@")[0] || "User";
      const initials = name.slice(0, 2).toUpperCase();
      const color = Math.floor(Math.random() * 360).toString();
      const mockUser = {
        id: "m_mock_" + Math.random().toString(36).slice(2, 9),
        name,
        initials,
        role: "Researcher" as const,
        email,
        responsibilities: "Graduation research team member",
        color,
      };
      ws.loginUser(mockUser);
      toast.success(`Signed in as ${name}!`);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) {
      toast.error("Please provide both name and email.");
      return;
    }
    ws.registerUser(regName, regEmail, regRole);
    toast.success(`Account created! Welcome to MedOnto Lab, ${regName}!`);
  };

  const handleQuickLogin = (member: typeof ws.members[number]) => {
    ws.loginUser(member);
    toast.success(`Quick logged in as ${member.name}!`, {
      description: `Role: ${member.role}`,
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-success/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Logo and Brand Title */}
        <div className="text-center">
          <div 
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-xl font-black text-white shadow-lg"
            style={{ background: "var(--gradient-brand)" }}
          >
            R
          </div>
          <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-foreground">
            ResearchHub
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
            Everything your graduation or academic research team needs, in one collaborative workspace.
          </p>
        </div>

        {/* Auth Box Container */}
        <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-pop)] overflow-hidden">
          {/* Header tabs */}
          <div className="grid grid-cols-2 border-b border-border bg-muted/30">
            <button
              onClick={() => setActiveTab("signin")}
              className={cn(
                "flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all border-b-2 outline-none",
                activeTab === "signin"
                  ? "border-brand text-brand bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={cn(
                "flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all border-b-2 outline-none",
                activeTab === "register"
                  ? "border-brand text-brand bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <UserPlus className="h-4 w-4" />
              Register
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === "signin" ? (
              /* Sign In Form */
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground pointer-events-none">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="e.g. ahmed.kamal@uni.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand transition-colors text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="pass" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground pointer-events-none">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      id="pass"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand transition-colors text-foreground"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-brand text-brand-foreground font-semibold text-sm transition-all hover:bg-brand/90 cursor-pointer shadow-md"
                >
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="reg-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="e.g. Abdalla Nasser"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand transition-colors text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="e.g. abdalla.nasser@uni.edu"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand transition-colors text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-role" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Research Role
                  </label>
                  <select
                    id="reg-role"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand transition-colors text-foreground"
                  >
                    <option value="Team Leader">Team Leader</option>
                    <option value="Researcher">Researcher</option>
                    <option value="Developer">Developer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-brand text-brand-foreground font-semibold text-sm transition-all hover:bg-brand/90 cursor-pointer shadow-md"
                >
                  Create Account & Join
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* Quick Login Section */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-semibold tracking-wide">
                  Or Quick Login As
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ws.members.slice(0, 6).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleQuickLogin(m)}
                  className="group flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-surface-muted/50 hover:bg-brand/5 hover:border-brand/40 text-center transition-all cursor-pointer hover:shadow-inner"
                >
                  <span
                    className="grid h-8 w-8 place-items-center rounded-full text-xs font-semibold text-white group-hover:scale-105 transition-transform"
                    style={{
                      background: `linear-gradient(140deg, oklch(0.6 0.14 ${m.color}), oklch(0.42 0.13 ${m.color}))`,
                    }}
                  >
                    {m.initials}
                  </span>
                  <span className="mt-1.5 block text-xs font-bold truncate w-full text-foreground">
                    {m.name.split(" ")[0]}
                  </span>
                  <span className="block text-[9px] text-muted-foreground font-medium truncate w-full uppercase">
                    {m.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security Warning Mock */}
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-warning/10 border border-warning/20 text-[11px] text-warning-foreground leading-normal">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>
            <strong>Local Dev Session:</strong> This portal uses secure local authentication for simulation. Real credentials can be mapped using Supabase Auth endpoints.
          </span>
        </div>
      </div>
    </div>
  );
}
