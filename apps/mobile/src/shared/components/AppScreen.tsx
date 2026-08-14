import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";

import { colors, spacing } from "../theme/tokens";

interface AppScreenProps {
  children: ReactNode;
}

export function AppScreen({ children }: AppScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing["2xl"],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing["2xl"],
  },
});
