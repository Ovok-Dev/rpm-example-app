import { useState } from "react";
import { X } from "lucide-react";
import { validatePatientRegistration } from "../domain";

export interface RegistrationInput {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  consented: boolean;
}

interface PatientRegistrationDialogProps {
  busy?: boolean;
  demo: boolean;
  onClose: () => void;
  onRegister: (input: RegistrationInput) => Promise<void>;
}

const emptyForm: RegistrationInput = {
  firstName: "",
  lastName: "",
  birthDate: "",
  email: "",
  phone: "",
  address: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  consented: false,
};

export function PatientRegistrationDialog({ busy = false, demo, onClose, onRegister }: PatientRegistrationDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function updateField<K extends keyof RegistrationInput>(key: K, value: RegistrationInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validatePatientRegistration(form);
    setErrors(validationErrors);
    if (validationErrors.length) return;
    setSubmitError(null);
    try {
      await onRegister(form);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Patient registration failed.");
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onClose();
    }}>
      <section className="dialog dialog-wide" role="dialog" aria-modal="true" aria-labelledby="registration-title">
        <button className="dialog-close" aria-label="Close registration" onClick={onClose} disabled={busy}><X size={18} /></button>
        <h2 id="registration-title">Register a patient</h2>
        <p className="dialog-copy">Create a patient record and capture intake details before enrollment.</p>
        <form className="registration-form" onSubmit={submitRegistration}>
          <label>First name<input autoFocus value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} required /></label>
          <label>Last name<input value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} required /></label>
          <label>Date of birth<input type="date" value={form.birthDate} onChange={(event) => updateField("birthDate", event.target.value)} required /></label>
          <label>Email<input type="email" autoComplete="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required /></label>
          <label>Phone<input type="tel" autoComplete="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required /></label>
          <label>Address<input autoComplete="street-address" value={form.address} onChange={(event) => updateField("address", event.target.value)} /></label>
          <label>Emergency contact<input value={form.emergencyContactName} onChange={(event) => updateField("emergencyContactName", event.target.value)} /></label>
          <label>Emergency contact phone<input type="tel" value={form.emergencyContactPhone} onChange={(event) => updateField("emergencyContactPhone", event.target.value)} /></label>
          {demo ? <label className="check-field"><input type="checkbox" checked={form.consented} onChange={(event) => updateField("consented", event.target.checked)} /> Synthetic consent status recorded in this demo</label> : <p className="notice registration-notice">This form does not record legal consent or signatures. Use your validated consent workflow, then review the patient's FHIR Consent records in the chart.</p>}
          {errors.length > 0 && <ul className="form-error form-errors" role="alert">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}
          {submitError && <p className="form-error" role="alert">{submitError}</p>}
          <div className="dialog-actions">
            <button className="button button-secondary" type="button" onClick={onClose} disabled={busy}>Cancel</button>
            <button className="button button-primary" disabled={busy}>{busy ? "Saving…" : "Create patient record"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
