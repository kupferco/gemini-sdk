# Samples for Proxy Assistant SDK

This folder contains sample implementations to help developers get started with the SDK.

## Files

### [`sample-stt.html`](sample-stt.html)
A simple example to test the `STTService` in the browser.

- **Usage**: Open the file in a browser and click the buttons to interact with the speech-to-text functionality.
- **Features**:
  - **Start Listening**: Activates the microphone and starts streaming audio to the server.
    - Includes an optional `mode` flag to enable specific functionality like `stt_only`.
  - **Stop Listening**: Stops the microphone and disconnects the WebSocket.
  - **Mute**: Temporarily pauses audio streaming to the server while keeping the microphone active.
  - **Unmute**: Resumes audio streaming after being muted.
- **Dependencies**: Ensure you have the SDK set up in the correct path.

---

### [`sample-tts.html`](sample-tts.html)
A simple example to test the `TTSService` in the browser.

- **Usage**: Open the file in a browser and click the buttons to interact with the text-to-speech functionality.
- **Features**:
  - **Play Audio**: Converts provided text into audio and plays it in the browser.
  - **Stop Audio**: Stops any ongoing audio playback.
  - **Error Handling**: Demonstrates graceful handling of playback errors.
- **Dependencies**: Ensure you have the SDK set up in the correct path.

---

### [`sample-voice.html`](sample-voice.html)
A combined example demonstrating the use of both `STTService` and `TTSService`.

- **Usage**: Open the file in a browser and click the buttons to test integrated voice interaction.
- **Features**:
  - **Start Voice Interaction**: Begins capturing audio for transcription and plays responses from a TTS system.
  - **Stop Interaction**: Stops all ongoing STT and TTS activity.
  - **Demo Workflow**: Demonstrates how speech-to-text can be seamlessly integrated with text-to-speech for conversational use cases.
- **Dependencies**: Ensure you have the SDK set up in the correct path.

---

### [`sample-text.html`](sample-text.html)
A simple example to interact with the `GeminiService` using a text-based interface.

- **Usage**: Open the file in a browser and use the input box to type messages to the assistant.
- **Features**:
  - **Send Messages**: Sends user input to Gemini via REST and displays responses.
  - **Load Conversation History**: Automatically fetches and displays previous messages when the page loads.
  - **Clear History**: Clears both the local and server-side conversation history.
  - **Start New Session**: Resets the session and clears the conversation log.
- **Dependencies**: Ensure you have the SDK set up in the correct path.

---

## Running Samples

1. Start the Vite development server in the project root:
   ```bash
   npm run dev
   ```

2. Open any of the sample files in your browser:
   - Navigate to the URL shown by the Vite development server (e.g., `http://localhost:3000`).
   - Examples:
     - [`sample-stt.html`](sample-stt.html)
     - [`sample-tts.html`](sample-tts.html)
     - [`sample-voice.html`](sample-voice.html)
     - [`sample-text.html`](sample-text.html)

---

## Additional Notes

1. Ensure your browser supports WebRTC and the required APIs (e.g., MediaRecorder, Blob).
2. The `mode` flag for `start_stt` is set in the `Start Listening` button logic to demonstrate the `stt_only` functionality.
3. For production use, adjust configurations and endpoint URLs in the SDK.

