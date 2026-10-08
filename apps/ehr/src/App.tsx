import { useEffect, useMemo, useState } from "react";
import type { Patient } from "@medplum/fhirtypes";
import type { OvokClient } from "@ovok/core";
import {
  Activity, ArrowDown, ArrowRight, CalendarDays, Check, ChevronDown,
  CircleHelp, ClipboardList, HeartHandshake, HeartPulse, LayoutDashboard,
  LogIn, LogOut, Plus, Search, Users, X,
} from "lucide-react";
import { PatientChart } from "./components/PatientChart";
import { PatientRegistrationDialog, type RegistrationInput } from "./components/PatientRegistrationDialog";
import { SignalsSetup } from "./components/SignalsSetup";
import { SignInDialog } from "./components/SignInDialog";
import { createInitialDemoState, DEMO_PATIENTS } from "./data/demo";
import {
  enrollmentStageFor, nextEnrollmentAction, patientDisplayName,
  validatePatientRegistration, type DemoPatient, type DemoState, type EnrollmentStage,
  type WorkspaceMode,
} from "./domain";
import { isFhirLogicalId, patientName } from "./lib/fhir";
import { apiBaseUrl, tenantCode } from "./lib/ovokClient";
import { parseDemoSnapshot } from "./lib/demoRelay";

type PageId = "overview" | "patients" | "operations" | "signals" | "support";
type LoginResponse = Awaited<ReturnType<OvokClient["login"]>>;
type AuthenticatedLogin = Extract<LoginResponse, { accessToken: string }>;
type PatientPage = { patients: Patient[]; total?: number; hasNext: boolean };

const PAGE_SIZE = 20;
const stageOrder: EnrollmentStage[] = ["intake", "care-team", "program", "devices", "active"];
const stageLabels: Record<EnrollmentStage, string> = {
  intake: "Intake",
  "care-team": "Care team",
  program: "CHF program",
  devices: "Devices",
  active: "Ready",
};

