import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Database, Upload, CalendarClock, ListTodo, Calendar, PenTool } from "lucide-react";
import { api } from "@/lib/api";
import { APPS } from "@/mocks/seed";
import type { AppDescriptor } from "@/types";
import { Topbar } from "@/components/layout/Topbar";
import { DynamicIcon } from "@/components/chat/SurfaceRenderer";
import { classNames } from "@/lib/utils";

type Filter = "all" | "enabled";

export default function AllAppsPage() {
  const [apps, setApps] = useState<AppDescriptor[]>(APPS);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get<{ items: AppDescriptor[] }>("/apps").then((d) => setApps(d.items)).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (filter === "enabled" && !a.enabled) return false;
      if (q && !`${a.name}${a.description}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [apps, filter, q]);

  function toggle(id: string) {
    const target = apps.find((a) => a.id === id);
    if (!target) return;
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
    api.patch(`/apps/${id}`, { enabled: !target.enabled }).catch(() => {});
  }

  return (
    <div className="h-full flex flex-col bg-app-bg">
      <Topbar title="全部应用" badge={{ label: `${filtered.length} 个应用`, tone: "neutral" }} />
      <div className="flex-1 min-h-0 px-5 py-4 overflow-y-auto">
        <div className="mx-auto max-w-[1640px] space-y-3">
          <div className="rounded-xl border border-line bg-white p-5 space-y-3">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-ink text-[30px] font-bold font-display leading-tight">
                  全部应用
                </div>
                <p className="text-ink-muted text-[13.5px]">
                  从全局应用入口进入；07 聚合可打开的应用模块，Memory 作为 07A 衍生页在 Canvas 中展开。
                </p>
              </div>
              <div className="flex-1" />
              <label className="h-10 w-[280px] rounded-lg border border-line-strong bg-app-soft px-3 flex items-center gap-2 focus-within:border-accent">
                <Search className="w-3.5 h-3.5 text-ink-muted" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="搜索应用"
                  className="flex-1 bg-transparent text-[13px] placeholder:text-ink-subtle outline-none"
                />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
                全部
              </FilterChip>
              <FilterChip active={filter === "enabled"} onClick={() => setFilter("enabled")}>
                已启用
              </FilterChip>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filtered.map((a) => (
              <AppCard
                key={a.id}
                app={a}
                onToggle={() => toggle(a.id)}
                onOpen={() => (a.routesTo ? navigate(a.routesTo) : null)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "h-8 px-3 rounded-lg text-[13px] font-bold border",
        active ? "bg-accent text-white border-transparent" : "bg-app-soft text-ink border-line",
      )}
    >
      {children}
    </button>
  );
}

function AppCard({
  app,
  onToggle,
  onOpen,
}: {
  app: AppDescriptor;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const toneToText: Record<AppDescriptor["tone"], string> = {
    blue: "text-accent",
    green: "text-success",
    indigo: "text-indigo-500",
    amber: "text-warning",
    slate: "text-ink-muted",
  };
  return (
    <div
      className={classNames(
        "rounded-md border p-4 space-y-2.5 bg-white",
        app.highlight ? "border-accent-ring" : "border-line",
      )}
    >
      <div className="flex items-center gap-2.5">
        <DynamicIcon name={app.icon} className={classNames("w-5 h-5", toneToText[app.tone])} />
        <span className="text-ink text-[17px] font-bold">{app.name}</span>
        <span className="flex-1" />
        <Switch checked={app.enabled} onChange={onToggle} />
      </div>
      <p className="text-ink-muted text-[13px] leading-[1.45]">{app.description}</p>
      <div className="flex items-center gap-2">
        <span className="px-1.5 py-0.5 rounded-md bg-app-soft text-ink-muted text-[10.5px] font-bold">
          {app.category === "system" ? "系统" : app.category === "builtin" ? "内置" : "扩展"}
        </span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={onOpen}
          className="h-8 px-3 rounded-lg text-accent text-[12.5px] font-bold hover:bg-accent-soft"
        >
          打开
        </button>
      </div>
    </div>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={classNames(
        "w-9 h-5 rounded-full relative transition-colors",
        checked ? "bg-accent" : "bg-line-strong",
      )}
    >
      <span
        className={classNames(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-soft transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
