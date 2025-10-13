# Global CO₂ React Native App

A lightweight Expo-powered React Native application that fetches and displays today&apos;s global atmospheric CO₂ concentration (in parts per million). The data is sourced dynamically through OpenAI&apos;s web search capability.

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

   > **Note**
   > In the hosted sandbox used for development the install step fails with a `403 Forbidden` response from the npm registry.
   > This is an environment/network restriction rather than an issue with the project. Install the dependencies locally or in
   > any environment that has access to the public npm registry.

2. **Configure your OpenAI credentials**
   - Create a `.env` file or export the variable before starting Expo:
     ```bash
     export EXPO_PUBLIC_OPENAI_API_KEY="your_openai_api_key"
     ```
   - Alternatively, edit `app.json` and populate `expo.extra.openaiApiKey` (not recommended for checked-in secrets).

3. **Run the app**
   ```bash
   npm run start
   ```
   Use the Expo CLI output to open the app on an emulator, a device, or the web.

## How it works

- On launch (and whenever the user pulls to refresh), the app calls the OpenAI `responses` API with the `web_search` tool enabled.
- The assistant is instructed to return a strict JSON payload containing:
  - `ppm`: the latest measured global CO₂ concentration.
  - `source`: a citation URL returned from the search.
  - `timestamp`: the ISO 8601 date/time for the measurement.
- The UI presents the value, measurement timestamp, and a tappable source link.

## Notes

- Error states (e.g., missing API keys or parsing issues) are surfaced to the user so they can resolve configuration problems quickly.
- Because the app depends on OpenAI&apos;s live web search, running it requires network connectivity and an account with access to the `responses` API and the `web_search` tool.
- Expo SDK 50 is used to maximize compatibility across iOS, Android, and web targets.