export default function App() {
  const [linkedPatientId] = useState(() => new URLSearchParams(window.location.search).get("patient") ?? "");
  const linkedDemoPatient = DEMO_PATIENTS.some((patient) => patient.id === linkedPatientId);
  const linkedPatientIdIsValid = isFhirLogicalId(linkedPatientId);
  const [page, setPage] = useState<PageId>(linkedDemoPatient ? "patients" : "operations");
  const [mode, setMode] = useState<WorkspaceMode>("demo");
  const [client, setClient] = useState<OvokClient | null>(null);
  const [demoState, setDemoState] = useState<DemoState>(createInitialDemoState);
  const [demoRelayConnected, setDemoRelayConnected] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(linkedPatientId ? linkedDemoPatient ? linkedPatientId : "" : "demo-3017");
  const [focusedStage, setFocusedStage] = useState<EnrollmentStage | null>(null);
  const [sandboxPatients, setSandboxPatients] = useState<Patient[]>([]);
  const [sandboxTotal, setSandboxTotal] = useState<number | undefined>();
  const [sandboxHasNext, setSandboxHasNext] = useState(false);
  const [sandboxPage, setSandboxPage] = useState(0);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(() =>
    linkedPatientId && !linkedDemoPatient
      ? "This patient is not in the local synthetic workspace. Connect a sandbox account to verify access."
      : null,
  );
  const [registerOpen, setRegisterOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const filteredDemoPatients = useMemo(() => demoState.patients.filter((patient) => {
    const nameMatches = patientDisplayName(patient).toLowerCase().includes(searchTerm.toLowerCase());
    const stageMatches = stageFilter === "all" || enrollmentStageFor(patient) === stageFilter;
    return nameMatches && stageMatches;
  }), [demoState.patients, searchTerm, stageFilter]);

  const selectedDemoPatient = demoState.patients.find((patient) => patient.id === selectedPatientId) ?? null;
  const selectedSandboxPatient = sandboxPatients.find((patient) => patient.id === selectedPatientId) ?? null;
  const chartOpen = page === "patients" && Boolean(selectedPatientId);

  useEffect(() => {
    if (mode !== "demo") return;
    let current = true;
    const relayUrl = import.meta.env.VITE_DEMO_API_URL ?? "http://localhost:5174/__demo";
    async function refreshRelay() {
      try {
        const response = await fetch(`${relayUrl}/snapshot`, { cache: "no-store", signal: AbortSignal.timeout(2500) });
        if (!response.ok) throw new Error("Local synthetic relay is unavailable.");
        const payload: unknown = await response.json();
        if (!current) return;
        const allowedPatientIds = new Set(DEMO_PATIENTS.map((patient) => patient.id));
        const relayMeasurements = parseDemoSnapshot(payload, allowedPatientIds);
        setDemoState((state) => ({ ...state, measurements: mergeMeasurements(state.measurements, relayMeasurements) }));
        setDemoRelayConnected(true);
      } catch {
        if (current) setDemoRelayConnected(false);
      }
    }

    void refreshRelay();
    const timer = window.setInterval(() => void refreshRelay(), 5000);
    return () => { current = false; window.clearInterval(timer); };
  }, [mode]);

  async function loadSandboxPatients(activeClient: OvokClient, pageIndex: number): Promise<PatientPage> {
    const result = await activeClient.search("Patient", {
      _count: PAGE_SIZE,
      _offset: pageIndex * PAGE_SIZE,
      _sort: "family,given",
    });
    return {
      patients: result.entry?.flatMap((entry) => entry.resource?.resourceType === "Patient" ? [entry.resource] : []) ?? [],
      total: result.total,
      hasNext: result.link?.some((link) => link.relation === "next") ?? false,
    };
  }

  async function refreshSandboxPatients(pageIndex = sandboxPage, activeClient = client) {
    if (!activeClient) return;
    setSandboxLoading(true);
    setWorkspaceError(null);
    try {
      const result = await loadSandboxPatients(activeClient, pageIndex);
      setSandboxPatients(result.patients);
      setSandboxTotal(result.total);
      setSandboxHasNext(result.hasNext);
      setSandboxPage(pageIndex);
    } catch (error) {
      setWorkspaceError(messageFor(error));
      setSandboxPatients([]);
      setSandboxTotal(undefined);
      setSandboxHasNext(false);
    } finally {
      setSandboxLoading(false);
    }
  }

  async function connectToSandbox(activeClient: OvokClient, login: AuthenticatedLogin) {
    await activeClient.setActiveLogin(login);
    setClient(activeClient);
    setMode("sandbox");
    setSelectedPatientId("");
    setFocusedStage(null);
    setPage("overview");
    setBanner(null);
    await refreshSandboxPatients(0, activeClient);
    if (linkedPatientId && !linkedDemoPatient && linkedPatientIdIsValid) {
      try {
        const linkedPatient = await activeClient.readResource("Patient", linkedPatientId);
        setSandboxPatients((patients) => patients.some((patient) => patient.id === linkedPatient.id)
          ? patients
          : [linkedPatient, ...patients]);
        setSelectedPatientId(linkedPatient.id ?? "");
        setPage("patients");
      } catch {
        setBanner("The requested patient ID is not accessible to this practitioner. Ovok AccessPolicy controls the chart.");
      }
    } else if (linkedPatientId && !linkedDemoPatient) {
      setBanner("The patient link is invalid. Open the chart from an authenticated Ovok patient list.");
    }
  }

  async function returnToDemo() {
    if (client) await client.logout();
    setClient(null);
    setSandboxPatients([]);
    setSandboxTotal(undefined);
    setSelectedPatientId("demo-3017");
    setFocusedStage(null);
    setMode("demo");
    setPage("operations");
    setWorkspaceError(null);
    setBanner(null);
    setDemoState(createInitialDemoState());
  }

  function openChart(patientId: string) {
    setSelectedPatientId(patientId);
    setPage("patients");
    const url = new URL(window.location.href);
    url.searchParams.set("patient", patientId);
    window.history.replaceState({}, "", url);
  }

  function closeChart() {
    setSelectedPatientId("");
    const url = new URL(window.location.href);
    url.searchParams.delete("patient");
    window.history.replaceState({}, "", url);
  }

  async function registerPatient(input: RegistrationInput) {
    const validationErrors = validatePatientRegistration(input);
    if (validationErrors.length) throw new Error(validationErrors.join(" "));

    if (mode === "demo") {
      const patient = createDemoPatient(input);
      setDemoState((current) => ({ ...current, patients: [patient, ...current.patients] }));
      setRegisterOpen(false);
      setSelectedPatientId(patient.id);
      setFocusedStage(enrollmentStageFor(patient));
      setBanner("Synthetic patient added to this browser session.");
      return;
    }

    if (!client) throw new Error("Sign in to the sandbox before creating a patient.");
    const duplicates = await client.searchResources<"Patient">("Patient", { email: input.email.trim(), _count: 2 });
    if (duplicates.length) {
      throw new Error("A patient with this email is already accessible. Open the existing record to avoid a duplicate.");
    }

    const newPatient = buildRegisteredPatient(input);
    const createdPatient = await client.createResource(newPatient);
    const patientId = createdPatient.id;
    await refreshSandboxPatients(sandboxPage, client);
    if (patientId) openChart(patientId);
    setRegisterOpen(false);

    try {
      await client.invitePatient({ email: input.email.trim(), firstName: input.firstName.trim(), lastName: input.lastName.trim() });
      setBanner("The Patient record was created. Ovok accepted the invitation request for sending; delivery and account acceptance are not confirmed.");
    } catch (error) {
      setBanner(`Patient/${patientId ?? "record"} was created, but the invitation request failed: ${messageFor(error)}`);
    }
  }

  function advanceDemoEnrollment(patient: DemoPatient) {
    const currentStage = enrollmentStageFor(patient);
    const nextStageIndex = Math.min(stageOrder.indexOf(currentStage) + 1, stageOrder.length - 1);
    setBanner(null);
    setDemoState((current) => {
      const patients = current.patients.map((item) => {
        if (item.id !== patient.id) return item;
        if (currentStage === "intake") return { ...item, intakeComplete: true, enrollmentStage: "care-team" as const };
        if (currentStage === "care-team") return {
          ...item,
          careTeam: { clinicianId: "practitioner-sarah-mitchell", nurseId: "practitioner-daniel-kim", assignedAt: new Date().toISOString() },
          enrollmentStage: "program" as const,
        };
        if (currentStage === "program") return { ...item, enrollmentStage: "devices" as const };
        if (currentStage === "devices") {
          const kit = current.devices.find((device) => device.status === "available");
          if (!kit) return item;
          return { ...item, deviceIds: [kit.id], enrollmentStart: new Date().toISOString(), enrollmentStage: "active" as const };
        }
        return item;
      });
      const assignedPatient = patients.find((item) => item.id === patient.id);
      const assignedDeviceId = assignedPatient?.deviceIds[0];
      const devices = current.devices.map((device) => device.id === assignedDeviceId
        ? { ...device, status: "assigned" as const, patientId: patient.id }
        : device);
      return { ...current, patients, devices };
    });
    if (currentStage !== "active") setFocusedStage(stageOrder[nextStageIndex]);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); setPage("operations"); closeChart(); }} aria-label="Ovok Care home">
          <span className="brand-mark"><HeartPulse size={19} strokeWidth={2.2} /></span><span>ovok<span className="brand-care">care</span></span>
        </a>
        <div className="clinic-block"><div className="clinic-card"><span className="clinic-mark"><HeartPulse size={17} /></span><span><strong>CHF clinic</strong><small>Single clinic view</small></span><span className="clinic-dot" /></div></div>
        <p className="nav-label">Workspace</p>
        <nav className="side-nav" aria-label="Clinic navigation">
          <NavButton active={page === "overview"} icon={<LayoutDashboard size={17} />} label="Overview" onClick={() => { setPage("overview"); closeChart(); }} />
          <NavButton active={page === "patients"} icon={<Users size={17} />} label="Patients" onClick={() => { setPage("patients"); closeChart(); }} />
          <NavButton active={page === "operations"} icon={<HeartHandshake size={17} />} label="Clinic operations" onClick={() => { setPage("operations"); closeChart(); }} />
          <NavButton active={page === "signals"} icon={<Activity size={17} />} label="Signals setup" onClick={() => { setPage("signals"); closeChart(); }} />
          <NavButton active={page === "support"} icon={<CircleHelp size={17} />} label="Support" onClick={() => { setPage("support"); closeChart(); }} />
        </nav>
        <div className="sidebar-bottom"><span className="sidebar-dot" /><span><strong>{mode === "demo" ? "Example workspace" : "Ovok sandbox"}</strong><small>for Ovok SDK</small></span><a href="https://docs.ovok.com" target="_blank" rel="noreferrer" aria-label="Open Ovok documentation"><ArrowRight size={14} /></a></div>
      </aside>

      <div className="workspace">
        <header className="topbar"><div className="breadcrumbs"><span>CHF clinic</span><span>/</span><strong>{chartOpen ? "Patient chart" : pageLabel(page)}</strong></div><div className="topbar-actions"><span className={`workspace-badge ${mode === "demo" ? "badge-demo" : "badge-sandbox"}`}><span />{mode === "demo" ? "Synthetic demo" : "Sandbox"}</span>{mode === "demo" ? <button className="button button-primary topbar-connect" onClick={() => setConnectOpen(true)}><LogIn size={15} /> Connect sandbox</button> : <button className="button button-secondary topbar-connect" onClick={() => void returnToDemo()}><LogOut size={15} /> Sign out</button>}</div></header>
        <main className="main-content">
          {banner && <div className="workspace-banner" role="status"><Check size={16} />{banner}<button aria-label="Dismiss notice" onClick={() => setBanner(null)}><X size={15} /></button></div>}
          {workspaceError && <div className="workspace-error" role="alert"><strong>Sandbox request failed</strong><p>{workspaceError}</p><span>No demo data was substituted. Check access and retry.</span><button className="button button-secondary" onClick={() => void refreshSandboxPatients()}>Retry page</button></div>}
          {page === "operations" && mode === "demo" && <OperationsPage
            patients={filteredDemoPatients}
            allPatients={demoState.patients}
            relayConnected={demoRelayConnected}
            selectedPatient={selectedDemoPatient}
            focusedStage={focusedStage}
            devices={demoState.devices}
            query={searchTerm}
            stageFilter={stageFilter}
            onSearch={setSearchTerm}
            onStageFilter={setStageFilter}
            onSelect={(patient) => { setSelectedPatientId(patient.id); setFocusedStage(enrollmentStageFor(patient)); }}
            onFocusStage={(patient, stage) => { setSelectedPatientId(patient.id); setFocusedStage(stage); }}
            onAdvance={advanceDemoEnrollment}
            onOpenChart={openChart}
            onRegister={() => setRegisterOpen(true)}
          />}
          {page === "operations" && mode === "sandbox" && <SandboxOperations
            patients={sandboxPatients}
            total={sandboxTotal}
            loading={sandboxLoading}
            page={sandboxPage}
            hasNext={sandboxHasNext}
            onRegister={() => setRegisterOpen(true)}
            onOpenChart={openChart}
            onPageChange={(nextPage) => void refreshSandboxPatients(nextPage)}
          />}
          {page === "overview" && <OverviewPage mode={mode} patients={sandboxPatients} demoState={demoState} onOpenOperations={() => setPage("operations")} onRegister={() => setRegisterOpen(true)} />}
          {page === "patients" && !chartOpen && <PatientsPage mode={mode} demoPatients={demoState.patients} sandboxPatients={sandboxPatients} loading={sandboxLoading} page={sandboxPage} hasNext={sandboxHasNext} onOpenChart={openChart} onPageChange={(nextPage) => void refreshSandboxPatients(nextPage)} />}
          {chartOpen && <PatientChart
            client={client}
            mode={mode}
            patient={selectedSandboxPatient}
            demoPatient={selectedDemoPatient}
            demoPatientId={selectedDemoPatient?.id}
            onBack={() => { setPage("operations"); closeChart(); }}
          />}
          {page === "signals" && <SignalsSetup client={client} demo={mode === "demo"} />}
          {page === "support" && <SupportPage />}
        </main>
        <footer className="app-footer"><span>Ovok EHR example · synthetic demo or authorized sandbox data</span><span>Not for clinical use</span></footer>
      </div>

      {registerOpen && <PatientRegistrationDialog demo={mode === "demo"} onClose={() => setRegisterOpen(false)} onRegister={registerPatient} />}
      {connectOpen && <SignInDialog onClose={() => setConnectOpen(false)} onAuthenticated={connectToSandbox} tenantCode={tenantCode} />}
    </div>
  );
}

