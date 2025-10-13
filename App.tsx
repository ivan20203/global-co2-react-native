import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';

type Co2Reading = {
  ppm: number;
  source: string;
  timestamp: string;
};

type OpenAIResponse = {
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  output_text?: string;
};

const getOpenAIApiKey = (): string | undefined => {
  const envKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY;
  if (envKey && envKey.length > 0) {
    return envKey;
  }

  const extraKey = Constants?.expoConfig?.extra?.openaiApiKey as string | undefined;
  return extraKey && extraKey.length > 0 ? extraKey : undefined;
};

const fetchCurrentCo2 = async (): Promise<Co2Reading> => {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error(
      'Missing OpenAI API key. Provide EXPO_PUBLIC_OPENAI_API_KEY in your environment or set expo.extra.openaiApiKey in app.json.'
    );
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text:
                'Use web_search to find the most recent global atmospheric CO2 concentration in parts per million (ppm). Respond with JSON containing fields "ppm" (number), "source" (string URL), and "timestamp" (ISO 8601 date of the measurement).',
            },
          ],
        },
      ],
      tools: [{ type: 'web_search' }],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const json = (await response.json()) as OpenAIResponse;
  const rawContent =
    json.output?.[0]?.content?.find((item) => item.type === 'output_text')?.text ??
    json.output?.[0]?.content?.[0]?.text ??
    json.output_text;

  if (!rawContent) {
    throw new Error('OpenAI did not return any textual content.');
  }

  let parsed: Co2Reading | undefined;
  try {
    parsed = JSON.parse(rawContent) as Co2Reading;
  } catch (error) {
    throw new Error('Failed to parse OpenAI response as JSON.');
  }

  if (typeof parsed.ppm !== 'number' || !parsed.source || !parsed.timestamp) {
    throw new Error('OpenAI response JSON was missing required fields.');
  }

  return parsed;
};

const formatPpm = (ppm: number): string => `${ppm.toFixed(2)} ppm`;

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString();
};

const App: React.FC = () => {
  const [reading, setReading] = useState<Co2Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadReading = useCallback(async () => {
    setError(null);
    try {
      const result = await fetchCurrentCo2();
      setReading(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error fetching CO2 levels.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReading();
  }, [loadReading]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      await loadReading();
    } finally {
      setRefreshing(false);
    }
  }, [loadReading]);

  const content = useMemo(() => {
    if (loading && !refreshing && !reading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={styles.metric.color} />
          <Text style={styles.loadingText}>Fetching today&apos;s CO₂ levels…</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Could not load CO₂ data</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      );
    }

    if (!reading) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>No data available</Text>
        </View>
      );
    }

    return (
      <View style={styles.metricContainer}>
        <Text style={styles.metricLabel}>Today&apos;s Global CO₂ Concentration</Text>
        <Text style={styles.metric}>{formatPpm(reading.ppm)}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.metaLabel}>Measured:</Text>
          <Text style={styles.metaValue}>{formatDate(reading.timestamp)}</Text>
        </View>
        <View style={styles.metaContainer}>
          <Text style={styles.metaLabel}>Source:</Text>
          <Text
            style={[styles.metaValue, styles.link]}
            onPress={() => {
              if (reading.source) {
                void Linking.openURL(reading.source);
              }
            }}
          >
            {reading.source}
          </Text>
        </View>
      </View>
    );
  }, [error, loading, reading, refreshing]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Global CO₂ Tracker</Text>
        <Text style={styles.subtitle}>
          Data sourced on demand via OpenAI web search. Pull to refresh for the latest reading.
        </Text>
        {content}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    gap: 16,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5f5',
    marginBottom: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 48,
  },
  loadingText: {
    color: '#e2e8f0',
    fontSize: 16,
  },
  metricContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
  },
  metric: {
    color: '#38bdf8',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: 1,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaLabel: {
    color: '#cbd5f5',
    fontWeight: '600',
  },
  metaValue: {
    color: '#e2e8f0',
    flexShrink: 1,
  },
  link: {
    textDecorationLine: 'underline',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f87171',
  },
  errorMessage: {
    fontSize: 16,
    color: '#fecaca',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default App;
