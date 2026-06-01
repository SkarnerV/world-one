import { NavLink, useLocation } from "react-router-dom";
import {
  MessageSquarePlus,
  Search,
  Settings as SettingsIcon,
  LayoutGrid,
  Sparkles,
  ListTodo,
  Calendar,
  Bell,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { FilterTab, SessionSummary } from "@/types";
import { classNames, timeAgo } from "@/lib/utils";

const FILTERS: Array<{ id: FilterTab; label: string; icon: typeof Sparkles }> = [
  { id: "all", label: "全部", icon: Sparkles },
  { id: "task", label: "任务", icon: ListTodo },
  { id: "app", label: "应用", icon: LayoutGrid },
  { id: "event", label: "事件", icon: Bell },
];

const ICON_FOR_KIND: Record<SessionSummary["kind"], typeof MessageSquarePlus> = {
  conversation: MessageSquarePlus,
  task: ListTodo,
  app: LayoutGrid,
  event: Calendar,
};

export function Sidebar() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ items: SessionSummary[] }>("/sessions")
      .then((data) => {
        if (!cancelled) {
          setSessions(data.items);
          setLoading(false);
        }
      })
      .catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = filterSessions(sessions, activeFilter);

  return (
    <aside className="w-[232px] shrink-0 h-full bg-sidebar-bg text-ink-onDark flex flex-col dark-scroll">
      <div className="px-4 pt-4 pb-2">
        <BrandHeader />
      </div>

      <div className="px-4 pb-2">
        <SearchBar />
      </div>

      <div className="px-4 pb-3">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 h-8 rounded-lg bg-sidebar-active hover:bg-accent-hover text-white text-sm font-semibold transition-colors"
        >
          <MessageSquarePlus className="w-4 h-4" />
          新建对话
        </button>
      </div>

      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveFilter(id)}
              className={classNames(
                "h-7 px-2.5 inline-flex items-center gap-1.5 rounded-lg text-[12.5px] font-semibold transition-colors border",
                activeFilter === id
                  ? "bg-sidebar-active border-transparent text-white"
                  : "bg-sidebar-bg border-sidebar-border text-ink-onDark hover:bg-sidebar-hover",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-2">
        {loading ? (
          <SkeletonList />
        ) : (
          filtered.map((s) => <SessionCard key={s.id} session={s} />)
        )}
      </nav>

      <FooterUtility />
    </aside>
  );
}

function BrandHeader() {
  return (
    <div className="flex items-center gap-2 h-7">
      <div className="w-7 h-7 rounded-lg bg-sidebar-active flex items-center justify-center">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <span className="text-ink-inverse text-base font-extrabold tracking-tight">天舟AI</span>
      <div className="flex-1" />
      <button
        type="button"
        className="w-7 h-7 rounded-lg hover:bg-sidebar-hover flex items-center justify-center"
        aria-label="新建对话"
      >
        <MessageSquarePlus className="w-3.5 h-3.5 text-ink-onDark" />
      </button>
    </div>
  );
}

function SearchBar() {
  return (
    <label className="flex items-center gap-2 h-8 rounded-lg px-2.5 bg-sidebar-bg border border-sidebar-border focus-within:border-accent">
      <Search className="w-3.5 h-3.5 text-ink-onDarkMuted" />
      <input
        type="text"
        placeholder="搜索对话、任务、事件"
        className="flex-1 bg-transparent text-[12.5px] placeholder:text-ink-onDarkMuted/70 text-ink-inverse outline-none"
      />
    </label>
  );
}

function SessionCard({ session }: { session: SessionSummary }) {
  const Icon = ICON_FOR_KIND[session.kind];
  const isActive = session.id === "sess_canvas_app";
  return (
    <NavLink
      to={linkForSession(session)}
      className={classNames(
        "block rounded-lg p-2.5 border transition-colors",
        isActive
          ? "bg-sidebar-active border-transparent"
          : "bg-sidebar-bg border-sidebar-border hover:bg-sidebar-hover",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={classNames(
            "w-6 h-6 rounded-md flex items-center justify-center",
            isActive ? "bg-white/10" : "bg-white/5",
          )}
        >
          <Icon className="w-3.5 h-3.5 text-ink-onDark" />
        </span>
        <span className="flex-1 text-[13px] font-semibold text-ink-onDark truncate">
          {session.title}
        </span>
      </div>
      <div
        className={classNames(
          "mt-1 text-[11.5px] truncate",
          isActive ? "text-white/80" : "text-ink-onDarkMuted/80",
        )}
      >
        {session.preview}
      </div>
      <div
        className={classNames(
          "mt-1 text-[10.5px] font-medium",
          isActive ? "text-white/70" : "text-ink-onDarkMuted/60",
        )}
      >
        {timeAgo(session.updatedAt)}
        {session.status === "running" ? " · 运行中" : ""}
      </div>
    </NavLink>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-lg p-2.5 bg-sidebar-bg border border-sidebar-border">
          <div className="h-3 w-32 rounded bg-white/5" />
          <div className="mt-2 h-2.5 w-44 rounded bg-white/5" />
          <div className="mt-1.5 h-2 w-20 rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}

function FooterUtility() {
  const loc = useLocation();
  return (
    <div className="border-t border-sidebar-border p-3 grid grid-cols-2 gap-1.5">
      <FooterBtn
        to="/settings"
        label="设置"
        active={loc.pathname.startsWith("/settings")}
        icon={<SettingsIcon className="w-4 h-4" />}
      />
      <FooterBtn
        to="/apps"
        label="应用"
        active={loc.pathname.startsWith("/apps")}
        icon={<LayoutGrid className="w-4 h-4" />}
      />
    </div>
  );
}

function FooterBtn({
  to,
  label,
  active,
  icon,
}: {
  to: string;
  label: string;
  active?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={classNames(
        "h-10 rounded-lg flex items-center justify-center gap-1.5 text-[12.5px] font-semibold border transition-colors",
        active
          ? "bg-sidebar-active border-transparent text-white"
          : "bg-sidebar-bg border-sidebar-border text-ink-onDark hover:bg-sidebar-hover",
      )}
    >
      {icon}
      {label}
    </NavLink>
  );
}

function linkForSession(s: SessionSummary): string {
  if (s.id === "sess_sr_add") return "/todo";
  if (s.id === "sess_event_blocker") return "/system";
  if (s.id === "sess_app_calendar") return "/apps/memory";
  return "/chat";
}

function filterSessions(items: SessionSummary[], filter: FilterTab): SessionSummary[] {
  if (filter === "all") return items;
  return items.filter((i) => {
    if (filter === "task") return i.kind === "task";
    if (filter === "app") return i.kind === "app" || i.kind === "conversation";
    if (filter === "event") return i.kind === "event";
    return true;
  });
}