function OperationsPage(props: {
  patients: DemoPatient[]; allPatients: DemoPatient[]; selectedPatient: DemoPatient | null; relayConnected: boolean;
  focusedStage: EnrollmentStage | null; devices: DemoState["devices"]; query: string; stageFilter: string;
  onSearch: (value: string) => void; onStageFilter: (value: string) => void;
  onSelect: (patient: DemoPatient) => void; onFocusStage: (patient: DemoPatient, stage: EnrollmentStage) => void; onAdvance: (patient: DemoPatient) => void;
  onOpenChart: (id: string) => void; onRegister: () => void;
}) {
  const { patients, allPatients, selectedPatient, focusedStage, devices, relayConnected, query, stageFilter, onSearch, onStageFilter, onSelect, onFocusStage, onAdvance, onOpenChart, onRegister } = props;
  const counts = [
    { stage: "intake" as const, label: "In intake", count: allPatients.filter((patient) => enrollmentStageFor(patient) === "intake").length },
    { stage: "care-team" as const, label: "With care team", count: allPatients.filter((patient) => enrollmentStageFor(patient) === "care-team").length },
    { stage: "program" as const, label: "In CHF enrollment", count: allPatients.filter((patient) => ["program", "devices"].includes(enrollmentStageFor(patient))).length },
    { stage: "active" as const, label: "Monitoring active", count: allPatients.filter((patient) => enrollmentStageFor(patient) === "active").length },
  ];
  const selectedStage = selectedPatient ? enrollmentStageFor(selectedPatient) : null;
  const availableKits = devices.filter((device) => device.status === "available");

  return <>
    <PageHeading title="Clinic operations" subtitle="Move each patient through intake, care-team assignment, CHF enrollment, and device setup." action={<button className="button button-primary" onClick={onRegister}><Plus size={16} /> Register patient</button>} />
    <MetricStrip items={counts.map(({ stage, label, count }) => ({ label, value: String(count), tone: stage }))} />
    <section className="workbench-layout">
      <div className="panel workbench-panel">
        <div className="section-heading workbench-header"><div><div className="title-with-badge"><h2>RPM enrollment</h2><span className="synthetic-tag">Synthetic demo data</span></div><p>Track progress from registration to monitoring activation.</p></div><div className="table-tools"><label className="search-field"><Search size={15} /><input value={query} onChange={(event) => onSearch(event.target.value)} placeholder="Search patients" aria-label="Search patients" /></label><label className="select-field"><select value={stageFilter} onChange={(event) => onStageFilter(event.target.value)} aria-label="Filter by enrollment stage"><option value="all">All stages</option>{stageOrder.map((stage) => <option value={stage} key={stage}>{stageLabels[stage]}</option>)}</select><ChevronDown size={14} /></label></div></div>
        <div className="stage-header"><span>Patient / owner</span>{stageOrder.map((stage, index) => <div className="stage-header-cell" key={stage}><span className={`stage-number tone-${stage}`}>{index + 1}</span><span><strong>{stageLabels[stage]}</strong><small>{stageDescription(stage)}</small></span>{index < stageOrder.length - 1 && <ArrowRight size={14} />}</div>)}</div>
        <div className="enrollment-list">{patients.length ? patients.map((patient) => <EnrollmentRow key={patient.id} patient={patient} selected={selectedPatient?.id === patient.id} focusedStage={focusedStage} onSelect={() => onSelect(patient)} onFocusStage={(stage) => onFocusStage(patient, stage)} onOpenChart={() => onOpenChart(patient.id)} />) : <p className="empty-state">No synthetic patients match these filters.</p>}</div>
        <div className="demo-footnote"><span className="demo-dot" /> All records are synthetic. {relayConnected ? "Mobile demo readings share this in-memory local relay while it runs." : "Mobile-to-clinician relay is offline; fixture readings remain visible."} Workflow changes last only in this browser session.</div>
      </div>
      <EnrollmentDetails patient={selectedPatient} currentStage={selectedStage} focusedStage={selectedPatient ? focusedStage ?? selectedStage : null} availableKits={availableKits.length} onAdvance={onAdvance} onFocusStage={(stage) => { if (selectedPatient) onFocusStage(selectedPatient, stage); }} onOpenChart={onOpenChart} />
    </section>
  </>;
}

