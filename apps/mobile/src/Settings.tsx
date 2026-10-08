import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import type { MfaLoginStep } from "@ovok/core";
import { useCare } from "./care-store";
import { useDevices } from "./bluetooth";
import { useTheme } from "./theme";
import { Button, Copy, Icon, openLink, Row, Screen, SectionTitle } from "./ui";
import { apiUrl, ovokClient, tenantCode } from "./ovok";

export function Settings({
  onSignIn,
  onSignOut,
}: {
  onSignIn: (id: string) => void;
  onSignOut: () => void;
}) {
  const care = useCare();
  const devices = useDevices();
  const theme = useTheme();
  const [signIn, setSignIn] = useState(false);
  return (
    <Screen title="Settings" subtitle="Make this space work for you.">
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          padding: 22,
          gap: 14,
        }}
      >
        <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <Icon name="person.crop.circle" size={40} />
          <View style={{ flex: 1 }}>
            <Copy style={{ fontSize: 21, fontWeight: "600" }}>
              {care.isDemo ? "Explore Ovok Care" : "Your patient account"}
            </Copy>
            <Copy secondary style={{ fontSize: 14, marginTop: 4 }}>
              {tenantCode}
            </Copy>
          </View>
        </View>
        <Copy secondary>
          {care.isDemo
            ? "Try every check-in here. Sign in to collect readings from your own devices."
            : "Your readings belong to this account. Demo readings are kept separately."}
        </Copy>
        {care.isDemo && (
          <Button
            title="Sign in to your project"
            onPress={() => setSignIn(true)}
          />
        )}
      </View>
      <SectionTitle>Appearance</SectionTitle>
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {(["system", "light", "dark"] as const).map((value) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityState={{ checked: theme.appearance === value }}
            onPress={() => theme.setAppearance(value)}
            style={{
              minHeight: 52,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Copy>
              {
                { system: "Use device settings", light: "Light", dark: "Dark" }[
                  value
                ]
              }
            </Copy>
            {theme.appearance === value && <Icon name="checkmark" size={18} />}
          </Pressable>
        ))}
      </View>
      <SectionTitle>Devices</SectionTitle>
      {care.isDemo ? (
        <>
          <Row
            title="Viatom BP2"
            detail="ECG · Demo device"
            symbol="waveform.path.ecg"
          />
          <Row
            title="LeScale / Viatom F4"
            detail="Weight · Demo device"
            symbol="scalemass"
          />
          <Copy secondary style={{ fontSize: 13, marginTop: 13 }}>
            Sign in on a physical phone to pair your own devices.
          </Copy>
        </>
      ) : (
        <>
          <Copy secondary style={{ marginBottom: 10 }}>
            {devices.status}
          </Copy>
          {devices.devices.map((device) => (
            <Row
              key={device.id}
              title={
                device.deviceData.model ||
                device.deviceData.localName ||
                "Nearby device"
              }
              detail={device.status ?? "Tap to connect"}
              symbol="antenna.radiowaves.left.and.right"
              onPress={() => void devices.pair(device)}
            />
          ))}
        </>
      )}
      <SectionTitle>About this example</SectionTitle>
      <Row
        title="Source code"
        detail="Apache-2.0 · Version 1.0.0"
        symbol="chevron.left.forwardslash.chevron.right"
        onPress={() =>
          void openLink("https://github.com/Ovok-Dev/rpm-example-app")
        }
      />
      <Row
        title="Privacy"
        detail="How demo and patient records are stored"
        symbol="lock.shield"
        onPress={() =>
          Alert.alert(
            "Your data",
            "Demo records are synthetic and stored locally. Patient readings and login state are stored in the device keychain and sent to your Ovok project. No client secret is included. Signing out hides this account’s diary; pending records stay on this phone for your next sign-in.",
          )
        }
      />
      {care.isDemo ? (
        <Row
          testID="reset-demo"
          title="Reset demo diary"
          detail="Start again with the sample history"
          symbol="arrow.counterclockwise"
          danger
          onPress={() =>
            Alert.alert(
              "Reset the demo diary?",
              "This removes only your demo check-ins.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Reset demo",
                  style: "destructive",
                  onPress: () =>
                    void care
                      .resetDemo()
                      .catch(() =>
                        Alert.alert("Reset failed", "Please try again."),
                      ),
                },
              ],
            )
          }
        />
      ) : (
        <Row
          title="Sign out"
          symbol="rectangle.portrait.and.arrow.right"
          danger
          onPress={() =>
            Alert.alert(
              "Sign out?",
              care.entries.some((entry) => entry.sync === "pending")
                ? "Some readings still need to sync. They stay securely on this phone for your next sign-in."
                : "You can return to the demo after signing out.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Sign out",
                  onPress: async () => {
                    await ovokClient.logout().catch(() => {});
                    onSignOut();
                  },
                },
              ],
            )
          }
        />
      )}
      {signIn && (
        <SignInSheet
          onClose={() => setSignIn(false)}
          onSuccess={(id) => {
            setSignIn(false);
            onSignIn(id);
          }}
        />
      )}
    </Screen>
  );
}

function SignInSheet({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (id: string) => void;
}) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [mfa, setMfa] = useState<MfaLoginStep | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const response = mfa
        ? await mfa.verify(code.trim())
        : await ovokClient.login({
            type: "Patient",
            tenantCode,
            email: email.trim(),
            password,
          });
      if ("nextStep" in response) {
        setMfa(response);
        setPassword("");
        return;
      }
      await ovokClient.setActiveLogin(response);
      const profile = ovokClient.getProfile();
      if (profile?.resourceType !== "Patient" || !profile.id)
        throw new Error("A patient account is required.");
      onSuccess(profile.id);
    } catch {
      setError(
        mfa
          ? "Verification failed. Check the code and try again."
          : "Could not sign in. Check your details and connection, then try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = {
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 17,
    borderRadius: 10,
    minHeight: 54,
    padding: 15,
  };
  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 26, paddingTop: 40, gap: 16 }}
        >
          <Copy
            accessibilityRole="header"
            style={{ fontSize: 30, lineHeight: 38, fontWeight: "600" }}
          >
            {mfa ? "Verify it’s you" : "Welcome to your care."}
          </Copy>
          <Copy secondary>
            {mfa
              ? "Enter the one-time code from your authenticator."
              : `Sign in with your patient account for ${tenantCode}.`}
          </Copy>
          {mfa ? (
            <>
              <Copy>Verification code</Copy>
              <TextInput
                accessibilityLabel="Verification code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                style={inputStyle}
                autoFocus
              />
            </>
          ) : (
            <>
              <Copy>Email address</Copy>
              <TextInput
                accessibilityLabel="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="username"
                style={inputStyle}
              />
              <Copy>Password</Copy>
              <TextInput
                accessibilityLabel="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="current-password"
                style={inputStyle}
                onSubmitEditing={() => void submit()}
              />
            </>
          )}
          {error && (
            <Copy accessibilityRole="alert" style={{ color: colors.danger }}>
              {error}
            </Copy>
          )}
          <Button
            title={mfa ? "Verify and sign in" : "Sign in"}
            busy={busy}
            disabled={
              mfa ? code.trim().length < 6 : !email.includes("@") || !password
            }
            onPress={() => void submit()}
          />
          <Button title="Cancel" secondary onPress={onClose} />
          <Copy secondary style={{ fontSize: 13, lineHeight: 19 }}>
            Your care team provides your account. Demo data is never uploaded
            when you sign in.
          </Copy>
          <Copy secondary style={{ fontSize: 12 }}>
            {apiUrl}
          </Copy>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
