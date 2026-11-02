"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LockKeyhole, Sparkles } from "lucide-react";
import { adminApi } from "@/lib/api";

interface AuthResponse {
  accessToken: string;
  user: { globalRole: "USER" | "SUPERADMIN" };
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await adminApi<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      if (response.user.globalRole !== "SUPERADMIN") {
        throw new Error("슈퍼어드민 계정만 접근할 수 있습니다.");
      }
      window.localStorage.setItem("relay_admin_token", response.accessToken);
      router.push("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-navy p-6">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-2xl sm:p-10">
        <div className="flex items-center gap-2.5 text-lg font-bold">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-white">
            <Sparkles size={19} />
          </span>
          Relay AI <span className="text-muted">Admin</span>
        </div>
        <span className="mt-12 grid size-13 place-items-center rounded-2xl bg-orange-100 text-primary">
          <LockKeyhole size={23} />
        </span>
        <h1 className="mt-6 text-2xl font-bold">관리자 로그인</h1>
        <p className="mt-2 text-sm text-muted">
          서비스 운영 계정으로 로그인하세요.
        </p>
        <form className="mt-8 space-y-4" onSubmit={submit}>
          <input
            name="email"
            type="email"
            required
            placeholder="admin@example.com"
            className="h-13 w-full rounded-xl border border-line px-4"
          />
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="비밀번호"
            className="h-13 w-full rounded-xl border border-line px-4"
          />
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-white disabled:opacity-60"
          >
            {loading && <LoaderCircle className="animate-spin" size={18} />}
            로그인
          </button>
        </form>
      </div>
    </main>
  );
}