function EnrollmentRow({ patient, selected, focusedStage, onSelect, onFocusStage, onOpenChart }: { patient: DemoPatient; selected: boolean; focusedStage: EnrollmentStage | null; onSelect: () => void; onFocusStage: (stage: EnrollmentStage) => void; onOpenChart: () => void }) {
  const currentStage = enrollmentStageFor(patient);
  const stageIndex = stageOrder.indexOf(currentStage);
  const selectedStage = selected ? focusedStage ?? currentStage : null;
  const owner = ownerFor(patient);

  return <article className={`enrollment-row ${selected ? "is-selected" : ""}`}>
    <button className="patient-summary" onClick={onSelect} aria-pressed={selected}>
      <span className={`patient-avatar tone-avatar-${currentStage}`}>{initials(patientDisplayName(patient))}</span>
      <span className="patient-summary-text"><strong>{patientDisplayName(patient)}</strong><small>{patient.birthDate} · {patient.mrn}</small><span className={`stage-tag tag-${currentStage}`}>{stageLabels[currentStage]}</span></span>
      <span className="patient-meta"><small>Owner</small><strong>{owner}</strong><small>Next action</small><strong>{nextEnrollmentAction(currentStage)}</strong></span>
    </button>
    <div className="patient-journey" aria-label={`${patientDisplayName(patient)} enrollment progress`}>
      {stageOrder.map((stage, index) => {
        const complete = index < stageIndex || currentStage === "active";
        const current = stage === currentStage;
        return <button key={stage} className={`journey-step ${current ? "current" : ""} ${complete ? "complete" : ""} ${selectedStage === stage ? "is-focused" : ""}`} onClick={() => onFocusStage(stage)} aria-pressed={selectedStage === stage} aria-current={current ? "step" : undefined} aria-label={`${stageLabels[stage]}${complete ? " complete" : current ? " current step" : " upcoming"}`}>
          <span className="journey-marker">{complete ? <Check size={12} /> : index + 1}</span><strong>{stageLabels[stage]}</strong><small>{complete ? "Complete" : current ? nextEnrollmentAction(stage) : "Upcoming"}</small>
        </button>;
      })}
      <button className="journey-open-chart" onClick={onOpenChart} aria-label={`Open ${patientDisplayName(patient)} patient chart`}><ArrowRight size={15} /></button>
    </div>
  </article>;
}

