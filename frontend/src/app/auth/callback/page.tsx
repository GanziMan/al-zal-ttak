"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { setToken } from "@/lib/auth";

function CallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setToken(token);
      window.location.href = "/";
    } else {
      window.location.href = "/login?error=no_token";
    }
  }, [searchParams]);

  return (
    <p className="text-sm text-muted-foreground">로그인 처리 중...</p>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Suspense fallback={<p className="text-sm text-muted-foreground">로딩 중...</p>}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
