# Samples for Proxy Assistant SDK

This folder contains sample implementations to help developers get started with the SDK.

## Files

- [`sample-stt.html`](sample-stt.html): A simple example to test the `STTService` in the browser.
  - **Usage**: Open the file in a browser and click the buttons to interact with the speech-to-text functionality.
  - **Features**:
    - **Start Listening**: Activates the microphone and starts streaming audio to the server.
      - Includes an optional `mode` flag to enable specific functionality like `stt_only`.
    - **Stop Listening**: Stops the microphone and disconnects the WebSocket.
    - **Mute**: Temporarily pauses audio streaming to the server while keeping the microphone active.
    - **Unmute**: Resumes audio streaming after being muted.
  - **Dependencies**: Ensure you have the SDK set up in the correct path.

## Running Samples

1. Start the Vite development server in the project root:
   ```bash
   npm run dev
   ```

2. Open [`sample-stt.html`](sample-stt.html) in your browser:
   - Navigate to the URL shown by the Vite development server (e.g., `http://localhost:3000`).

## Additional Notes

1. Ensure your browser supports WebRTC and the required APIs (e.g., MediaRecorder, Blob).
2. The `mode` flag for `start_stt` is set in the `Start Listening` button logic to demonstrate the `stt_only` functionality.
3. For production use, adjust configurations and endpoint URLs in the SDK.

