# Samples for Proxy Assistant SDK

This folder contains sample implementations to help developers get started with the SDK.

## Files

- `sample-stt.html`: A simple example to test the `STTService` in the browser.
  - **Usage**: Open the file in a browser and click the buttons to interact with the speech-to-text functionality.
  - **Features**:
    - **Start Listening**: Activates the microphone and starts streaming audio to the server.
    - **Stop Listening**: Stops the microphone and disconnects the WebSocket.
    - **Mute**: Temporarily pauses audio streaming to the server while keeping the microphone active.
    - **Unmute**: Resumes audio streaming after being muted.
  - **Dependencies**: Ensure you have the SDK set up in the correct path.

## Running Samples

1. Start the Vite development server in the project root:
   ```bash
   npm run dev
   ```



## Additional Notes
1. Ensure your browser supports WebRTC and the required APIs (e.g., MediaRecorder, Blob).
2. For production use, adjust configurations and endpoint URLs in the SDK.

