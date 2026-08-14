import { StyleSheet, Text, View } from "react-native";

import { readMobileEnv } from "../../../shared/config/env";
import { AppScreen } from "../../../shared/components/AppScreen";
import {
  FeaturePill,
  FeaturePreviewCard,
} from "../../../shared/components/FeaturePreviewCard";
import {
  colors,
  radii,
  spacing,
  typography,
} from "../../../shared/theme/tokens";

const sections = [
  {
    id: "home",
    title: "Home",
    description:
      "Entry point for the future mobile feed and discovery surfaces.",
  },
  {
    id: "profile",
    title: "Profile",
    description:
      "Reserved for authenticated mobile profile and relationship flows.",
  },
  {
    id: "opportunities",
    title: "Opportunities",
    description:
      "Reserved for browsing, filtering, and managing opportunity flows.",
  },
];

export function HomeScreen() {
  const env = readMobileEnv();

  return (
    <AppScreen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>WeUnite Mobile</Text>
        <Text style={styles.title}>Expo shell ready for the mobile app.</Text>
        <Text style={styles.description}>
          This first app layer keeps the mobile bootstrap simple while we
          prepare navigation, auth, and API integration.
        </Text>
        <View style={styles.envCard}>
          <Text style={styles.envLabel}>API URL</Text>
          <Text style={styles.envValue}>{env.apiUrl}</Text>
        </View>
      </View>

      <View style={styles.navRow}>
        {sections.map((section) => (
          <FeaturePill key={section.id} title={section.title} />
        ))}
      </View>

      <View style={styles.grid}>
        {sections.map((section) => (
          <FeaturePreviewCard
            key={section.id}
            title={section.title}
            description={section.description}
          />
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing["2xl"],
  },
  eyebrow: {
    color: colors.accent,
    textTransform: "uppercase",
    ...typography.eyebrow,
  },
  title: {
    color: colors.text,
    ...typography.title,
  },
  description: {
    color: colors.textMuted,
    ...typography.body,
  },
  envCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  envLabel: {
    color: colors.accent,
    textTransform: "uppercase",
    ...typography.label,
  },
  envValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  navRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  grid: {
    gap: spacing.lg,
  },
});
