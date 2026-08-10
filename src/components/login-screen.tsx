import { useState } from "react";
import { useWorkspace } from "@/lib/workspace-store";
import { LogIn, UserPlus, Mail, Lock, ShieldAlert, ArrowRight, FileText, Phone, Award, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Member = ReturnType<typeof useWorkspace>["members"][number];

export function LoginScreen() {
  const ws = useWorkspace();
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  
  // Sign In state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Quick Login state
  const [confirmingMember, setConfirmingMember] = useState<Member | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("Researcher");

  // Researcher Custom Fields state
  const [uniId, setUniId] = useState("");
  const [phone, setPhone] = useState("");
  const [uniEmail, setUniEmail] = useState("");
  const [cv, setCv] = useState("");
  const [privateEmail, setPrivateEmail] = useState("");
  const [verifyPrivateEmail, setVerifyPrivateEmail] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    const matched = ws.members.find((m) => m.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      const correctPassword = matched.password || "123456";
      if (password === correctPassword) {
        ws.loginUser(matched);
        toast.success(`Welcome back, ${matched.name}!`, {
          description: `Logged in as ${matched.role}`,
        });
      } else {
        toast.error("Incorrect password.");
      }
    } else {
      toast.error("Account email not found. Please register an account first.");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      toast.error("Name, email, and password are required.");
      return;
    }

    if (regRole === ("Researcher" || "Team Leader")) {
      if (!uniId || !phone || !uniEmail || !cv || !privateEmail || !verifyPrivateEmail) {
        toast.error("Please fill in all required Researcher details.");
        return;
      }
      if (privateEmail.toLowerCase() !== verifyPrivateEmail.toLowerCase()) {
        toast.error("Personal emails do not match.");
        return;
      }
      ws.registerUser(
        regName,
        regEmail,
        regRole,
        regPassword,
        uniId,
        phone,
        uniEmail,
        cv,
        privateEmail
      );
    } else {
      ws.registerUser(regName, regEmail, regRole, regPassword);
    }

    // Reset fields
    setRegName("");
    setRegEmail("");
    setRegPassword("");
    setUniId("");
    setPhone("");
    setUniEmail("");
    setCv("");
    setPrivateEmail("");
    setVerifyPrivateEmail("");

    toast.success(`Account created! Welcome to MedOnto Lab, ${regName}!`);
  };

  const handleQuickLoginClick = (member: Member) => {
    setConfirmingMember(member);
    setConfirmPassword("");
  };

  const handleConfirmQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingMember) return;
    const correctPassword = confirmingMember.password || "123456";
    if (confirmPassword === correctPassword) {
      ws.loginUser(confirmingMember);
      setConfirmingMember(null);
      setConfirmPassword("");
      toast.success(`Logged in as ${confirmingMember.name}!`);
    } else {
      toast.error("Incorrect password for quick login.");
    }
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
                      placeholder="e.g. ahmed.kamal@cis.asu.edu.eg"
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
                <div className="grid gap-4 sm:grid-cols-2">
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
                    <label htmlFor="reg-role" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Research Role
                    </label>
                    <select
                      id="reg-role"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand transition-colors text-foreground"
                    >
                      <option value="Researcher">Researcher</option>
                      <option value="Team Leader">Team Leader</option>
                      <option value="Developer">Developer</option>
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="Documentation">Documentation</option>
                      <option value="Supervisor">Supervisor</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="e.g. abdalla.nasser@cis.asu.edu.eg"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand transition-colors text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-pass" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Create Password
                  </label>
                  <input
                    id="reg-pass"
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand transition-colors text-foreground"
                  />
                </div>

                {/* Conditional Fields for Researcher role */}
                {regRole === "Researcher" && (
                  <div className="pt-4 border-t border-border/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h3 className="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      Researcher Validation Details
                    </h3>
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label htmlFor="uni-id" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                          University ID
                        </label>
                        <input
                          id="uni-id"
                          type="text"
                          required
                          placeholder="e.g. 2026118"
                          value={uniId}
                          onChange={(e) => setUniId(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-brand text-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="phone" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          required
                          placeholder="e.g. +20123456789"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-brand text-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="uni-email" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                        University Email
                      </label>
                      <input
                        id="uni-email"
                        type="email"
                        required
                        placeholder="e.g. research@cis.asu.edu.eg"
                        value={uniEmail}
                        onChange={(e) => setUniEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-brand text-foreground"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="cv-text" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                        CV Summary & Background
                      </label>
                      <textarea
                        id="cv-text"
                        required
                        placeholder="Detail your scientific experience, clinical NLP context, or previous publications..."
                        value={cv}
                        onChange={(e) => setCv(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-brand resize-none text-foreground"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label htmlFor="p-email" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Private Email
                        </label>
                        <input
                          id="p-email"
                          type="email"
                          required
                          placeholder="e.g. private@gmail.com"
                          value={privateEmail}
                          onChange={(e) => setPrivateEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-brand text-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="v-p-email" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Verify Private Email
                        </label>
                        <input
                          id="v-p-email"
                          type="email"
                          required
                          placeholder="Confirm email address"
                          value={verifyPrivateEmail}
                          onChange={(e) => setVerifyPrivateEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-brand text-foreground"
                        />
                      </div>
                    </div>
                  </div>
                )}

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
            {ws.members.length > 0 && (
              <>
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

                {confirmingMember ? (
                  /* Password Verification overlay for Quick Login */
                  <form
                    onSubmit={handleConfirmQuickLogin}
                    className="space-y-3 p-4 rounded-xl border border-border bg-surface-muted/30 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold text-white"
                          style={{
                            background: `linear-gradient(140deg, oklch(0.6 0.14 ${confirmingMember.color}), oklch(0.42 0.13 ${confirmingMember.color}))`,
                          }}
                        >
                          {confirmingMember.initials}
                        </span>
                        <div>
                          <span className="block text-xs font-bold text-foreground">
                            {confirmingMember.name}
                          </span>
                          <span className="block text-[9px] uppercase font-semibold text-muted-foreground">
                            {confirmingMember.role}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-brand/80 font-bold bg-brand/5 px-2 py-0.5 rounded-full">
                        Verification Required
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                        <Lock className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="Enter account password..."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-brand text-foreground"
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setConfirmingMember(null)}
                        className="px-2.5 py-1.5 rounded-lg border border-border text-[10px] font-semibold text-foreground hover:bg-muted cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-brand text-brand-foreground text-[10px] font-semibold transition-colors hover:bg-brand/90 cursor-pointer"
                      >
                        Verify & Log In
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Members Cards list */
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {ws.members.slice(0, 6).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleQuickLoginClick(m)}
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
                )}
              </>
            )}
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
