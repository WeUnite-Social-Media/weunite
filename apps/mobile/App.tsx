import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { readMobileEnv } from "./src/lib/env";

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

export default function App() {
  const env = readMobileEnv();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>WeUnite Mobile</Text>
          <Text style={styles.title}>
            Expo shell ready for the mobile app track.
          </Text>
          <Text style={styles.description}>
            This workspace is intentionally small for now. It exists to validate
            the monorepo, mobile runtime config, and the future shared API
            surface.
          </Text>
          <View style={styles.envCard}>
            <Text style={styles.envLabel}>API URL</Text>
            <Text style={styles.envValue}>{env.apiUrl}</Text>
          </View>
        </View>

        <View style={styles.navRow}>
          {sections.map((section) => (
            <Pressable key={section.id} style={styles.navPill}>
              <Text style={styles.navPillText}>{section.title}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.grid}>
          {sections.map((section) => (
            <View key={section.id} style={styles.card}>
              <Text style={styles.cardTitle}>{section.title}</Text>
              <Text style={styles.cardDescription}>{section.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4efe6",
  },
  content: {
    gap: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  hero: {
    backgroundColor: "#fffaf2",
    borderColor: "#d5c0a7",
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    padding: 24,
  },
  eyebrow: {
    color: "#8d5c2d",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#2c1d12",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  description: {
    color: "#5d4734",
    fontSize: 16,
    lineHeight: 24,
  },
  envCard: {
    backgroundColor: "#f1e1cc",
    borderRadius: 16,
    gap: 4,
    padding: 16,
  },
  envLabel: {
    color: "#8d5c2d",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  envValue: {
    color: "#2c1d12",
    fontSize: 15,
    fontWeight: "600",
  },
  navRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  navPill: {
    backgroundColor: "#1d3b2a",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  navPillText: {
    color: "#f7f2ea",
    fontWeight: "700",
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#dfd0bc",
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    padding: 20,
  },
  cardTitle: {
    color: "#2c1d12",
    fontSize: 18,
    fontWeight: "700",
  },
  cardDescription: {
    color: "#6d5742",
    fontSize: 15,
    lineHeight: 22,
  },
});
