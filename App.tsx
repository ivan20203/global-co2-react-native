import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const CURRENT_PPM = 420;

const formatPpm = (ppm: number): string => `${ppm.toLocaleString()} ppm`;

const SCENARIOS = [
  {
    ppm: 350,
    title: 'Pre-industrial balance',
    description:
      'A climate similar to the early 20th century. Ice sheets remain stable, coral reefs thrive, and weather patterns stay within historical ranges.',
  },
  {
    ppm: 420,
    title: 'Where we stand today',
    description:
      'The planet is experiencing record-breaking heat, more intense wildfires, and widespread coral bleaching. Extreme storms are increasingly common.',
  },
  {
    ppm: 450,
    title: 'Critical warming threshold',
    description:
      'Exceeding 1.5°C of warming becomes likely. Mountain glaciers disappear, summer Arctic sea ice vanishes, and crop yields fall across the tropics.',
  },
  {
    ppm: 500,
    title: 'A new Arctic reality',
    description:
      'The North Pole spends the majority of the year ice-free, opening year-round Arctic shipping routes. Coastal communities worldwide face frequent flooding.',
  },
  {
    ppm: 550,
    title: 'Runaway feedbacks',
    description:
      'Permafrost thaw releases vast stores of methane. Global droughts and megastorms strain infrastructure and drive mass displacement.',
  },
  {
    ppm: 600,
    title: 'Radically altered Earth',
    description:
      'Sea levels are meters higher, forcing the relocation of major cities. Many ecosystems collapse, and keeping outdoor labor safe becomes a daily challenge.',
  },
] as const;

type Tab = 'now' | 'future';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('now');

  const sortedScenarios = useMemo(
    () => [...SCENARIOS].sort((a, b) => a.ppm - b.ppm),
    []
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'} />
      <View style={styles.container}>

        <View style={styles.tabBar}>
          {([
            { key: 'now' as Tab, label: 'Today' },
            { key: 'future' as Tab, label: 'Future Forecasts' },
          ] as const).map((tab) => {
            const selected = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabButton, selected && styles.tabButtonActive]}
              >
                <Text style={[styles.tabButtonText, selected && styles.tabButtonTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {activeTab === 'now' ? (
            <View style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <Text style={styles.heroLabel}>Estimated atmospheric concentration</Text>
                <Text style={styles.heroPpm}>{formatPpm(CURRENT_PPM)}</Text>
              </View>
              <Text style={styles.heroDescription}>
                Scientists track atmospheric CO₂ as the clearest indicator of how much heat we trap.
                Holding steady at 420 ppm keeps the planet warmer than at any time in human history.
              </Text>
              <View style={styles.statRow}>
                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>Since 1980</Text>
                  <Text style={styles.statValue}>+90 ppm</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>Approx. warming</Text>
                  <Text style={styles.statValue}>~1.2°C</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>Share of CO₂</Text>
                  <Text style={styles.statValue}>~76% of GHGs</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>Daily CO₂ Increase</Text>
                  <Text style={styles.statValue}>~0.0001ppm</Text>
                </View>
              </View>
              <Text style={styles.footnote}>
                Data shown is illustrative and will be replaced with live measurements in future releases.
              </Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {sortedScenarios.map((scenario, index) => (
                <View key={scenario.ppm} style={styles.timelineItem}>
                  <View style={styles.timelineMarker}>
                    <Text style={styles.timelineMarkerText}>{scenario.ppm}</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>{scenario.title}</Text>
                    <Text style={styles.timelineDescription}>{scenario.description}</Text>
                    {index < sortedScenarios.length - 1 && <View style={styles.divider} />}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5f5',
    lineHeight: 22,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  tabButton: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  tabButtonActive: {
    backgroundColor: '#38bdf8',
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderColor: '#38bdf8',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabButtonTextActive: {
    color: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  heroHeader: {
    gap: 8,
  },
  heroLabel: {
    fontSize: 16,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  heroPpm: {
    fontSize: 64,
    fontWeight: '900',
    color: '#38bdf8',
    letterSpacing: 1.5,
  },
  heroDescription: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBlock: {
    flexBasis: '30%',
    minWidth: 120,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  statLabel: {
    fontSize: 14,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
  footnote: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  timeline: {
    gap: 20,
    paddingBottom: 40,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineMarker: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  timelineMarkerText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#38bdf8',
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  timelineDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#e2e8f0',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    marginTop: 12,
  },
});

export default App;
