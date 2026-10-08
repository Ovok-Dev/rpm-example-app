import { useState } from "react";
import { Pressable, View } from "react-native";
import { useCare } from "./care-store";
import { useTheme } from "./theme";
import { Copy, Icon, Screen, SectionTitle, Waveform } from "./ui";
import {
  completedKinds,
  demoWaveform,
  TASKS,
  type MeasurementKind,
} from "./model";
import { MeasurementSheet } from "./MeasurementSheet";

const previewWaveform = demoWaveform();

export function Home() {
  const care = useCare();
  const { colors } = useTheme();
  const [task, setTask] = useState<MeasurementKind | null>(null);
  const completed = completedKinds(care.entries, care.today);
  const next = TASKS.find((task) => !completed.has(task.kind));
  const date = care.today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <Screen title="Home" subtitle={date}>
      <View
        style={{
          backgroundColor: colors.hero,
          padding: 24,
          borderRadius: 16,
          gap: 17,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Copy
            style={{
              color: colors.onHero,
              fontWeight: "600",
              fontSize: 28,
              lineHeight: 34,
              flex: 1,
              letterSpacing: -0.6,
            }}
          >
            {next ? "A little care.\nEvery day." : "Done for today."}
          </Copy>
          <Icon
            name={next ? "heart" : "checkmark.circle"}
            color={colors.heroMuted}
            size={37}
          />
        </View>
        <Copy style={{ color: colors.heroMuted }}>
          {next
            ? "Your daily check-in, one step at a time."
            : "Your three check-ins are recorded. You can revisit them in your diary."}
        </Copy>
        <View
          accessibilityLabel={`${completed.size} of 3 daily tasks recorded`}
          style={{ flexDirection: "row", alignItems: "center", gap: 7 }}
        >
          {TASKS.map((item) => (
            <View
              key={item.kind}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: completed.has(item.kind)
                  ? "#E1CFF9"
                  : "#7D669B",
              }}
            />
          ))}
          <Copy
            style={{ color: colors.heroMuted, fontSize: 13, marginLeft: 6 }}
          >
            {completed.size} of 3
          </Copy>
        </View>
        {next && (
          <Pressable
            testID="start-checkin"
            accessibilityRole="button"
            disabled={care.loading}
            onPress={() => setTask(next.kind)}
            style={({ pressed }) => ({
              minHeight: 49,
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: "#FFFFFF",
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Copy style={{ color: "#4B356D", fontWeight: "600", flex: 1 }}>
              {next.title}
            </Copy>
            <Icon name="arrow.right" color="#4B356D" size={18} />
          </Pressable>
        )}
      </View>
      <SectionTitle>Today’s measurements</SectionTitle>
      {TASKS.map((item) => {
        const done = completed.has(item.kind);
        const latest = care.entries.find((entry) => entry.kind === item.kind);
        return (
          <Pressable
            key={item.kind}
            testID={`task-${item.kind}`}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}${done ? ", recorded today" : ""}`}
            disabled={care.loading}
            onPress={() => setTask(item.kind)}
            style={({ pressed }) => ({
              paddingVertical: 19,
              borderBottomWidth: 0.5,
              borderBottomColor: colors.line,
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 15 }}
            >
              <View
                style={{
                  width: 47,
                  height: 47,
                  borderRadius: 13,
                  backgroundColor: colors.wash,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name={item.symbol} />
              </View>
              <View style={{ flex: 1, gap: 5 }}>
                <Copy style={{ fontSize: 18, fontWeight: "600" }}>
                  {item.title}
                </Copy>
                <Copy secondary style={{ fontSize: 14 }}>
                  {done ? "Recorded today" : item.subtitle}
                </Copy>
              </View>
              <Icon
                name={done ? "checkmark.circle.fill" : "chevron.right"}
                size={done ? 22 : 14}
              />
            </View>
            {item.kind === "ecg" && done && latest?.waveform && (
              <Waveform points={latest.waveform} height={55} />
            )}
            {item.kind === "ecg" && !done && care.isDemo && (
              <View style={{ marginTop: 14, paddingHorizontal: 4 }}>
                <Waveform points={previewWaveform} height={48} />
                <Copy secondary style={{ fontSize: 12 }}>
                  Synthetic preview · Record your check-in to begin
                </Copy>
              </View>
            )}
          </Pressable>
        );
      })}
      <View
        style={{
          marginTop: 22,
          flexDirection: "row",
          gap: 9,
          alignItems: "flex-start",
        }}
      >
        <Icon name="lock.shield" size={18} />
        <Copy secondary style={{ fontSize: 13, lineHeight: 19, flex: 1 }}>
          {care.isDemo
            ? "Demo readings are synthetic and stay on this phone."
            : "Readings are saved to your patient account. This app is not an emergency service."}
        </Copy>
      </View>
      {task && <MeasurementSheet kind={task} onClose={() => setTask(null)} />}
    </Screen>
  );
}
