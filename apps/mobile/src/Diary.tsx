import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { useCare } from "./care-store";
import { useTheme } from "./theme";
import { Button, Copy, Icon, Screen, SectionTitle, Waveform } from "./ui";
import {
  entrySummary,
  localDay,
  QUESTIONS,
  TASKS,
  type DiaryEntry,
  type MeasurementKind,
} from "./model";

export function Diary() {
  const { entries, isDemo } = useCare();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<MeasurementKind | "all">("all");
  const [selected, setSelected] = useState<DiaryEntry | null>(null);
  const weights = entries
    .filter((entry) => entry.kind === "weight")
    .slice(0, 7)
    .reverse();
  const visible = entries.filter(
    (entry) => filter === "all" || entry.kind === filter,
  );
  const grouped = new Map<string, DiaryEntry[]>();
  for (const entry of visible) {
    const day = localDay(entry.recordedAt);
    grouped.set(day, [...(grouped.get(day) ?? []), entry]);
  }

  return (
    <Screen title="Diary" subtitle="Your check-ins, collected in one place.">
      {weights.length > 0 && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 22,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Copy style={{ fontWeight: "600", flex: 1 }}>Weight over time</Copy>
            <Icon name="scalemass" size={20} />
          </View>
          <Copy secondary style={{ fontSize: 14, marginTop: 4 }}>
            Last {weights.length} readings · kilograms
          </Copy>
          <WeightChart entries={weights} />
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Copy secondary style={{ fontSize: 13 }}>
              {new Date(weights[0]!.recordedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </Copy>
            <Copy secondary style={{ fontSize: 13 }}>
              {new Date(
                weights[weights.length - 1]!.recordedAt,
              ).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </Copy>
          </View>
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 24 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {(["all", "ecg", "weight", "questionnaire"] as const).map((kind) => (
          <Pressable
            key={kind}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === kind }}
            onPress={() => setFilter(kind)}
            style={{
              minHeight: 44,
              justifyContent: "center",
              paddingHorizontal: 16,
              borderRadius: 10,
              backgroundColor: filter === kind ? colors.tint : colors.surface,
            }}
          >
            <Copy
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: filter === kind ? colors.background : colors.muted,
              }}
            >
              {
                {
                  all: "All",
                  ecg: "ECG",
                  weight: "Weight",
                  questionnaire: "Questionnaire",
                }[kind]
              }
            </Copy>
          </Pressable>
        ))}
      </ScrollView>
      {visible.length === 0 && (
        <View style={{ paddingVertical: 38, gap: 12 }}>
          <Icon name="book.closed" size={34} />
          <Copy style={{ fontSize: 22, fontWeight: "600" }}>
            Your diary starts here.
          </Copy>
          <Copy secondary>Complete a check-in on Home to see it here.</Copy>
        </View>
      )}
      {[...grouped].map(([day, records]) => (
        <View key={day}>
          <SectionTitle>
            {new Date(records[0]!.recordedAt).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            })}
          </SectionTitle>
          {records.map((entry) => (
            <Pressable
              key={entry.id}
              accessibilityRole="button"
              onPress={() => setSelected(entry)}
              style={{
                flexDirection: "row",
                gap: 14,
                alignItems: "center",
                borderBottomWidth: 0.5,
                borderBottomColor: colors.line,
                paddingVertical: 17,
              }}
            >
              <Icon
                name={TASKS.find((task) => task.kind === entry.kind)!.symbol}
                size={22}
              />
              <View style={{ flex: 1, gap: 3 }}>
                <Copy style={{ fontWeight: "600" }}>
                  {
                    {
                      ecg: "ECG",
                      weight: "Weight",
                      questionnaire: "Questionnaire",
                    }[entry.kind]
                  }
                </Copy>
                <Copy secondary style={{ fontSize: 14 }}>
                  {entrySummary(entry)}
                </Copy>
              </View>
              <View style={{ alignItems: "flex-end", gap: 3 }}>
                <Copy secondary style={{ fontSize: 13 }}>
                  {new Date(entry.recordedAt).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Copy>
                <Copy
                  style={{
                    color:
                      entry.sync === "pending" ? colors.danger : colors.muted,
                    fontSize: 12,
                  }}
                >
                  {entry.sync === "local"
                    ? "Demo"
                    : entry.sync === "pending"
                      ? "Needs sync"
                      : "Saved"}
                </Copy>
              </View>
            </Pressable>
          ))}
        </View>
      ))}
      {!isDemo && (
        <Copy secondary style={{ fontSize: 13, marginTop: 24 }}>
          This diary shows check-ins recorded on this phone.
        </Copy>
      )}
      {selected && (
        <Modal
          visible
          presentationStyle="pageSheet"
          animationType="slide"
          onRequestClose={() => setSelected(null)}
        >
          <ScrollView
            style={{ backgroundColor: colors.background }}
            contentContainerStyle={{ padding: 26, paddingTop: 40, gap: 20 }}
          >
            <Copy
              accessibilityRole="header"
              style={{ fontSize: 28, lineHeight: 35, fontWeight: "600" }}
            >
              {entrySummary(selected)}
            </Copy>
            <Copy secondary>
              {new Date(selected.recordedAt).toLocaleString()}
            </Copy>
            {selected.waveform && (
              <Waveform points={selected.waveform} height={150} />
            )}
            {selected.answers &&
              QUESTIONS.map((question) => (
                <View key={question.key} style={{ gap: 6 }}>
                  <Copy secondary>{question.title}</Copy>
                  <Copy>{selected.answers?.[question.key]}</Copy>
                </View>
              ))}
            <Copy secondary>
              {selected.source === "demo"
                ? "Synthetic demonstration · No patient data"
                : selected.sync === "saved"
                  ? "Saved to your patient account."
                  : "Kept on this phone. Waiting to sync."}
            </Copy>
            <Button title="Done" onPress={() => setSelected(null)} />
          </ScrollView>
        </Modal>
      )}
    </Screen>
  );
}

function WeightChart({ entries }: { entries: DiaryEntry[] }) {
  const { colors } = useTheme();
  const values = entries.map((entry) => entry.weight!);
  const min = Math.floor(Math.min(...values) * 2) / 2 - 0.5;
  const max = Math.ceil(Math.max(...values) * 2) / 2 + 0.5;
  const points = values.map((value, index) => ({
    x: 8 + (index / Math.max(1, values.length - 1)) * 250,
    y: 14 + ((max - value) / (max - min)) * 95,
  }));
  const path = points
    .map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`)
    .join(" ");
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Weight readings in kilograms: ${values.map((value) => value.toFixed(1)).join(", ")}. Chart scale ${min} to ${max} kilograms.`}
      style={{
        flexDirection: "row",
        gap: 8,
        marginVertical: 18,
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1 }}>
        <Svg height={130} width="100%" viewBox="0 0 270 130">
          {[14, 61.5, 109].map((y) => (
            <Line
              key={y}
              x1={0}
              x2={270}
              y1={y}
              y2={y}
              stroke={colors.line}
              strokeWidth={1}
            />
          ))}
          <Path
            d={path}
            fill="none"
            stroke={colors.tint}
            strokeWidth={2.2}
            strokeLinejoin="round"
          />
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={3.5}
              fill={colors.tint}
            />
          ))}
        </Svg>
      </View>
      <View style={{ height: 115, justifyContent: "space-between" }}>
        <Copy secondary style={{ fontSize: 12 }}>
          {max.toFixed(1)}
        </Copy>
        <Copy secondary style={{ fontSize: 12 }}>
          {min.toFixed(1)}
        </Copy>
      </View>
    </View>
  );
}
