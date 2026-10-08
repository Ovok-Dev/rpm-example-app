import { ArrowUpRight, Search, UserRound } from "lucide-react";
import { useState } from "react";
import type { PatientChoice } from "../types";

interface PatientsPageProps {
  mode: "demo" | "sandbox";
  patients: PatientChoice[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
}

export default function PatientsPage({
  mode,
  patients,
  selectedPatientId,
  onSelectPatient,
}: PatientsPageProps) {
  const [query, setQuery] = useState("");
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  return (
    <div className="content-stack">
      <section className="page-heading">
        <div>
          <h1>Patients</h1>
          <p className="page-subtitle">
            {mode === "demo" ? "A small, synthetic example patient list." : "Patients visible to this practitioner in the connected project."}
          </p>
        </div>
        <label className="patient-picker directory-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search patients</span>
          <input
            type="search"
            placeholder="Search patients"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </section>

      <div className="directory-summary">
        <span><strong>{filteredPatients.length}</strong> {filteredPatients.length === 1 ? "patient" : "patients"}</span>
        <span className="source-pill source-live"><span />{mode === "demo" ? "Synthetic records" : "Ovok sandbox"}</span>
      </div>

      <div className="patient-directory">
        {filteredPatients.map((patient) => (
          <button
            className={`directory-row ${patient.id === selectedPatientId ? "is-selected" : ""}`}
            key={patient.id}
            onClick={() => onSelectPatient(patient.id)}
          >
            <span className="directory-avatar"><UserRound size={18} /></span>
            <span className="directory-name">
              <strong>{patient.name}</strong>
              <span>{patient.synthetic ? "Synthetic example patient" : "Patient in connected project"}</span>
            </span>
            {patient.synthetic && <span className="synthetic-badge">SYNTHETIC</span>}
            <span className="directory-open">Open review <ArrowUpRight size={15} /></span>
          </button>
        ))}
        {!filteredPatients.length && (
          <div className="directory-empty">
            {patients.length ? "No patient names match your search." : "No patient records are available in this workspace."}
          </div>
        )}
      </div>
      <p className="privacy-note">The list follows the permissions assigned to the signed-in practitioner.</p>
    </div>
  );
}
