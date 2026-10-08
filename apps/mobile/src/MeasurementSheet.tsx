import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { randomUUID } from "expo-crypto";
import { useCare } from "./care-store";
import { useDevices } from "./bluetooth";
import { useTheme } from "./theme";
import { Copy, Button, Icon, Waveform, openLink, SectionTitle } from "./ui";
import {
  demoEntry,
  demoWaveform,
  entrySummary,
  QUESTIONS,
  TASKS,
  validateAnswers,
  type Answers,
  type DiaryEntry,
  type MeasurementKind,
} from "./model";
import { DEVICE_GUIDES } from "./Support";

const waveform = demoWaveform();

export function MeasurementSheet({
  kind,
  onClose,
}: {
  kind: MeasurementKind;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const care = useCare();
  const devices = useDevices();
  const [stage, setStage] = useState<"ready" | "recording" | "result">("ready");
  const [result, setResult] = useState<DiaryEntry | null>(null);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const startedAt = useRef(0);
  const scroll = useRef<ScrollView>(null);
  const question = QUESTIONS[questionIndex]!;
  const task = TASKS.find((task) => task.kind === kind)!;
  const recordedResult = result
    ? care.entries.find((entry) => entry.id === result.id)
    : undefined;
  const recorded = saved || !!recordedResult;
  const deviceResult = result?.source === "device";

  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [stage, questionIndex]);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (stage !== "recording" || !care.isDemo) return;
    const duration = kind === "ecg" ? 30 : 4;
    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        duration - Math.floor((Date.now() - startedAt.current) / 1000),
      );
      setSeconds(remaining);
      if (remaining === 0) {
        setResult(demoEntry(kind));
        setStage("result");
      }
    }, 250);
    return () => clearInterval(timer);
  }, [stage, kind, care.isDemo]);

  useEffect(() => {
    if (
      !care.isDemo &&
      stage === "recording" &&
      devices.latest?.kind === kind &&
      Date.parse(devices.latest.recordedAt) >= startedAt.current - 1000
    ) {
      setResult(devices.latest);
      setStage("result");
    }
  }, [devices.latest, stage, kind, care.isDemo]);

  function close() {
    if (stage === "recording" || (result && !recorded)) {
      Alert.alert(
        "Leave this check-in?",
        "You can stay here to finish and save your check-in.",
        [
          { text: "Stay", style: "cancel" },
          { text: "Leave", onPress: onClose },
        ],
      );
    } else onClose();
  }

  async function save(entry: DiaryEntry) {
    setBusy(true);
    try {
      if (entry.source === "device") await devices.retrySave(entry);
      else await care.record(entry);
      if (entry.source !== "device") setSaved(true);
      setResult(entry);
      setStage("result");
    } catch (error) {
      Alert.alert(
        "Could not save",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  function start() {
    startedAt.current = Date.now();
    setSeconds(kind === "ecg" ? 30 : 4);
    setStage("recording");
  }

  async function submitQuestionnaire() {
    if (!validateAnswers(answers)) return;
    await save({
      id: randomUUID(),
      kind: "questionnaire",
      source: care.isDemo ? "demo" : "questionnaire",
      sync: care.isDemo ? "local" : "pending",
      recordedAt: new Date().toISOString(),
      answers,
    });
  }

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={close}
    >
      <ScrollView
        ref={scroll}
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          padding: 24,
          paddingTop: 28,
          paddingBottom: 50,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <Copy secondary style={{ fontSize: 15 }}>
            {care.isDemo ? "Demo check-in" : "Your check-in"}
          </Copy>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close check-in"
            onPress={close}
            style={{
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="xmark.circle.fill" color={colors.muted} size={27} />
          </Pressable>
        </View>
        <Icon name={recorded ? "checkmark.circle" : task.symbol} size={42} />
        <Copy
          accessibilityRole="header"
          style={{
            fontSize: 32,
            lineHeight: 39,
            fontWeight: "700",
            letterSpacing: -0.7,
            marginTop: 22,
          }}
        >
          {recorded ? "Check-in recorded." : task.title}
        </Copy>
        {kind === "questionnaire" && stage !== "result" ? (
          <>
            <Copy secondary style={{ marginTop: 12 }}>
              Take a moment to notice how you feel. This is an example
              questionnaire.
            </Copy>
            <Copy secondary style={{ marginTop: 28, fontSize: 15 }}>
              Question {questionIndex + 1} of 3
            </Copy>
            <SectionTitle>{question.title}</SectionTitle>
            <View style={{ gap: 10, marginBottom: 28 }}>
              {question.options.map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: answers[question.key] === option,
                  }}
                  onPress={() =>
                    setAnswers((current) => ({
                      ...current,
                      [question.key]: option,
                    }))
                  }
                  style={{
                    minHeight: 60,
                    borderRadius: 12,
                    padding: 16,
                    backgroundColor:
                      answers[question.key] === option
                        ? colors.wash
                        : colors.surface,
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <Icon
                    name={
                      answers[question.key] === option
                        ? "largecircle.fill.circle"
                        : "circle"
                    }
                    size={21}
                  />
                  <Copy style={{ flex: 1 }}>{option}</Copy>
                </Pressable>
              ))}
            </View>
            {questionIndex < 2 ? (
              <Button
                title="Continue"
                disabled={!answers[question.key]}
                onPress={() => setQuestionIndex((value) => value + 1)}
              />
            ) : (
              <Button
                title="Save questionnaire"
                disabled={!validateAnswers(answers)}
                busy={busy}
                onPress={() => void submitQuestionnaire()}
              />
            )}
            {questionIndex > 0 && (
              <View style={{ marginTop: 12 }}>
                <Button
                  title="Previous question"
                  secondary
                  onPress={() => setQuestionIndex((value) => value - 1)}
                />
              </View>
            )}
            <Copy
              secondary
              style={{ fontSize: 13, lineHeight: 19, marginTop: 22 }}
            >
              If symptoms are severe or you need urgent help, contact your local
              emergency service. Don’t wait for a response through this app.
            </Copy>
          </>
        ) : stage === "ready" ? (
          <>
            <Copy secondary style={{ marginTop: 12 }}>
              {kind === "ecg"
                ? "A short recording with your Viatom BP2."
                : "A simple weight check with your LeScale."}
            </Copy>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 22,
                marginTop: 28,
                gap: 20,
              }}
            >
              {(kind === "ecg"
                ? [
                    "Sit comfortably and keep still.",
                    "Use the electrode position described in your BP2 instructions.",
                    "Press the ECG function button on the BP2 and record for 30 seconds.",
                  ]
                : [
                    "Use a hard, flat, dry surface.",
                    "Check the instructions for your exact scale model.",
                    "Step onto the scale and remain still until the weight settles.",
                  ]
              ).map((text, index) => (
                <View key={text} style={{ flexDirection: "row", gap: 14 }}>
                  <Copy style={{ color: colors.tint, fontWeight: "600" }}>
                    {index + 1}
                  </Copy>
                  <Copy style={{ flex: 1 }}>{text}</Copy>
                </View>
              ))}
            </View>
            <Copy
              secondary
              style={{ marginTop: 20, fontSize: 14, lineHeight: 21 }}
            >
              Read the full IFU before use. If you have a pacemaker or another
              implanted device, check the manufacturer restrictions and your
              care team’s instructions.
            </Copy>
            <View style={{ marginTop: 20, gap: 12 }}>
              <Button
                title={
                  care.isDemo
                    ? kind === "ecg"
                      ? "Start demo recording"
                      : "Start demo measurement"
                    : "I’m ready — wait for my device"
                }
                onPress={start}
              />
              <Button
                title="Read device instructions (IFU)"
                secondary
                onPress={() =>
                  void openLink(DEVICE_GUIDES[kind === "ecg" ? 0 : 1]!.url)
                }
              />
            </View>
            <Copy
              secondary
              style={{ fontSize: 13, lineHeight: 19, marginTop: 18 }}
            >
              {care.isDemo
                ? "This demonstration uses synthetic readings. No Bluetooth device is connected."
                : "Pair your device in Settings first. Start the measurement on the device; received readings are saved automatically."}
            </Copy>
          </>
        ) : stage === "recording" ? (
          <>
            <View
              style={{
                marginTop: 38,
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 24,
                gap: 24,
              }}
            >
              {kind === "ecg" ? (
                <Waveform
                  points={
                    care.isDemo ? waveform : (devices.latest?.waveform ?? [])
                  }
                  moving={care.isDemo && !reduceMotion}
                  height={140}
                />
              ) : (
                <Icon name="scalemass" size={70} />
              )}
              <Copy
                style={{
                  fontSize: 40,
                  lineHeight: 48,
                  fontWeight: "500",
                  fontVariant: ["tabular-nums"],
                  textAlign: "center",
                }}
              >
                {care.isDemo ? `${seconds}s` : "Waiting…"}
              </Copy>
              <Copy secondary style={{ textAlign: "center" }}>
                {care.isDemo
                  ? "Keep still. Your demo reading is on its way."
                  : "Complete the measurement on your device. It will appear here when received."}
              </Copy>
            </View>
            <Copy secondary style={{ marginTop: 22 }}>
              {care.isDemo
                ? "Synthetic signal · Demonstration only"
                : devices.status}
            </Copy>
          </>
        ) : result ? (
          <>
            {kind === "ecg" && result.waveform && (
              <View style={{ marginTop: 32 }}>
                <Waveform points={result.waveform} height={130} />
              </View>
            )}
            <Copy
              style={{
                marginTop: 28,
                fontSize: kind === "weight" ? 44 : 22,
                lineHeight: kind === "weight" ? 54 : 30,
                fontWeight: "600",
                fontVariant: ["tabular-nums"],
              }}
            >
              {entrySummary(result)}
            </Copy>
            {result.answers && (
              <View style={{ marginTop: 18 }}>
                {QUESTIONS.map((question) => (
                  <View key={question.key} style={{ marginBottom: 18 }}>
                    <Copy secondary style={{ fontSize: 14 }}>
                      {question.title}
                    </Copy>
                    <Copy style={{ marginTop: 4 }}>
                      {result.answers?.[question.key]}
                    </Copy>
                  </View>
                ))}
              </View>
            )}
            <Copy secondary style={{ marginTop: 12 }}>
              {recorded
                ? care.isDemo
                  ? "Saved to your demo diary."
                  : recordedResult?.sync === "saved"
                    ? "Saved to your patient account."
                    : "Saved on this phone. Waiting to sync with your patient account."
                : deviceResult
                  ? devices.saving
                    ? "Saving your device reading…"
                    : "This reading could not be saved. Keep the app open and retry."
                  : "Review your recording before saving."}
            </Copy>
            <Copy secondary style={{ fontSize: 14, marginTop: 18 }}>
              {care.isDemo
                ? "Synthetic example · Not a medical reading"
                : "Device data only. No clinical interpretation is provided."}
            </Copy>
            <View style={{ marginTop: 28 }}>
              <Button
                title={
                  recorded
                    ? "Done"
                    : deviceResult
                      ? "Retry save"
                      : "Save to diary"
                }
                busy={busy || (deviceResult && devices.saving)}
                onPress={recorded ? onClose : () => void save(result)}
              />
            </View>
          </>
        ) : null}
      </ScrollView>
    </Modal>
  );
}