function EnrollmentDetails({ patient, currentStage, focusedStage, availableKits, onAdvance, onFocusStage, onOpenChart }: { patient: DemoPatient | null; currentStage: EnrollmentStage | null; focusedStage: EnrollmentStage | null; availableKits: number; onAdvance: (patient: DemoPatient) => void; onFocusStage: (stage: EnrollmentStage) => void; onOpenChart: (id: string) => void }) {
  if (!patient || !currentStage || !focusedStage) return <aside className="panel details-rail"><h2>Enrollment details</h2><p className="empty-state">Select a patient to see the next step.</p></aside>;
  const isFocusedStepCurrent = focusedStage === currentStage;
  const buttonLabel: Record<EnrollmentStage, string> = {
    intake: "Complete synthetic intake",
    "care-team": "Assign demo care team",
    program: "Enroll in CHF program",
    devices: availableKits ? "Assign kit and activate" : "No available demo kits",
    active: "Open patient chart",
  };
  const onClick = !isFocusedStepCurrent
    ? () => onFocusStage(currentStage)
    : currentStage === "active" ? () => onOpenChart(patient.id) : () => onAdvance(patient);
  const actionLabel = isFocusedStepCurrent ? buttonLabel[currentStage] : `Return to ${stageLabels[currentStage]}`;
  const focusStatus = stagePosition(focusedStage) < stagePosition(currentStage) ? "Complete in this demo" : focusedStage === currentStage ? "Current step" : "Upcoming step";

  return <aside className="panel details-rail">
    <div className="details-header"><div><h2>{stageLabels[focusedStage]} details</h2><p>{focusStatus} · {patientDisplayName(patient)}</p></div><span className={`stage-tag tag-${focusedStage}`}>{stageLabels[focusedStage]}</span></div>
    <div className="detail-evidence"><h3>Current evidence</h3><p>{evidenceForStage(patient, focusedStage, availableKits)}</p><div className="detail-summary"><span>Owner</span><strong>{ownerFor(patient)}</strong><span>Next action</span><strong>{nextEnrollmentAction(currentStage)}</strong></div></div>
    {!isFocusedStepCurrent && <p className="notice">This stage is not the current action. Return to {stageLabels[currentStage]} to continue.</p>}
    {isFocusedStepCurrent && focusedStage === "devices" && availableKits === 0 && <p className="notice notice-error">No synthetic kits remain. The demo inventory is exhausted.</p>}
    <button className="button button-primary detail-action" onClick={onClick} disabled={isFocusedStepCurrent && focusedStage === "devices" && availableKits === 0}>{actionLabel}<ArrowRight size={15} /></button>
    <p className="fine-print">Demo actions update local synthetic state only; they do not create FHIR records.</p>
  </aside>;
}

