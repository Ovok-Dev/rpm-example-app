import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { Alert } from "react-native";
import { isDevice } from "expo-device";
import { MeasurementTypeKey } from "@ovok/core";
import {
  BTProvider,
  IntegratedDevices,
  useNearbyDevices,
  usePairedDevices,
  useBluetoothState,
  type RuntimeDevice,
} from "@ovok/native/bt-management";
import { BleManager } from "react-native-ble-plx";
import { demoStorage } from "./storage";
import { useCare } from "./care-store";
import type { DiaryEntry } from "./model";
import { ReadingInbox, type ReadingInboxState } from "./device-readings";

const acceptedDevices = [IntegratedDevices.BP2, IntegratedDevices.F4] as const;
type BluetoothState = {
  devices: readonly RuntimeDevice[];
  latest: DiaryEntry | null;
  unsaved: DiaryEntry[];
  saving: boolean;
  retrySave: (entry: DiaryEntry) => Promise<void>;
  status: string;
  pair: (device: RuntimeDevice) => Promise<void>;
};
const BluetoothContext = createContext<BluetoothState>({
  devices: [],
  latest: null,
  unsaved: [],
  saving: false,
  retrySave: async () => {},
  status: "Use a physical phone to connect devices.",
  pair: async () => {},
});

export function DeviceWorkspace({ children }: PropsWithChildren) {
  const { isDemo, loading, loadFailed } = useCare();
  if (isDemo || !isDevice || loading || loadFailed) return children;
  return <PhysicalDevices>{children}</PhysicalDevices>;
}

function PhysicalDevices({ children }: PropsWithChildren) {
  const { record } = useCare();
  const [manager] = useState(() => new BleManager());
  const [latest, setLatest] = useState<DiaryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inboxState, setInboxState] = useState<ReadingInboxState>({
    entries: [],
    busy: false,
  });
  const [inbox] = useState(() => new ReadingInbox(record, setInboxState));
  useEffect(
    () => () => {
      void manager.destroy();
    },
    [manager],
  );

  return (
    <BTProvider
      bleManager={manager}
      acceptedDevices={acceptedDevices}
      clearDeviceHistory={false}
      onError={() =>
        setError(
          "Could not connect. Check Bluetooth and bring your device closer.",
        )
      }
      onResult={({ id, deviceData, data }) => {
        const base = {
          id,
          recordedAt: (data.recordedAt ?? new Date()).toISOString(),
          source: "device" as const,
          sync: "pending" as const,
          device: deviceData,
        };
        let entry: DiaryEntry;
        if (data.measurementTypeKey === MeasurementTypeKey.bodyWeight)
          entry = { ...base, kind: "weight", weight: data.bodyWeight };
        else if (data.measurementTypeKey === MeasurementTypeKey.ecg)
          entry = {
            ...base,
            kind: "ecg",
            waveform: data.diagramPoints,
            duration: data.duration,
            heartRate: data.heartRate,
          };
        else return;
        setLatest(entry);
        void inbox
          .receive(entry)
          .catch(() =>
            Alert.alert(
              "Reading not saved",
              "Keep the app open. Your reading is held here; tap Retry save on any tab.",
            ),
          );
      }}
    >
      <DeviceState
        latest={latest}
        error={error}
        inbox={inbox}
        inboxState={inboxState}
      >
        {children}
      </DeviceState>
    </BTProvider>
  );
}

function DeviceState({
  latest,
  error,
  inbox,
  inboxState,
  children,
}: PropsWithChildren<{
  latest: DiaryEntry | null;
  error: string | null;
  inbox: ReadingInbox;
  inboxState: ReadingInboxState;
}>) {
  const { patientId, entries } = useCare();
  const { devices } = useNearbyDevices();
  const { pair: remember } = usePairedDevices({
    storage: demoStorage,
    storageKey: `ovok.devices.${patientId}`,
    autoPair: true,
  });
  const { state } = useBluetoothState();
  async function pair(device: RuntimeDevice) {
    try {
      await device.device.connect();
      await remember(device);
    } catch {
      Alert.alert(
        "Connection failed",
        "Keep the device switched on and nearby, then try again.",
      );
    }
  }
  return (
    <BluetoothContext.Provider
      value={{
        devices,
        latest,
        unsaved: inboxState.entries.filter(
          (reading) => !entries.some((entry) => entry.id === reading.id),
        ),
        saving: inboxState.busy,
        retrySave: (entry) => inbox.retry(entry),
        pair,
        status:
          error ??
          (state === "on"
            ? "Searching for your devices"
            : "Turn on Bluetooth and allow access in Settings."),
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
}

export const useDevices = () => useContext(BluetoothContext);
