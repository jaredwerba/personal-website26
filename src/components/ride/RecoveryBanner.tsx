export default function RecoveryBanner({ mode }: { mode: "recovered" | "error" }) {
  if (mode === "recovered") {
    return (
      <div className="border border-nerv-green/50 bg-nerv-green/5 p-3">
        <p className="font-nerv-mono text-[11px] text-nerv-green tracking-wider">
          &gt; YOU&apos;RE.SIGNED.IN &mdash; ADD.A.PASSKEY.TO.YOUR.ACCOUNT.FOR.NEXT.TIME
        </p>
      </div>
    );
  }
  return (
    <div className="border border-nerv-red/50 bg-nerv-red/5 p-3">
      <p className="font-nerv-mono text-[11px] text-nerv-red tracking-wider">
        ! LINK.EXPIRED.OR.INVALID &mdash; REQUEST.A.NEW.ONE.BELOW
      </p>
    </div>
  );
}
