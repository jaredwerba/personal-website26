"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mdrbx/nerv-ui";
import { authClient } from "@/lib/auth-client";

type Mode = "signup" | "signin" | "recover";

function randomPassword() {
  const a = new Uint8Array(18);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

const inputCls =
  "w-full bg-nerv-black border border-nerv-mid-gray/40 font-nerv-mono text-sm text-nerv-cyan placeholder:text-nerv-mid-gray/50 tracking-wider px-3 py-2 outline-none focus:border-nerv-cyan transition-colors";
const labelCls =
  "block font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-cyan/70 uppercase mb-1.5";

export default function SignupGate() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function err(text: string) {
    setFlash({ kind: "err", text });
  }
  function ok(text: string) {
    setFlash({ kind: "ok", text });
  }

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setFlash(null);
    if (!name.trim() || !email.trim()) {
      err("Name and email required.");
      return;
    }
    setBusy(true);
    try {
      const signUp = await authClient.signUp.email({
        email: email.trim(),
        name: name.trim(),
        password: randomPassword(),
      });
      if (signUp?.error) {
        err(signUp.error.message || "Sign-up failed. Try signing in instead.");
        return;
      }
      try {
        const pk = await authClient.passkey.addPasskey({ name: "Primary" });
        if (pk && "error" in pk && pk.error) {
          err(pk.error.message || "Account created, but passkey didn't save.");
          return;
        }
      } catch {
        err("Account created, but passkey didn't save. Sign out and retry.");
        return;
      }
      ok("You're in — pick a ride below.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function signInWithPasskey(e: React.FormEvent) {
    e.preventDefault();
    setFlash(null);
    setBusy(true);
    try {
      const res = await authClient.signIn.passkey();
      if (res?.error) {
        err(res.error.message || "No passkey found on this device.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function requestMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setFlash(null);
    if (!email.trim()) {
      err("Enter the email you signed up with.");
      return;
    }
    setBusy(true);
    try {
      const res = await authClient.signIn.magicLink({
        email: email.trim(),
        callbackURL: "/ride?recovered=1",
        errorCallbackURL: "/ride",
      });
      if (res?.error) {
        if (res.error.code === "USER_NOT_FOUND") {
          ok("If that email has an account, a link is on its way.");
          return;
        }
        err(res.error.message || "Could not send sign-in link.");
        return;
      }
      ok("Sign-in link sent. Check your email.");
    } finally {
      setBusy(false);
    }
  }

  const isSignup = mode === "signup";
  const isSignin = mode === "signin";
  const isRecover = mode === "recover";

  const heading = isSignup
    ? "CREATE.ACCOUNT"
    : isSignin
      ? "SIGN.IN"
      : "RECOVER.ACCESS";
  const sub = isRecover
    ? "Lost your passkey? We'll email you a one-time sign-in link. 10-min expiry."
    : "No passwords. Face ID or device passkey.";
  const submitLabel = isSignup
    ? "CREATE.WITH.PASSKEY"
    : isSignin
      ? "SIGN.IN.WITH.PASSKEY"
      : "SEND.SIGN-IN.LINK";
  const onSubmit = isSignup ? createAccount : isSignin ? signInWithPasskey : requestMagicLink;

  return (
    <div className="border border-nerv-cyan/30 bg-nerv-black/50 p-5 md:p-6 space-y-4">
      <div className="space-y-1">
        <p className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-mid-gray">
          // PRIVATE.SCHEDULE
        </p>
        <h3 className="font-nerv-display text-xl md:text-2xl tracking-[0.14em] text-nerv-orange uppercase">
          {heading}
        </h3>
        <p className="font-nerv-body text-sm text-nerv-white/80">{sub}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 max-w-md">
        {isSignup && (
          <div>
            <label htmlFor="gate-name" className={labelCls}>
              NAME
            </label>
            <input
              id="gate-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              className={inputCls}
            />
          </div>
        )}
        <div>
          <label htmlFor="gate-email" className={labelCls}>
            EMAIL
          </label>
          <input
            id="gate-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete={isSignup || isRecover ? "email" : "username webauthn"}
            required={isSignup || isRecover}
            className={inputCls}
          />
        </div>
        <div className="pt-1">
          <Button type="submit" variant="terminal" disabled={busy}>
            {busy ? "WORKING..." : submitLabel}
          </Button>
        </div>
      </form>

      {flash && (
        <p
          className={`font-nerv-mono text-[11px] tracking-wider ${
            flash.kind === "err" ? "text-nerv-red" : "text-nerv-green"
          }`}
        >
          {flash.kind === "err" ? "! " : "> "}
          {flash.text}
        </p>
      )}

      <div className="pt-2 border-t border-nerv-mid-gray/20 space-y-1.5 font-nerv-mono text-[11px] text-nerv-mid-gray">
        {isSignup && (
          <p>
            ALREADY.REGISTERED?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              disabled={busy}
              className="text-nerv-cyan hover:text-nerv-orange underline underline-offset-2 decoration-dotted"
            >
              SIGN.IN
            </button>
          </p>
        )}
        {isSignin && (
          <>
            <p>
              NEW.HERE?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                disabled={busy}
                className="text-nerv-cyan hover:text-nerv-orange underline underline-offset-2 decoration-dotted"
              >
                CREATE.ACCOUNT
              </button>
            </p>
            <p>
              CAN&apos;T.SIGN.IN?{" "}
              <button
                type="button"
                onClick={() => setMode("recover")}
                disabled={busy}
                className="text-nerv-cyan hover:text-nerv-orange underline underline-offset-2 decoration-dotted"
              >
                EMAIL.ME.A.LINK
              </button>
            </p>
          </>
        )}
        {isRecover && (
          <p>
            <button
              type="button"
              onClick={() => setMode("signin")}
              disabled={busy}
              className="text-nerv-cyan hover:text-nerv-orange underline underline-offset-2 decoration-dotted"
            >
              &larr; BACK.TO.SIGN.IN
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
