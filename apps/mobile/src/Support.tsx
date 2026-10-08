import { useState } from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "./theme";
import { Copy, Icon, openLink, Row, Screen, SectionTitle } from "./ui";

export const DEVICE_GUIDES = [
  {
    name: "Viatom BP2",
    detail: "ECG monitor · Instructions for use",
    symbol: "waveform.path.ecg" as const,
    url: "https://storage.googleapis.com/public-assets-com-expo-app/instruction-pdf/instruction_armfit.pdf",
  },
  {
    name: "LeScale / Viatom F4",
    detail: "Weight scale · Instructions for use",
    symbol: "scalemass" as const,
    url: "https://storage.googleapis.com/public-assets-com-expo-app/instruction-pdf/instruction_scales.pdf",
  },
];

const help = [
  {
    question: "My device isn’t connecting",
    answer:
      "Use a physical phone, switch on Bluetooth, and allow Bluetooth access for Ovok Care. Keep the device on and nearby. Open Settings → Devices and choose your own device. A simulator cannot connect to these Bluetooth devices.",
  },
  {
    question: "What if a reading hasn’t synced?",
    answer:
      "A reading marked Needs sync is kept securely on this phone. Reconnect to the internet and tap Retry sync. Keep the app installed until every pending reading has synced.",
  },
  {
    question: "What should I do if I feel unwell?",
    answer:
      "Follow the care plan and contact details your care team gave you. For severe symptoms or urgent help, contact your local emergency service. This app is not monitored as an emergency service.",
  },
];

export function Support() {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <Screen title="Support" subtitle="A little guidance, whenever you need it.">
      <View
        style={{
          backgroundColor: colors.wash,
          padding: 22,
          borderRadius: 16,
          gap: 14,
        }}
      >
        <Icon name="heart.text.clipboard" size={34} />
        <Copy style={{ fontSize: 23, lineHeight: 30, fontWeight: "600" }}>
          Your care team comes first.
        </Copy>
        <Copy secondary>
          For questions about symptoms or your care plan, use the contact
          details provided by your care team.
        </Copy>
      </View>
      <SectionTitle>Get to know your devices</SectionTitle>
      {DEVICE_GUIDES.map((guide, index) => (
        <Row
          testID={`ifu-${index}`}
          key={guide.name}
          title={guide.name}
          detail={guide.detail}
          symbol={guide.symbol}
          onPress={() => void openLink(guide.url)}
        />
      ))}
      <Copy secondary style={{ fontSize: 13, lineHeight: 19, marginTop: 13 }}>
        IFUs open in your browser. Use the instructions supplied with your exact
        model; LeScale models can differ.
      </Copy>
      <SectionTitle>Common questions</SectionTitle>
      {help.map((item) => (
        <View
          key={item.question}
          style={{ borderBottomWidth: 0.5, borderBottomColor: colors.line }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: expanded === item.question }}
            onPress={() =>
              setExpanded(expanded === item.question ? null : item.question)
            }
            style={{
              paddingVertical: 19,
              flexDirection: "row",
              gap: 14,
              alignItems: "center",
            }}
          >
            <Copy style={{ flex: 1, fontWeight: "500" }}>{item.question}</Copy>
            <Icon
              name={expanded === item.question ? "minus" : "plus"}
              size={15}
            />
          </Pressable>
          {expanded === item.question && (
            <Copy secondary style={{ paddingBottom: 19 }}>
              {item.answer}
            </Copy>
          )}
        </View>
      ))}
      <SectionTitle>For developers</SectionTitle>
      <Row
        title="Build with Ovok"
        detail="CHF guide and SDK documentation"
        symbol="book"
        onPress={() =>
          void openLink("https://docs.ovok.com/guides/chf-remote-monitoring")
        }
      />
    </Screen>
  );
}
