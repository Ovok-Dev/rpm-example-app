import { useState } from "react";
import type { OvokClient } from "@ovok/core";
import { LockKeyhole, X } from "lucide-react";
import { getOvokClient } from "../lib/ovokClient";

type LoginResponse = Awaited<ReturnType<OvokClient["login"]>>;
type AuthenticatedLogin = Extract<LoginResponse, { accessToken: string }>;

interface SignInDialogProps {
  onClose: () => void;
  onAuthenticated: (client: OvokClient, login: AuthenticatedLogin) => Promise<void>;
  tenantCode: string;
}

export function SignInDialog({ onClose, onAuthenticated, tenantCode }: SignInDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingMfa, setPendingMfa] = useState<Extract<LoginResponse, { nextStep: "mfa" }> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      await onAuthenticated(client, result);
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
      const client = await getOvokClient();
      await onAuthenticated(client, await pendingMfa.verify(verificationCode.trim()));
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
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="sign-in-title">
        <button className="dialog-close" aria-label="Close sign in" onClick={onClose} disabled={busy}>
          <X size={18} />
        </button>
        <div className="dialog-icon"><LockKeyhole size={19} /></div>
        <h2 id="sign-in-title">Connect your sandbox</h2>
        <p className="dialog-copy">
          Sign in with a practitioner account. Ovok AccessPolicies authorize every record request.
        </p>
        <form className="form-stack" onSubmit={pendingMfa ? submitVerification : submitSignIn}>
          {pendingMfa ? (
            <>
              <label htmlFor="mfa-code">Authenticator code</label>
              <input
                id="mfa-code"
                autoComplete="one-time-code"
                inputMode="numeric"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                required
              />
            </>
          ) : (
            <>
              <label htmlFor="clinician-email">Practitioner email</label>
              <input id="clinician-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <label htmlFor="clinician-password">Password</label>
              <input id="clinician-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <div className="tenant-field"><span>Tenant</span><strong>{tenantCode}</strong></div>
            </>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary" disabled={busy}>
            {busy ? "Connecting…" : pendingMfa ? "Verify and connect" : "Sign in to Ovok sandbox"}
          </button>
        </form>
        <p className="fine-print">Your password is not saved by this example.</p>
      </section>
    </div>
  );
}

function messageFor(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Sign-in could not be completed. Check the account and project configuration.";
}
