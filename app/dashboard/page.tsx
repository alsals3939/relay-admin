"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  Building2,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MessageSquareText,
  Sparkles,
  Users,
} from "lucide-react";
import { adminApi } from "@/lib/api";

interface Stats {
  users: number;
  workspaces: number;
  members: number;
  messages: number;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  globalRole: string;
  createdAt: string;
  _count: { memberships: number; chatSessions: number };
}

interface WorkspaceItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  owner: { name: string; email: string };
  _count: { members: number; documents: number; chatSessions: number };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const view =
    pathname === "/users"
      ? "users"
      : pathname === "/workspaces"
        ? "workspaces"
        : "overview";
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [statsData, userData, workspaceData] = await Promise.all([
        adminApi<Stats>("/admin/stats"),
        adminApi<{ items: UserItem[] }>("/admin/users?limit=50"),
        adminApi<{ items: WorkspaceItem[] }>("/admin/workspaces?limit=50"),
      ]);
      setStats(statsData);
      setUsers(userData.items);
      setWorkspaces(workspaceData.items);
    } catch {
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Initial client-side API hydration.
    void load();
  }, [load]);

  const nav = [
    { id: "overview", label: "대시보드", icon: LayoutDashboard },
    { id: "users", label: "사용자", icon: Users },
    { id: "workspaces", label: "워크스페이스", icon: Building2 },
  ] as const;

  return (
    <main className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[#d9d9d9] p-5 text-foreground md:flex">
        <div className="flex items-center gap-2.5 text-lg font-bold">
          <span className="grid size-9 place-items-center rounded-xl bg-primary">
            <Sparkles size={18} className="text-white" />
          </span>
          Relay AI <span className="text-foreground/35">Admin</span>
        </div>
        <nav className="mt-10 space-y-1.5">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                router.push(
                  item.id === "overview" ? "/dashboard" : `/${item.id}`,
                );
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${
                view === item.id
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-black/5 hover:text-foreground"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <button
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted hover:bg-black/5 hover:text-foreground"
          onClick={() => {
            window.localStorage.removeItem("relay_admin_token");
            router.push("/login");
          }}
        >
          <LogOut size={17} />
          로그아웃
        </button>
      </aside>

      <section className="min-w-0 flex-1 px-6 py-10 md:ml-64 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-xs font-bold tracking-[0.14em] text-primary">
              RELAY AI OPERATIONS
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em]">
              {view === "overview"
                ? "서비스 현황"
                : view === "users"
                  ? "사용자 관리"
                  : "워크스페이스 관리"}
            </h1>
          </header>

          {loading || !stats ? (
            <div className="grid min-h-[500px] place-items-center text-primary">
              <LoaderCircle className="animate-spin" />
            </div>
          ) : view === "overview" ? (
            <>
              <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "전체 사용자", value: stats.users, icon: Users },
                  {
                    label: "워크스페이스",
                    value: stats.workspaces,
                    icon: Building2,
                  },
                  { label: "전체 멤버십", value: stats.members, icon: Bot },
                  {
                    label: "AI 메시지",
                    value: stats.messages,
                    icon: MessageSquareText,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[22px] border border-line bg-white p-6"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-muted">
                        {item.label}
                      </p>
                      <span className="grid size-10 place-items-center rounded-xl bg-orange-100 text-primary">
                        <item.icon size={18} />
                      </span>
                    </div>
                    <p className="mt-6 text-3xl font-bold">
                      {item.value.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-7 grid gap-7 xl:grid-cols-2">
                <RecentUsers users={users.slice(0, 6)} />
                <RecentWorkspaces workspaces={workspaces.slice(0, 6)} />
              </div>
            </>
          ) : view === "users" ? (
            <RecentUsers users={users} expanded />
          ) : (
            <RecentWorkspaces workspaces={workspaces} expanded />
          )}
        </div>
      </section>
    </main>
  );
}

function RecentUsers({
  users,
  expanded = false,
}: {
  users: UserItem[];
  expanded?: boolean;
}) {
  return (
    <div className={`${expanded ? "mt-9" : ""} overflow-hidden rounded-[22px] border border-line bg-white`}>
      <h2 className="border-b border-line px-6 py-5 font-bold">
        {expanded ? "전체 사용자" : "최근 가입 사용자"}
      </h2>
      <div className="divide-y divide-line">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-3 px-6 py-4">
            <span className="grid size-9 place-items-center rounded-full bg-orange-100 text-sm font-bold text-primary">
              {user.name.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs font-bold">{user.globalRole}</p>
              <p className="mt-1 text-[11px] text-muted">
                워크스페이스 {user._count.memberships}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentWorkspaces({
  workspaces,
  expanded = false,
}: {
  workspaces: WorkspaceItem[];
  expanded?: boolean;
}) {
  return (
    <div className={`${expanded ? "mt-9" : ""} overflow-hidden rounded-[22px] border border-line bg-white`}>
      <h2 className="border-b border-line px-6 py-5 font-bold">
        {expanded ? "전체 워크스페이스" : "최근 생성 워크스페이스"}
      </h2>
      <div className="divide-y divide-line">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="flex items-center gap-3 px-6 py-4">
            <span className="grid size-9 place-items-center rounded-xl bg-sky-100 text-sky-600">
              <Building2 size={17} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{workspace.name}</p>
              <p className="truncate text-xs text-muted">
                {workspace.owner.name} · {workspace.owner.email}
              </p>
            </div>
            <div className="ml-auto text-right text-[11px] text-muted">
              <p>멤버 {workspace._count.members}명</p>
              <p className="mt-1">대화 {workspace._count.chatSessions}개</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