function SandboxOperations(props: { patients: Patient[]; total?: number; loading: boolean; page: number; hasNext: boolean; onRegister: () => void; onOpenChart: (id: string) => void; onPageChange: (page: number) => void }) {
  const { patients, total, loading, page, hasNext, onRegister, onOpenChart, onPageChange } = props;
  return <>
    <PageHeading title="Clinic operations" subtitle="Patient records returned to this practitioner by the Ovok sandbox. Totals can reflect AccessPolicy scope." action={<button className="button button-primary" onClick={onRegister}><Plus size={16} /> Register patient</button>} />
    <MetricStrip items={[{ label: "Current page", value: String(patients.length), tone: "care-team" }, { label: "Page", value: String(page + 1), tone: "program" }, { label: "Access scope", value: "Ovok policy", tone: "devices" }, { label: "Data source", value: "FHIR R4", tone: "active" }]} />
    <section className="panel sandbox-patients"><div className="section-heading"><div><h2>Accessible patient records</h2><p>{total === undefined ? "The API did not provide a total count." : `${total} accessible records reported for this search.`}</p></div><span className="status-pill">No synthetic fallback</span></div>
      {loading ? <p className="notice">Loading Patient resources…</p> : patients.length ? <div className="sandbox-table"><div className="sandbox-table-head"><span>Patient</span><span>Date of birth</span><span>FHIR identity</span><span /></div>{patients.map((patient) => <button className="sandbox-table-row" key={patient.id} onClick={() => patient.id && onOpenChart(patient.id)} disabled={!patient.id}><span><span className="patient-avatar small">{initials(patientName(patient))}</span><strong>{patientName(patient)}</strong></span><span>{patient.birthDate ?? "Not recorded"}</span><span>{patient.id ? `Patient/${patient.id}` : "Missing id"}</span><span className="row-arrow"><ArrowRight size={16} /></span></button>)}</div> : <p className="empty-state">No Patient resources were returned for this page.</p>}
      <div className="pagination"><span>{patients.length} on this page</span><div><button className="button button-secondary" onClick={() => onPageChange(page - 1)} disabled={page === 0 || loading}><ArrowDown className="flip-up" size={14} /> Previous</button><button className="button button-secondary" onClick={() => onPageChange(page + 1)} disabled={!hasNext || loading}>Next page <ArrowRight size={14} /></button></div></div>
    </section>
  </>;
}

function PatientsPage(props: { mode: WorkspaceMode; demoPatients: DemoPatient[]; sandboxPatients: Patient[]; loading: boolean; page: number; hasNext: boolean; onOpenChart: (id: string) => void; onPageChange: (page: number) => void }) {
  const { mode, demoPatients, sandboxPatients, loading, page, hasNext, onOpenChart, onPageChange } = props;
  return <section className="content-page"><PageHeading title="Patients" subtitle="Open a patient chart to review the records available in this workspace." />
    <article className="panel sandbox-patients"><div className="section-heading"><div><h2>{mode === "demo" ? "Synthetic patient directory" : "Accessible patient records"}</h2><p>{mode === "demo" ? "Example profiles align with the connected RPM demo fixtures." : "Patient results are limited by the signed-in practitioner's AccessPolicy."}</p></div><span className={mode === "demo" ? "synthetic-tag" : "status-pill"}>{mode === "demo" ? "Synthetic" : "Ovok FHIR"}</span></div>
      {mode === "demo" ? <div className="sandbox-table"><div className="sandbox-table-head"><span>Patient</span><span>Date of birth</span><span>Enrollment</span><span /></div>{demoPatients.map((patient) => <button className="sandbox-table-row" key={patient.id} onClick={() => onOpenChart(patient.id)}><span><span className="patient-avatar small">{initials(patientDisplayName(patient))}</span><strong>{patientDisplayName(patient)}</strong></span><span>{patient.birthDate}</span><span>{stageLabels[enrollmentStageFor(patient)]}</span><span className="row-arrow"><ArrowRight size={16} /></span></button>)}</div> : loading ? <p className="notice">Loading patient records…</p> : <div className="sandbox-table"><div className="sandbox-table-head"><span>Patient</span><span>Date of birth</span><span>FHIR identity</span><span /></div>{sandboxPatients.map((patient) => <button className="sandbox-table-row" key={patient.id} onClick={() => patient.id && onOpenChart(patient.id)} disabled={!patient.id}><span><span className="patient-avatar small">{initials(patientName(patient))}</span><strong>{patientName(patient)}</strong></span><span>{patient.birthDate ?? "Not recorded"}</span><span>{patient.id ? `Patient/${patient.id}` : "Missing id"}</span><span className="row-arrow"><ArrowRight size={16} /></span></button>)}</div>}
      {mode === "sandbox" && <div className="pagination"><span>Page {page + 1}</span><div><button className="button button-secondary" onClick={() => onPageChange(page - 1)} disabled={page === 0 || loading}>Previous</button><button className="button button-secondary" onClick={() => onPageChange(page + 1)} disabled={!hasNext || loading}>Next page <ArrowRight size={14} /></button></div></div>}
    </article>
  </section>;
}

