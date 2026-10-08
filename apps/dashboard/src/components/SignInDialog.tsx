import { useEffect, useRef, useState } from "react";
import { ArrowLeft, LockKeyhole, X } from "lucide-react";
import type { OvokClient } from "@ovok/core";
import { getOvokClient } from "../lib/ovokClient";

type LoginResponse = Awaited<ReturnType<OvokClient["login"]>>;
type PendingMfa = Extract<LoginResponse, { nextStep: "mfa" }>;
type AuthenticatedLogin = Extract<LoginResponse, { accessToken: string }>;

interface SignInDialogProps {
  open: boolean;
  tenantCode: string;
  onClose: () => void;
  onAuthenticated: (login: AuthenticatedLogin) => Promise<void>;
}

export default function SignInDialog({
  open,
  tenantCode,
  onClose,
  onAuthenticated,
}: SignInDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingMfa, setPendingMfa] = useState<PendingMfa | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(busy);
  busyRef.current = busy;

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setPassword("");
    setVerificationCode("");
    setPendingMfa(null);
    setError(null);
    emailRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !busyRef.current) onClose();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  async function submitSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const client = await getOvokClient();
      const result = await client.login({
        type: "Practitioner",
        tenantCode,
        email: email.trim(),
        password,
      });

      if ("nextStep" in result) {
        setPendingMfa(result);
        return;
      }

      await onAuthenticated(result);
      onClose();
    } catch (signInError) {
      setError(messageFor(signInError));
    } finally {
      setBusy(false);
    }
  }

  async function submitVerification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pendingMfa) return;
    setBusy(true);
    setError(null);

    try {
      const authenticated = await pendingMfa.verify(verificationCode.trim());
      await onAuthenticated(authenticated);
      onClose();
    } catch (verificationError) {
      setError(messageFor(verificationError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onClose();
    }}>
      <section className="sign-in-dialog" role="dialog" aria-modal="true" aria-labelledby="sign-in-title">
        <button className="dialog-close" aria-label="Close sign-in" onClick={onClose} disabled={busy}>
          <X size={19} />
        </button>
        {pendingMfa ? (
          <>
            <div className="dialog-icon"><LockKeyhole size={20} /></div>
            <h2 id="sign-in-title">Check your authenticator</h2>
            <p className="dialog-description">Enter the current one-time code to complete practitioner sign-in.</p>
            <form className="sign-in-form" onSubmit={submitVerification}>
              <label htmlFor="mfa-code">Verification code</label>
              <input
                id="mfa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                required
                autoFocus
              />
              {error && <div className="form-error" role="alert">{error}</div>}
              <button className="button button-primary dialog-submit" disabled={busy}>
                {busy ? "Verifying…" : "Verify and connect"}
              </button>
            </form>
            <button className="dialog-back" onClick={() => {
              setPendingMfa(null);
              setError(null);
            }}><ArrowLeft size={15} /> Back to sign in</button>
          </>
        ) : (
          <>
            <div className="dialog-icon"><LockKeyhole size={20} /></div>
            <h2 id="sign-in-title">Connect your project</h2>
            <p className="dialog-description">Sign in with a practitioner account to read patient records and Signals status from your sandbox project.</p>
            <form className="sign-in-form" onSubmit={submitSignIn}>
              <label htmlFor="practitioner-email">Practitioner email</label>
              <input
                id="practitioner-email"
                ref={emailRef}
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <label htmlFor="practitioner-password">Password</label>
              <input
                id="practitioner-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <div className="tenant-field">
                <span>Tenant code</span><strong>{tenantCode}</strong>
              </div>
              {error && <div className="form-error" role="alert">{error}</div>}
              <button className="button button-primary dialog-submit" disabled={busy}>
                {busy ? "Connecting…" : "Sign in to sandbox"}
              </button>
            </form>
            <p className="dialog-security">Your password is sent to Ovok for sign-in and is not saved by this example.</p>
          </>
        )}
      </section>
    </div>
  );
}

function messageFor(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Sign-in could not be completed. Check your account and project configuration.";
}
