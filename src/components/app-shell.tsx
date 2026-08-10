import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Activity as ActivityIcon,
  Bell,
  CalendarDays,
  ChevronDown,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  KanbanSquare,
  LayoutDashboard,
  Link2,
  Mic,
  Moon,
  NotebookPen,
  Route as RouteIcon,
  Search,
  Settings,
  Sun,
  Users,
  Video,
  X,
  Menu,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace-store";
import { Initials } from "@/components/ui-bits";
import { GlobalSearch } from "@/components/global-search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/papers", label: "Research Papers", icon: FileText },
  { to: "/tasks", label: "Tasks", icon: KanbanSquare },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/media", label: "Screenshots", icon: ImageIcon },
  { to: "/voice", label: "Voice Notes", icon: Mic },
  { to: "/meetings", label: "Meetings", icon: Video },
  { to: "/roadmap", label: "Roadmap", icon: RouteIcon },
  { to: "/wheel", label: "Spin the Wheel", icon: HelpCircle },
  { to: "/files", label: "Files", icon: FolderOpen },
  { to: "/links", label: "Resources", icon: Link2 },
  { to: "/team", label: "Team", icon: Users },
  { to: "/activity", label: "Activity", icon: ActivityIcon },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const mobileNav = nav.slice(0, 5);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ws = useWorkspace();
  const { theme, toggleTheme, currentUser, notifications, clearNotifications, markNotificationRead } = ws;
  const [openNav, setOpenNav] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => setOpenNav(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  const sidebar = (
    <div className="flex h-full flex-col gap-1 overflow-y-auto px-3 pb-6">
      <Link to="/" className="mb-4 flex items-center px-2 pt-5">
        <span className="min-w-0">
          <span className="font-display block text-[17px] font-black tracking-tight text-sidebar-foreground">
            ResearchHub
          </span>
          <span className="block truncate text-[11px] text-sidebar-foreground/60">{ws.project.institution}</span>
        </span>
      </Link>

      {nav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
            isActive(item.to)
              ? "bg-sidebar-accent text-sidebar-foreground shadow-inner"
              : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
          )}
        >
          <item.icon className={cn("h-4 w-4 shrink-0", isActive(item.to) && "text-brand")} />
          <span className="truncate">{item.label}</span>
        </Link>
      ))}

      <div className="mt-6 rounded-xl bg-sidebar-accent/60 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/55">
          Current phase
        </p>
        <p className="mt-1 text-sm font-semibold text-sidebar-foreground">{ws.project.phase}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sidebar-foreground/15">
          <div className="h-full rounded-full bg-brand" style={{ width: `${ws.project.progress}%` }} />
        </div>
        <p className="mt-1.5 text-[11px] text-sidebar-foreground/60">{ws.project.progress}% overall progress</p>
      </div>
    </div>
  );

  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border bg-sidebar md:block">
        {sidebar}
      </aside>

      {openNav && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpenNav(false)}
          />
          <aside className="animate-in slide-in-from-left absolute inset-y-0 left-0 w-72 border-r border-sidebar-border bg-sidebar duration-200">
            <button
              className="absolute right-3 top-5 rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent"
              onClick={() => setOpenNav(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-2 px-4 sm:px-6">
            <button
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary md:hidden"
              onClick={() => setOpenNav(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary md:flex">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="max-w-[180px] truncate">{ws.project.institution}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                <DropdownMenuLabel>Teams</DropdownMenuLabel>
                <DropdownMenuItem>{ws.project.institution} · {ws.project.name}</DropdownMenuItem>
                <DropdownMenuItem>NLP Reading Group</DropdownMenuItem>
                <DropdownMenuItem>Faculty AI Seminar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => setSearchOpen(true)}
              className="ml-auto flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card p-2 md:px-3 md:py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary md:ml-4 md:max-w-md md:flex-1 animate-in fade-in duration-200"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="truncate hidden sm:inline">Search papers, tasks, notes…</span>
              <span className="truncate sm:hidden text-xs font-semibold">Search</span>
              <kbd className="ml-auto hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium sm:block">
                ⌘K
              </kbd>
            </button>

            <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-2">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <Bell className="h-4.5 w-4.5" />
                  {unread > 0 && (
                    <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                      {unread}
                    </span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <DropdownMenuLabel className="p-0 text-xs font-semibold">Notifications</DropdownMenuLabel>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => {
                          clearNotifications();
                          toast.success("All notifications cleared");
                        }}
                        className="text-[10px] font-black text-destructive hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <div className="max-h-[280px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <DropdownMenuItem 
                          key={n.id} 
                          onClick={() => {
                            markNotificationRead(n.id);
                            toast.success("Marked as read");
                          }}
                          className="flex flex-col items-start gap-0.5 py-2 px-3 cursor-pointer focus:bg-muted/50"
                        >
                          <span className="flex w-full items-center gap-1.5 text-xs font-bold">
                            {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />}
                            {n.title}
                          </span>
                          <span className="line-clamp-2 text-[11px] text-muted-foreground">{n.body}</span>
                          <span className="text-[10px] text-muted-foreground/60">{n.time} ago</span>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        No notifications
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="ml-1 rounded-full">
                  <Initials member={currentUser || undefined} size={32} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col">
                    <span>{currentUser?.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{currentUser?.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/team">Team & profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Project settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={ws.logoutUser} className="cursor-pointer text-destructive focus:bg-destructive/10">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-6 sm:px-6 md:pb-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5">
          {mobileNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                isActive(item.to) ? "text-brand" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              <span className="truncate">{item.label.split(" ")[0]}</span>
            </Link>
          ))}
        </div>
      </nav>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}