import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/lib/workspace-store";
import { PageHeader, Panel, EmptyState } from "@/components/ui-bits";
import { HelpCircle, Plus, Trash2, Users, RotateCw, History, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/wheel")({
  head: () => ({
    meta: [
      { title: "Decision Wheel — SehatMasr" },
      {
        name: "description",
        content: "Spin the wheel to select a team member or choose random papers/tasks in the workspace.",
      },
    ],
  }),
  component: SpinWheelPage,
});

type WinnerLog = {
  name: string;
  time: string;
};

function SpinWheelPage() {
  const ws = useWorkspace();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [names, setNames] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<WinnerLog[]>([]);

  useEffect(() => {
    if (ws.members.length > 0) {
      setNames(ws.members.map((m) => m.name));
    } else {
      setNames(["Teammate 1", "Teammate 2"]);
    }
  }, [ws.members]);

  // Wheel animation state
  const angleRef = useRef(0);
  const speedRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Load team members from workspace
  const handleLoadTeam = () => {
    if (ws.members.length > 0) {
      setNames(ws.members.map((m) => m.name));
      toast.success("Loaded workspace research team!");
    }
  };

  const handleAddName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    if (names.includes(newName.trim())) {
      toast.error("Name already in the wheel!");
      return;
    }
    setNames((prev) => [...prev, newName.trim()]);
    setNewName("");
    toast.success(`Added ${newName.trim()} to the wheel`);
  };

  const handleRemoveName = (index: number) => {
    if (names.length <= 2) {
      toast.error("You need at least 2 names to spin!");
      return;
    }
    const removed = names[index];
    setNames((prev) => prev.filter((_, i) => i !== index));
    toast.info(`Removed ${removed}`);
  };

  // Draw the wheel
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 12;

    ctx.clearRect(0, 0, size, size);

    if (names.length === 0) return;

    const arcSize = (2 * Math.PI) / names.length;

    // Draw slices
    names.forEach((name, i) => {
      const startArc = angleRef.current + i * arcSize;
      const endArc = startArc + arcSize;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startArc, endArc);
      ctx.closePath();

      // OKLCH gradients for slices
      const hue = (i * (360 / names.length)) % 360;
      ctx.fillStyle = `oklch(0.66 0.14 ${hue})`;
      ctx.fill();

      // Slice stroke border
      ctx.strokeStyle = "oklch(1 0 0 / 15%)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw name text inside slices
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startArc + arcSize / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      
      // Responsive text size
      ctx.fillStyle = "white";
      ctx.font = "bold 13px Sora, sans-serif";
      
      // Limit text size
      const maxTextWidth = radius - 45;
      let textToDraw = name;
      if (ctx.measureText(textToDraw).width > maxTextWidth) {
        textToDraw = name.split(" ")[0] || name;
      }
      
      ctx.fillText(textToDraw, radius - 24, 0);
      ctx.restore();
    });

    // Draw gold center cap
    ctx.beginPath();
    ctx.arc(center, center, 24, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = "oklch(0.29 0.075 258)"; // deep brand blue
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center hub inner ring
    ctx.beginPath();
    ctx.arc(center, center, 12, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = "oklch(0.56 0.16 255)"; // brand accent
    ctx.fill();
  };

  // Run the spinning animation loop
  const animateSpin = () => {
    if (speedRef.current > 0) {
      angleRef.current = (angleRef.current + speedRef.current) % (2 * Math.PI);
      speedRef.current *= 0.982; // decelerate / friction

      // Stop condition
      if (speedRef.current < 0.0012) {
        speedRef.current = 0;
        setIsSpinning(false);

        // Calculate winner
        const arcSize = (2 * Math.PI) / names.length;
        // Needle is at top (270 degrees / 1.5 * Math.PI)
        const normalizedAngle = (1.5 * Math.PI - angleRef.current) % (2 * Math.PI);
        const positiveAngle = normalizedAngle < 0 ? normalizedAngle + 2 * Math.PI : normalizedAngle;
        const index = Math.floor(positiveAngle / arcSize) % names.length;
        const chosen = names[index] || "Unknown";

        setWinner(chosen);
        setHistory((prev) => [
          { name: chosen, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
          ...prev.slice(0, 9),
        ]);
        toast.success(`Winner chosen: ${chosen}!`, { duration: 6000 });
      }

      drawWheel();
      animationFrameRef.current = requestAnimationFrame(animateSpin);
    }
  };

  const handleSpin = () => {
    if (isSpinning || names.length < 2) return;
    setWinner(null);
    setIsSpinning(true);
    // Initial velocity
    speedRef.current = 0.35 + Math.random() * 0.25;
    animateSpin();
  };

  useEffect(() => {
    drawWheel();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [names]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Decision Wheel"
        subtitle="Stuck on who presents next or who reviews a paper? Spin the wheel to make a fair, random choice."
        actions={
          <button
            onClick={handleLoadTeam}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary cursor-pointer"
          >
            <Users className="h-4 w-4" />
            Load Team Roster
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Side: Spinner Card */}
        <Panel className="flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden min-h-[500px]">
          {/* Subtle glow behind the wheel */}
          <div className="absolute h-96 w-96 rounded-full bg-brand/4 blur-[100px] pointer-events-none" />

          <div className="relative">
            {/* Pointer Needle indicator at 12 o'clock */}
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
              {/* Pointer Needle */}
              <div 
                className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-destructive filter drop-shadow"
                style={{ borderTopColor: "oklch(0.577 0.225 27.3)" }}
              />
              {/* Needle pivot */}
              <div className="h-3 w-3 rounded-full bg-card border border-border shadow-sm mt-[-5px]" />
            </div>

            {/* Canvas spinner */}
            <canvas
              ref={canvasRef}
              width={380}
              height={380}
              className="max-w-full rounded-full border-4 border-card shadow-2xl bg-muted/20"
            />
          </div>

          <div className="mt-8 text-center space-y-4">
            <button
              onClick={handleSpin}
              disabled={isSpinning || names.length < 2}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand text-brand-foreground px-8 py-3.5 font-bold tracking-wide transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <RotateCw className={`h-5 w-5 ${isSpinning && "animate-spin"}`} />
              {isSpinning ? "Spinning..." : "SPIN WHEEL"}
            </button>

            {winner && (
              <div className="animate-in zoom-in-95 duration-300 p-4 rounded-2xl bg-success/10 border border-success/20 flex flex-col items-center max-w-sm mx-auto shadow-inner">
                <span className="flex items-center gap-1.5 text-xs font-bold text-success uppercase tracking-wider">
                  <Sparkles className="h-4.5 w-4.5 text-success animate-bounce" />
                  We Have a Winner
                </span>
                <span className="font-display mt-1 text-2xl font-black text-foreground">
                  {winner}
                </span>
                <button
                  onClick={() => {
                    const winnerIdx = names.indexOf(winner);
                    if (winnerIdx !== -1) {
                      handleRemoveName(winnerIdx);
                      setWinner(null);
                    }
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove from Wheel
                </button>
              </div>
            )}
          </div>
        </Panel>

        {/* Right Side: Options and History panel */}
        <div className="space-y-6">
          {/* Wheel roster names list */}
          <Panel className="p-5 flex flex-col h-[320px]">
            <h2 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-brand" />
              Wheel Roster ({names.length})
            </h2>

            {/* Add new name input */}
            <form onSubmit={handleAddName} className="flex gap-2 mb-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Add custom name..."
                className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand text-foreground"
              />
              <button
                type="submit"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground hover:bg-brand/95 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            {/* List scrollarea */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {names.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-surface-muted/50 border border-border px-3 py-2 text-sm group"
                >
                  <span className="font-medium truncate text-foreground pr-2">{name}</span>
                  <button
                    onClick={() => handleRemoveName(i)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer rounded-lg hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Panel>

          {/* History Panel */}
          <Panel className="p-5 h-[230px] flex flex-col">
            <h2 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-brand" />
              Recent Spins
            </h2>

            <div className="flex-1 overflow-y-auto space-y-2">
              {history.length > 0 ? (
                history.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-border/60 pb-1.5 text-sm"
                  >
                    <span className="font-semibold text-foreground truncate max-w-[190px]">
                      {log.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={<HelpCircle className="h-8 w-8" />}
                  title="No spins yet"
                  hint="Spin the wheel to view the decision history here."
                />
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
