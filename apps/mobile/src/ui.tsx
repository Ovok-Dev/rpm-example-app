import { useEffect, useState, type PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type TextProps,
} from "react-native";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import Svg, { Defs, G, LinearGradient, Path, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "./theme";
import { useCare } from "./care-store";
import { useDevices } from "./bluetooth";

export function Copy({
  style,
  secondary,
  ...props
}: TextProps & { secondary?: boolean }) {
  const { colors } = useTheme();
  const { fontScale } = useWindowDimensions();
  return (
    <Text
      key={fontScale}
      {...props}
      style={[
        styles.body,
        { color: secondary ? colors.muted : colors.ink },
        style,
      ]}
    />
  );
}

export function Icon({
  name,
  color,
  size = 23,
}: {
  name: SymbolViewProps["name"];
  color?: string;
  size?: number;
}) {
  const { colors } = useTheme();
  return (
    <SymbolView
      name={name}
      tintColor={color ?? colors.tint}
      size={size}
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

export function Button({
  title,
  onPress,
  busy = false,
  disabled = false,
  secondary = false,
  testID,
}: {
  title: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  secondary?: boolean;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: secondary ? colors.wash : colors.tint,
          opacity: disabled || busy ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      {busy ? (
        <ActivityIndicator
          color={secondary ? colors.tint : colors.background}
        />
      ) : (
        <Copy
          style={[
            styles.buttonText,
            { color: secondary ? colors.tint : colors.background },
          ]}
        >
          {title}
        </Copy>
      )}
    </Pressable>
  );
}

export function Screen({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle: string }>) {
  const { colors } = useTheme();
  const { isDemo, loading, error, retry, entries, syncing } = useCare();
  const devices = useDevices();
  const pendingCount = entries.filter(
    (entry) => entry.sync === "pending",
  ).length;
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: colors.background,
      }}
    >
      <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <OvokMark />
            <Copy allowFontScaling={false} style={styles.wordmark}>
              ovok
            </Copy>
          </View>
          <View style={[styles.mode, { backgroundColor: colors.wash }]}>
            <Copy
              style={{ color: colors.tint, fontSize: 13, fontWeight: "600" }}
            >
              {isDemo ? "Demo" : "Patient account"}
            </Copy>
          </View>
        </View>
        <View style={styles.content}>
          <Copy accessibilityRole="header" style={styles.title}>
            {title}
          </Copy>
          <Copy secondary style={{ marginTop: 5, marginBottom: 26 }}>
            {subtitle}
          </Copy>
          {loading && (
            <ActivityIndicator
              accessibilityLabel="Loading diary"
              style={{ marginVertical: 12 }}
              color={colors.tint}
            />
          )}
          {(error || pendingCount > 0) && (
            <View style={[styles.notice, { backgroundColor: colors.wash }]}>
              <Copy accessibilityRole="alert">
                {error ??
                  (syncing
                    ? "Saving your readings…"
                    : `${pendingCount} check-in${pendingCount === 1 ? "" : "s"} waiting to sync.`)}
              </Copy>
              {pendingCount > 0 && (
                <Button
                  title="Retry sync"
                  onPress={() => void retry()}
                  secondary
                  busy={syncing}
                />
              )}
            </View>
          )}
          {devices.unsaved.length > 0 && (
            <View style={[styles.notice, { backgroundColor: colors.wash }]}>
              <Copy accessibilityRole="alert">
                {devices.saving
                  ? "Saving your device reading…"
                  : `${devices.unsaved.length} device reading${devices.unsaved.length === 1 ? "" : "s"} could not be saved. Keep the app open and retry.`}
              </Copy>
              <Button
                title="Retry save"
                busy={devices.saving}
                onPress={() => {
                  void Promise.all(
                    devices.unsaved.map((entry) => devices.retrySave(entry)),
                  ).catch(() =>
                    Alert.alert(
                      "Could not save",
                      "Your readings are still held here. Keep the app open and try again.",
                    ),
                  );
                }}
              />
            </View>
          )}
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

function OvokMark() {
  return (
    <Svg
      width={28}
      height={28}
      viewBox="32 -14 108 108"
      accessibilityElementsHidden
    >
      <Defs>
        <LinearGradient id="mark" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor="#B2A5CD" />
          <Stop offset="1" stopColor="#694D98" />
        </LinearGradient>
      </Defs>
      <G transform="translate(-34 -51)" fill="url(#mark)">
        <Path d="M150.351 90.657c0 16.058-8.857 30.099-21.962 37.444 1.44.144 2.808.216 4.248.216 20.81 0 37.732-16.85 37.732-37.66 0-20.81-16.922-37.732-37.732-37.732-1.44 0-2.808.072-4.248.288 13.105 7.345 21.962 21.314 21.962 37.444z" />
        <Path d="M69.703 90.657c0 20.81 16.85 37.66 37.66 37.66 20.81 0 37.731-16.85 37.731-37.66 0-20.81-16.921-37.732-37.731-37.732-20.81 0-37.66 16.922-37.66 37.732z" />
      </G>
    </Svg>
  );
}

export function SectionTitle({ children }: PropsWithChildren) {
  return (
    <Copy
      accessibilityRole="header"
      style={{
        fontSize: 22,
        fontWeight: "600",
        marginTop: 28,
        marginBottom: 14,
        letterSpacing: -0.4,
      }}
    >
      {children}
    </Copy>
  );
}

export function Row({
  title,
  detail,
  symbol,
  onPress,
  danger = false,
  testID,
}: {
  title: string;
  detail?: string;
  symbol: SymbolViewProps["name"];
  onPress?: () => void;
  danger?: boolean;
  testID?: string;
}) {
  const { colors } = useTheme();
  const content = (
    <>
      <Icon name={symbol} color={danger ? colors.danger : colors.tint} />
      <View style={{ flex: 1, gap: 4 }}>
        <Copy
          style={{
            fontWeight: "500",
            color: danger ? colors.danger : colors.ink,
          }}
        >
          {title}
        </Copy>
        {detail && (
          <Copy secondary style={{ fontSize: 14 }}>
            {detail}
          </Copy>
        )}
      </View>
      {onPress && <Icon name="chevron.right" color={colors.muted} size={13} />}
    </>
  );
  const style = [styles.row, { borderBottomColor: colors.line }];
  return onPress ? (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [style, { opacity: pressed ? 0.6 : 1 }]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={style}>{content}</View>
  );
}

export function Waveform({
  points,
  moving = false,
  color,
  height = 80,
}: {
  points: number[];
  moving?: boolean;
  color?: string;
  height?: number;
}) {
  const { colors } = useTheme();
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!moving) return;
    const timer = setInterval(
      () => setPhase((value) => (value + 1) % points.length),
      80,
    );
    return () => clearInterval(timer);
  }, [moving, points.length]);
  const visible = points.slice(phase).concat(points.slice(0, phase));
  const max = Math.max(0.1, ...visible.map(Math.abs));
  const path = visible
    .map(
      (value, index) =>
        `${index ? "L" : "M"}${(index / Math.max(1, visible.length - 1)) * 320},${height * 0.65 - (value / max) * height * 0.5}`,
    )
    .join(" ");
  return (
    <View
      accessibilityLabel="ECG waveform. This trace is not a clinical interpretation."
      accessibilityRole="image"
    >
      <Svg width="100%" height={height} viewBox={`0 0 320 ${height}`}>
        <Path
          d={path}
          fill="none"
          stroke={color ?? colors.tint}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export async function openLink(url: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      "Could not open the link",
      "Please try again when you have a connection.",
    );
  }
}

export const styles = StyleSheet.create({
  body: { fontSize: 17, lineHeight: 24 },
  header: {
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  wordmark: {
    fontSize: 25,
    lineHeight: 32,
    letterSpacing: -1,
    fontWeight: "600",
  },
  mode: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  content: { paddingHorizontal: 24 },
  title: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  button: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  buttonText: { fontSize: 17, fontWeight: "600", textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 76,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  notice: { borderRadius: 12, padding: 16, gap: 12, marginBottom: 16 },
});
