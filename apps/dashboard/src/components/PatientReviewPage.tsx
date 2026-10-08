import { ArrowRight, CalendarClock, FileHeart, Search } from "lucide-react";
import type { PatientChoice, PatientReview } from "../types";
import { formatDateTime } from "../lib/formatting";
import MeasurementCards from "./MeasurementCards";

interface PatientReviewPageProps {
  mode: "demo" | "sandbox";
  review: PatientReview | null;
  patients: PatientChoice[];
  selectedPatientId: string;
  loading: boolean;
  error: string | null;
  onSelectPatient: (id: string) => void;
  onConnect: () => void;
  onOpenEhr: () => void;
  demoRelayOnline: boolean;
}

export default function PatientReviewPage({
  mode,
  review,
  patients,
  selectedPatientId,
  loading,
  error,
  onSelectPatient,
  onConnect,
  onOpenEhr,
  demoRelayOnline,
}: PatientReviewPageProps) {
  return (
    <div className="content-stack">
      <section className="page-heading">
        <div>
          <h1>Patient review</h1>
          <p className="page-subtitle">
            Read the latest check-in with its original source and time.
          </p>
        </div>
        <label className="patient-picker">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Choose a patient</span>
          <select
            value={selectedPatientId}
            onChange={(event) => onSelectPatient(event.target.value)}
            disabled={!patients.length}
          >
            {selectedPatientId === "" && <option value="">Choose an authorized patient</option>}
            {patients.length ? patients.map((patient) => (
              <option value={patient.id} key={patient.id}>{patient.name}</option>
            )) : <option value="">No patients available</option>}
          </select>
        </label>
      </section>

      {mode === "demo" && (
        <div className="demo-notice" role="note">
          <span className="demo-notice-icon"><FileHeart size={17} /></span>
          <div><strong>Demo workspace</strong><span>Every patient and reading shown here is synthetic. {demoRelayOnline ? "Local mobile relay connected." : "Mobile relay unavailable; built-in fixtures remain visible."}</span></div>
          <button className="text-button" onClick={onConnect}>Connect sandbox <ArrowRight size={15} /></button>
        </div>
      )}

      {error && <div className="inline-error" role="alert">{error}</div>}
      {loading && <div className="loading-panel" role="status">Loading patient readings…</div>}
      {!loading && mode === "sandbox" && !patients.length && !error && (
        <div className="empty-panel">
          <div className="empty-icon"><Search size={21} /></div>
          <h2>No patient records found</h2>
          <p>This sandbox project returned no patients available to this practitioner.</p>
        </div>
      )}
      {!loading && review && (
        <>
          <section className="patient-identity">
            <div className="patient-identity-main">
              <div className="patient-avatar">{review.initials}</div>
              <div>
                <div className="patient-name-line">
                  <h2>{review.name}</h2>
                  {review.synthetic && <span className="synthetic-badge">SYNTHETIC</span>}
                </div>
                <p>{review.detail}</p>
              </div>
            </div>
            <div className="identity-meta">
              <span className="meta-label">LATEST CHECK-IN</span>
              <span className="meta-value"><CalendarClock size={16} />
                {latestTimestamp(review)}</span>
              <button className="text-button ehr-link" onClick={onOpenEhr}>Open EHR chart <ArrowRight size={14} /></button>
            </div>
          </section>

          <section aria-labelledby="measurement-title">
            <div className="section-heading">
              <div>
                <h2 id="measurement-title">Measurements</h2>
                <p>Latest readings available in this workspace</p>
              </div>
              <span className={`source-pill ${review.synthetic ? "source-demo" : "source-live"}`}>
                <span />{review.synthetic ? "Synthetic example" : "Ovok sandbox data"}
              </span>
            </div>
            <MeasurementCards review={review} />
          </section>

          <section className="activity-section" aria-labelledby="activity-title">
            <div className="section-heading">
              <div>
                <h2 id="activity-title">Recent activity</h2>
                <p>Measurements and questionnaire submissions</p>
              </div>
              <span className="activity-count">{review.activity.length} events</span>
            </div>
            {review.activity.length ? (
              <ol className="activity-list">
                {review.activity.map((activity) => (
                  <li key={activity.id} className="activity-row">
                    <span className={`activity-marker ${activity.kind}`} aria-hidden="true" />
                    <div className="activity-copy">
                      <strong>{activity.title}</strong>
                      <span>{activity.description}</span>
                    </div>
                    <time dateTime={activity.recordedAt}>{formatDateTime(activity.recordedAt)}</time>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="activity-empty">No recent activity is available for this patient.</div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function latestTimestamp(review: PatientReview): string {
  const timestamps = [
    review.ecg?.recordedAt,
    review.weight?.recordedAt,
    review.questionnaire?.recordedAt,
  ].filter((value): value is string => Boolean(value));
  const latest = timestamps
    .sort((first, second) => Date.parse(first) - Date.parse(second))
    .at(-1);
  return latest ? formatDateTime(latest) : "No readings yet";
}
