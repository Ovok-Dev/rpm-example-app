import { useCallback, useEffect, useMemo, useState } from "react";
import type { Patient } from "@medplum/fhirtypes";
import type { OvokClient } from "@ovok/core";
import { DEMO_PATIENTS } from "./data/demo";
import { listProjectPatients, loadPatientReview } from "./lib/patientData";
import { loadDemoRelay, withDemoRelayReadings } from "./lib/demoRelay";
import { isFhirLogicalId } from "./lib/fhirId";
import { getOvokClient, tenantCode } from "./lib/ovokClient";
import type { PageId, PatientChoice, PatientReview } from "./types";
import AppShell from "./components/AppShell";
import PatientReviewPage from "./components/PatientReviewPage";
import PatientsPage from "./components/PatientsPage";
import SignalsPage from "./components/SignalsPage";
import SignInDialog from "./components/SignInDialog";
import SupportPage from "./components/SupportPage";

type WorkspaceMode = "demo" | "sandbox";
type SignalsSettings = Awaited<ReturnType<OvokClient["getSignalsSettings"]>>;
type RawSignal = Awaited<ReturnType<OvokClient["listSignalsRawAlerts"]>>["items"][number];

const demoChoices: PatientChoice[] = DEMO_PATIENTS.map((patient) => ({
  id: patient.id,
  name: patient.name,
  synthetic: true,
}));

