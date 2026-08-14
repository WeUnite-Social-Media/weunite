import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "../theme/tokens";

interface FeaturePreviewCardProps {
  title: string;
  description: string;
}

export function FeaturePreviewCard({
  title,
  description,
}: FeaturePreviewCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );
}

interface FeaturePillProps {
  title: string;
}

export function FeaturePill({ title }: FeaturePillProps) {
  return (
    <Pressable style={styles.navPill}>
      <Text style={styles.navPillText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  cardTitle: {
    color: colors.text,
    ...typography.cardTitle,
  },
  cardDescription: {
    color: colors.textSoft,
    ...typography.cardBody,
  },
  navPill: {
    backgroundColor: colors.brand,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  navPillText: {
    color: colors.brandText,
    fontWeight: "700",
  },
});
