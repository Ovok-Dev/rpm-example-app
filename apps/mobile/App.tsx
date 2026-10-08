import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./src/theme";
import { CareProvider } from "./src/care-store";
import { DeviceWorkspace } from "./src/bluetooth";
import { ovokClient } from "./src/ovok";
import { Icon } from "./src/ui";
import { Home } from "./src/Home";
import { Diary } from "./src/Diary";
import { Support } from "./src/Support";
import { Settings } from "./src/Settings";

const Tabs = createBottomTabNavigator();
const tabSymbols = {
  Home: "house",
  Diary: "book.closed",
  Support: "questionmark.circle",
  Settings: "gearshape",
} as const;

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { colors, dark } = useTheme();
  const [patientId, setPatientId] = useState<string | undefined>();
  useEffect(() => {
    void ovokClient
      .getInitPromise()
      .then(() => {
        const profile = ovokClient.getProfile();
        if (profile?.resourceType === "Patient") setPatientId(profile.id);
      })
      .catch(() => {});
  }, []);

  return (
    <CareProvider key={patientId ?? "demo"} patientId={patientId}>
      <DeviceWorkspace>
        <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
        <NavigationContainer>
          <Tabs.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarButtonTestID: `tab-${route.name.toLowerCase()}`,
              tabBarActiveTintColor: colors.tint,
              tabBarInactiveTintColor: colors.muted,
              tabBarStyle: {
                backgroundColor: colors.surface,
                borderTopColor: colors.line,
                paddingTop: 8,
              },
              tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
              tabBarIcon: ({ color }) => (
                <Icon
                  name={tabSymbols[route.name as keyof typeof tabSymbols]}
                  color={color}
                  size={23}
                />
              ),
            })}
          >
            <Tabs.Screen name="Home" component={Home} />
            <Tabs.Screen name="Diary" component={Diary} />
            <Tabs.Screen name="Support" component={Support} />
            <Tabs.Screen name="Settings">
              {() => (
                <Settings
                  onSignIn={setPatientId}
                  onSignOut={() => setPatientId(undefined)}
                />
              )}
            </Tabs.Screen>
          </Tabs.Navigator>
        </NavigationContainer>
      </DeviceWorkspace>
    </CareProvider>
  );
}
