import { Ionicons } from "@expo/vector-icons";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { Pressable, StyleSheet, useColorScheme } from "react-native";

import { Colors, Spacing } from "@/constants/theme";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// Bouton bas de page avec icône + label
function BottomTab({
  icon,
  label,
  isFocused,
  ...props
}: TabTriggerSlotProps & { icon: IoniconsName; label: string }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const color = isFocused
    ? (colors.tint ?? "#b45309")
    : (colors.tabIconDefault ?? "#888");

  return (
    <Pressable {...props} style={styles.tabButton}>
      <Ionicons name={icon} size={22} color={color} />
      <ThemedText style={[styles.tabLabel, { color }]}>{label}</ThemedText>
    </Pressable>
  );
}

// Composants spécifiques par onglet (nécessaire pour passer l'icône via asChild)
const DashboardTab = (p: TabTriggerSlotProps) => (
  <BottomTab {...p} icon="home-outline" label="Dashboard" />
);
const TransactionsTab = (p: TabTriggerSlotProps) => (
  <BottomTab {...p} icon="swap-horizontal-outline" label="Transactions" />
);
const PlanificationsTab = (p: TabTriggerSlotProps) => (
  <BottomTab {...p} icon="calendar-outline" label="Planifications" />
);
const ConfigurationTab = (p: TabTriggerSlotProps) => (
  <BottomTab {...p} icon="settings-outline" label="Config" />
);

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];

  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <ThemedView
          type="backgroundElement"
          style={StyleSheet.flatten([
            styles.tabBar,
            { borderTopColor: colors.border ?? "#333" },
          ])}
        >
          <TabTrigger name="home" href="/" asChild>
            <DashboardTab />
          </TabTrigger>
          <TabTrigger name="transactions" href="/transactions" asChild>
            <TransactionsTab />
          </TabTrigger>
          <TabTrigger name="planifications" href="/planifications" asChild>
            <PlanificationsTab />
          </TabTrigger>
          <TabTrigger name="configuration" href="/configuration" asChild>
            <ConfigurationTab />
          </TabTrigger>
        </ThemedView>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingBottom: 20, // espace pour la barre de home iOS/Android
    paddingTop: Spacing.two,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingVertical: Spacing.one,
  },
  tabLabel: {
    fontSize: 10,
  },
});