function OverviewPage(props: { mode: WorkspaceMode; patients: Patient[]; demoState: DemoState; onOpenOperations: () => void; onRegister: () => void }) {
  const { mode, patients, demoState, onOpenOperations, onRegister } = props;
  const taskCount = mode === "demo" ? demoState.tasks.filter((task) => task.status !== "completed").length : "—";
  const appointments = mode === "demo" ? demoState.appointments.length : "—";
  return <section className="content-page"><PageHeading title="Clinic overview" subtitle="A focused view of patient intake and remote monitoring operations." action={<button className="button button-primary" onClick={onRegister}><Plus size={16} /> Register patient</button>} />
    <div className="overview-stat-grid"><StatCard label={mode === "demo" ? "Synthetic patients" : "Patients on page"} value={String(mode === "demo" ? demoState.patients.length : patients.length)} icon={<Users size={18} />} /><StatCard label="Awaiting action" value={mode === "demo" ? String(taskCount) : "Not queried"} icon={<ClipboardList size={18} />} /><StatCard label="Upcoming appointments" value={String(appointments)} icon={<CalendarDays size={18} />} /><StatCard label={mode === "demo" ? "Demo conversation messages" : "Care-team messages"} value={mode === "demo" ? String(demoState.messages.length) : "Not queried"} icon={<HeartHandshake size={18} />} /></div>
    {mode === "sandbox" && <p className="notice">Operational task, appointment and messaging counts are not inferred from this patient page. Connect documented resources in the project as needed.</p>}
    <article className="panel overview-callout"><div><h2>Patient intake to active monitoring</h2><p>{mode === "demo" ? "Continue a synthetic patient through each demo enrollment stage." : "Review accessible Patient records and create supported FHIR resources from each chart."}</p></div><button className="button button-primary" onClick={onOpenOperations}>Open clinic operations <ArrowRight size={15} /></button></article>
    {mode === "demo" && <article className="panel"><div className="section-heading"><div><h2>Upcoming appointments</h2></div><span className="synthetic-tag">Synthetic</span></div><div className="record-list">{demoState.appointments.map((appointment) => <div className="record-row" key={appointment.id}><span className="record-icon"><CalendarDays size={16} /></span><div><strong>{appointment.patientName}</strong><p>{appointment.type} · {new Date(appointment.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p></div><span className="status-pill">Booked</span></div>)}</div></article>}
  </section>;
}

function SupportPage() {
  return <section className="content-page"><PageHeading title="Support and setup" subtitle="Set up the Ovok project before connecting this example to sandbox data." />
    <div className="support-grid"><article className="panel support-step"><span className="support-step-number">01</span><h2>Create an Ovok account</h2><p>Create or sign in to your Ovok account, then create a sandbox project from the Ovok Console.</p><a className="inline-link" href="https://ovok.com" target="_blank" rel="noreferrer">Open Ovok.com <ArrowRight size={14} /></a></article><article className="panel support-step"><span className="support-step-number">02</span><h2>Configure access</h2><p>Create a practitioner with a least-privilege AccessPolicy. Configure patient invitation prerequisites and app URL before inviting patients.</p><a className="inline-link" href="https://docs.ovok.com/access-policies" target="_blank" rel="noreferrer">Read AccessPolicy docs <ArrowRight size={14} /></a></article><article className="panel support-step"><span className="support-step-number">03</span><h2>Connect the sandbox</h2><p>Use your sandbox practitioner account. This client targets {apiBaseUrl} with tenant {tenantCode}.</p><a className="inline-link" href="https://docs.ovok.com/web-sdk" target="_blank" rel="noreferrer">Read Web SDK docs <ArrowRight size={14} /></a></article><article className="panel support-step"><span className="support-step-number">04</span><h2>Check devices and IFUs</h2><p>Verify supported device declarations and the exact model's current instructions for use before hardware testing.</p><a className="inline-link" href="https://docs.ovok.com/native-sdk/guide/supported-devices" target="_blank" rel="noreferrer">Review supported devices and IFUs <ArrowRight size={14} /></a></article></div>
    <article className="panel info-panel"><h2>Example boundaries</h2><p>Demo data is fictional and local to the browser session. Sandbox errors stay visible. This example does not certify medical software, provide clinical advice, or create a second clinical backend. Physical kit logistics and human-to-human real-time chat require verified platform support and are not represented as working here.</p></article>
  </section>;
}

function MetricStrip({ items }: { items: Array<{ label: string; value: string; tone: EnrollmentStage }> }) {
  return <section className="metric-strip" aria-label="Patient enrollment counts">{items.map((item) => <div className="metric-item" key={item.label}><span className={`metric-dot tone-${item.tone}`} /><strong>{item.value}</strong><span>{item.label}</span></div>)}</section>;
}

function PageHeading({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button className={`nav-button ${active ? "active" : ""}`} aria-label={label} aria-current={active ? "page" : undefined} onClick={onClick}>{icon}<span>{label}</span>{active && <span className="nav-active-dot" />}</button>;
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <article className="panel stat-card"><span className="stat-icon">{icon}</span><span>{label}</span><strong>{value}</strong></article>;
}

function createDemoPatient(input: RegistrationInput): DemoPatient {
  const id = `demo-${crypto.randomUUID().slice(0, 8)}`;
  return {
    id,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    birthDate: input.birthDate,
    sex: "unknown",
    mrn: `OV-${crypto.randomUUID().slice(0, 4).toUpperCase()}`,
    intake: {
      phone: input.phone.trim(),
      email: input.email.trim(),
      address: input.address.trim(),
      emergencyContact: { name: input.emergencyContactName.trim(), relationship: "Contact", phone: input.emergencyContactPhone.trim() },
      conditions: [],
      allergies: [],
      medications: [],
      consented: input.consented,
    },
    intakeComplete: true,
    careTeam: { clinicianId: null, nurseId: null, assignedAt: null },
    enrollmentStage: "care-team",
    enrollmentStart: null,
    monitoringDays: 30,
    deviceIds: [],
    latestActivityAt: new Date().toISOString(),
  };
}

function buildRegisteredPatient(input: RegistrationInput): Patient {
  return {
    resourceType: "Patient",
    active: true,
    name: [{ use: "official", family: input.lastName.trim(), given: [input.firstName.trim()] }],
    birthDate: input.birthDate,
    gender: "unknown",
    telecom: [
      { system: "email", value: input.email.trim(), use: "home" },
      { system: "phone", value: input.phone.trim(), use: "mobile" },
    ],
    contact: input.emergencyContactName.trim() ? [{
    relationship: [{ text: "Emergency contact" }],
    name: { text: input.emergencyContactName.trim() },
    telecom: input.emergencyContactPhone.trim() ? [{ system: "phone", value: input.emergencyContactPhone.trim() }] : undefined,
    }] : undefined,
    address: input.address.trim() ? [{ text: input.address.trim(), use: "home" }] : undefined,
  };
}

function ownerFor(patient: DemoPatient): string {
  return patient.careTeam.clinicianId ? "Sarah Mitchell" : patient.careTeam.nurseId ? "Daniel Kim" : "Care coordinator";
}

function stagePosition(stage: EnrollmentStage): number {
  return stageOrder.indexOf(stage);
}

function evidenceForStage(patient: DemoPatient, stage: EnrollmentStage, availableKits: number): string {
  const evidence: Record<EnrollmentStage, string> = {
    intake: patient.intakeComplete ? "Intake is marked complete in this synthetic session." : "Patient is registered; synthetic intake is still to be completed.",
    "care-team": patient.careTeam.clinicianId ? "A synthetic attending is assigned to this patient." : "No synthetic attending is assigned yet.",
    program: `${patient.monitoringDays}-day CHF RPM example plan; ${patient.enrollmentStart ? "monitoring has started" : "monitoring has not started"}.`,
    devices: patient.deviceIds.length ? "A synthetic BP2 and F4 / LeScale-family kit is assigned; the exact scale model is unconfirmed." : `${availableKits} synthetic kits are available; no kit is assigned to this patient.`,
    active: patient.enrollmentStart ? `Synthetic monitoring began ${new Date(patient.enrollmentStart).toLocaleDateString()}.` : "Monitoring is not active in this synthetic session.",
  };
  return evidence[stage];
}

function stageDescription(stage: EnrollmentStage): string {
  const descriptions: Record<EnrollmentStage, string> = {
    intake: "Review intake",
    "care-team": "Assign clinicians",
    program: "Enroll in RPM",
    devices: "Link devices",
    active: "Monitoring active",
  };
  return descriptions[stage];
}

function initials(name: string): string {
  return name.split(" ").map((part) => part.charAt(0)).slice(0, 2).join("").toUpperCase();
}

function pageLabel(page: PageId): string {
  const labels: Record<PageId, string> = {
    overview: "Overview",
    patients: "Patients",
    operations: "Clinic operations",
    signals: "Signals setup",
    support: "Support",
  };
  return labels[page];
}

function messageFor(error: unknown): string {
  return error instanceof Error ? error.message : "The sandbox request could not be completed.";
}

function mergeMeasurements(existing: DemoState["measurements"], incoming: DemoState["measurements"]): DemoState["measurements"] {
  const measurements = new Map(existing.map((measurement) => [measurement.id, measurement]));
  for (const measurement of incoming) measurements.set(measurement.id, measurement);
  return [...measurements.values()].sort((first, second) => Date.parse(second.recordedAt) - Date.parse(first.recordedAt));
}