export default function App() {
  const [page, setPage] = useState<PageId>("home");
  const [mode, setMode] = useState<WorkspaceMode>("demo");
  const [linkedPatientId] = useState(() => new URLSearchParams(window.location.search).get("patient") ?? "");
  const linkedDemoPatient = DEMO_PATIENTS.some((patient) => patient.id === linkedPatientId);
  const [selectedPatientId, setSelectedPatientId] = useState(() =>
    linkedPatientId ? linkedDemoPatient ? linkedPatientId : "" : DEMO_PATIENTS[0]?.id ?? "",
  );
  const [sandboxPatients, setSandboxPatients] = useState<Patient[]>([]);
  const [demoRelayReadings, setDemoRelayReadings] = useState<Record<string, import("./lib/demoRelay").RelayMeasurement[]>>({});
  const [demoRelayOnline, setDemoRelayOnline] = useState(false);
  const [sandboxReview, setSandboxReview] = useState<PatientReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [signalsSettings, setSignalsSettings] = useState<SignalsSettings | null>(null);
  const [rawSignals, setRawSignals] = useState<RawSignal[]>([]);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const closeConnectDialog = useCallback(() => setConnectOpen(false), []);

  useEffect(() => {
    if (mode !== "demo" || !linkedPatientId) return;
    if (!isFhirLogicalId(linkedPatientId)) {
      setWorkspaceError("This patient link is invalid. Choose a record from the authorized patient list.");
    } else if (!linkedDemoPatient) {
      setWorkspaceError("This patient is not in the local synthetic workspace. Sign in to the sandbox to verify access.");
    }
  }, [linkedPatientId, linkedDemoPatient, mode]);

  const patientChoices = useMemo(
    () => mode === "demo" ? demoChoices : sandboxPatients.map(patientChoice),
    [mode, sandboxPatients],
  );
  const selectedSandboxPatient = sandboxPatients.find(
    (patient) => patient.id === selectedPatientId,
  );
  const demoReview = DEMO_PATIENTS.find(
    (patient) => patient.id === selectedPatientId,
  ) ?? null;
  const activeReview = mode === "demo" ? demoReview : sandboxReview;

  useEffect(() => {
    let isCurrentRequest = true;
    async function refreshRelay() {
      const readings = await loadDemoRelay();
      if (!isCurrentRequest) return;
      setDemoRelayOnline(Boolean(readings));
      if (readings) setDemoRelayReadings(readings);
    }
    void refreshRelay();
    const timer = window.setInterval(() => void refreshRelay(), 5000);
    return () => { isCurrentRequest = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (mode !== "sandbox" || !selectedSandboxPatient) {
      setSandboxReview(null);
      setReviewError(null);
      setReviewLoading(false);
      return;
    }

    let isCurrentRequest = true;
    setReviewLoading(true);
    setReviewError(null);

    getOvokClient()
      .then((client) => loadPatientReview(client, selectedSandboxPatient))
      .then((review) => {
        if (isCurrentRequest) setSandboxReview(review);
      })
      .catch((error: unknown) => {
        if (isCurrentRequest) {
          setSandboxReview(null);
          setReviewError(errorMessage(error));
        }
      })
      .finally(() => {
        if (isCurrentRequest) setReviewLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [mode, selectedSandboxPatient]);

  useEffect(() => {
    if (mode !== "sandbox" || page !== "signals") return;

    let isCurrentRequest = true;
    setSignalsLoading(true);
    setSettingsError(null);
    setAlertsError(null);

    getOvokClient().then((client) => Promise.allSettled([
      client.getSignalsSettings(),
      client.listSignalsRawAlerts({ acknowledged: false, limit: 20 }),
    ])).then(([settingsResult, alertsResult]) => {
      if (!isCurrentRequest) return;

      if (settingsResult.status === "fulfilled") {
        setSignalsSettings(settingsResult.value);
      } else {
        setSignalsSettings(null);
        setSettingsError(errorMessage(settingsResult.reason));
      }

      if (alertsResult.status === "fulfilled") {
        setRawSignals(alertsResult.value.items);
      } else {
        setRawSignals([]);
        setAlertsError(errorMessage(alertsResult.reason));
      }

      setSignalsLoading(false);
    }).catch((error: unknown) => {
      if (!isCurrentRequest) return;
      setSettingsError(errorMessage(error));
      setAlertsError(errorMessage(error));
      setSignalsLoading(false);
    });

    return () => {
      isCurrentRequest = false;
    };
  }, [mode, page]);

  async function connectToSandbox(
    login: Parameters<OvokClient["setActiveLogin"]>[0],
  ): Promise<void> {
    const client = await getOvokClient();
    await client.setActiveLogin(login);
    setMode("sandbox");
    setPage("home");
    setSignalsSettings(null);
    setRawSignals([]);
    setWorkspaceError(null);

    try {
      if (linkedPatientId && !isFhirLogicalId(linkedPatientId)) {
        setSandboxPatients([]);
        setSelectedPatientId("");
        setWorkspaceError("This patient link is invalid. Choose the record again from the authorized patient list.");
        return;
      }

      const patients = await listProjectPatients(client);
      const linkedPatient = linkedPatientId
        ? patients.find((patient) => patient.id === linkedPatientId) ??
          await client.readResource("Patient", linkedPatientId)
        : undefined;
      setSandboxPatients(linkedPatient && !patients.some((patient) => patient.id === linkedPatient.id)
        ? [linkedPatient, ...patients]
        : patients);
      setSelectedPatientId(linkedPatientId ? linkedPatient?.id ?? "" : patients[0]?.id ?? "");
    } catch (error) {
      setSandboxPatients([]);
      setSelectedPatientId("");
      setWorkspaceError(errorMessage(error));
    }
  }

  async function returnToDemo(): Promise<void> {
    const client = await getOvokClient();
    await client.logout();
    setSandboxPatients([]);
    setSandboxReview(null);
    setSelectedPatientId(DEMO_PATIENTS[0]?.id ?? "");
    setMode("demo");
    setPage("home");
    setWorkspaceError(null);
    setSignalsSettings(null);
    setRawSignals([]);
  }

  const selectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    if (page !== "home") setPage("home");
    const url = new URL(window.location.href);
    url.searchParams.set("patient", patientId);
    window.history.replaceState({}, "", url);
  };

  function openEhrChart() {
    if (!activeReview?.id) return;
    const ehrUrl = import.meta.env.VITE_EHR_URL ?? "http://localhost:5174";
    window.open(`${ehrUrl}/?patient=${encodeURIComponent(activeReview.id)}`, "_blank", "noopener,noreferrer");
  }

  const displayedReview = mode === "demo" && activeReview
    ? withDemoRelayReadings(activeReview, demoRelayReadings[activeReview.id])
    : activeReview;

  return (
    <AppShell
      page={page}
      mode={mode}
      onNavigate={setPage}
      onConnect={() => setConnectOpen(true)}
      onDisconnect={() => void returnToDemo()}
    >
      {workspaceError && (
        <div className="workspace-error" role="alert">
          <span>{mode === "sandbox" ? "Sandbox request needs attention" : "Patient link needs attention"}</span>
          <p>{workspaceError}</p>
          <button onClick={() => setConnectOpen(true)}>Review connection</button>
        </div>
      )}
      {page === "home" && (
        <PatientReviewPage
          mode={mode}
          review={displayedReview}
          patients={patientChoices}
          selectedPatientId={selectedPatientId}
          loading={reviewLoading}
          error={reviewError}
          onSelectPatient={selectPatient}
          onConnect={() => setConnectOpen(true)}
          onOpenEhr={openEhrChart}
          demoRelayOnline={demoRelayOnline}
        />
      )}
      {page === "patients" && (
        <PatientsPage
          mode={mode}
          patients={patientChoices}
          selectedPatientId={selectedPatientId}
          onSelectPatient={selectPatient}
        />
      )}
      {page === "signals" && (
        <SignalsPage
          mode={mode}
          tenantCode={tenantCode}
          settings={signalsSettings}
          alerts={rawSignals}
          patients={patientChoices}
          settingsError={settingsError}
          alertsError={alertsError}
          loading={signalsLoading}
          onConnect={() => setConnectOpen(true)}
        />
      )}
      {page === "support" && <SupportPage />}
      <SignInDialog
        open={connectOpen}
        tenantCode={tenantCode}
        onClose={closeConnectDialog}
        onAuthenticated={connectToSandbox}
      />
    </AppShell>
  );
}

function patientChoice(patient: Patient): PatientChoice {
  const name = patient.name?.[0];
  const displayName = [...(name?.given ?? []), name?.family ?? ""]
    .filter(Boolean)
    .join(" ") || "Patient without a display name";

  return {
    id: patient.id ?? "",
    name: displayName,
    synthetic: false,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "The sandbox request could not be completed. Check your project access and try again.";
}
