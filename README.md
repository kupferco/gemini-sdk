# Proxy Assistant SDK

## Introduction

The Proxy Assistant SDK simplifies the integration of Gemini chatbot services with your application. Designed for developers, it offers dynamic proxy server configuration, multi-environment support, and flexible APIs for seamless interaction with Gemini services.

---

## Features

- **Dynamic API Configuration**: Automatically adapts to different environments.
- **Flexible Deployment**: Supports local, ngrok, and production environments.
- **Comprehensive Chatbot APIs**: Streamlined access to STT, TTS, and Gemini endpoints.
- **Custom Proxy Overrides**: Easily switch to custom proxy servers for testing.

---

## Installation

You can install the SDK from a `.tgz` file for local use:

1. Obtain the `.tgz` file (e.g., `proxy-assistant-sdk-1.0.0.tgz`).
2. Install it in your project:
   ```bash
   npm install ./path-to-your-package.tgz
   ```

---

## Usage

### Importing the SDK

After installation, import and use the SDK in your project:

```javascript
import { Config, TTSService, STTService } from 'proxy-assistant-sdk';

// Example: Set a custom API base URL
Config.setApiBaseUrl('https://custom-proxy-server.com');

// Example: Start the STT service
const sttService = new STTService();
sttService.startListening((transcript) => {
  console.log('Transcription:', transcript);
});
```

---

### Running Locally

To use the SDK in a local environment, set up your proxy server and configure the environment variables:

```bash
NODE_ENV=development npm run dev
```

Alternatively, use `ngrok` for tunneling:

```bash
NODE_ENV=ngrok npm run dev
```

For production environments:

```bash
NODE_ENV=production npm run start
```

---

## Configuration

### Environment Variables

The SDK uses environment variables to determine the API base URL based on the `NODE_ENV` setting.

#### Default Configurations

| Environment | Base URL                                   |
| ----------- | ------------------------------------------ |
| Development | `http://localhost:8080`                    |
| Ngrok       | `https://your-ngrok-url.ngrok-free.app`    |
| Production  | `https://proxy-server-14953211771.run.app` |

### Custom Configuration

To override the default base URL:

```javascript
Config.setApiBaseUrl('https://custom-proxy.com');
```

This allows you to connect to a different proxy server dynamically.

---

## Updating the SDK During Development

If you’re making changes to the SDK and need to test them in a project, follow these steps:

1. **Rebuild the SDK**\
   Navigate to the SDK project directory and rebuild it:

   ```bash
   cd /path/to/proxy-assistant-sdk
   npm run build
   ```

2. **Pack the SDK**\
   Create a `.tgz` file for distribution:

   ```bash
   npm pack
   ```

   This will generate a file named something like `proxy-assistant-sdk-1.0.0.tgz` in the SDK directory.

3. **Uninstall the Current SDK**\
   Navigate to your project where the SDK is used and uninstall the existing SDK:

   ```bash
   cd /path/to/your-project
   npm uninstall proxy-assistant-sdk
   ```

4. **Install the Updated SDK**\
   Install the newly packed SDK:

   ```bash
   npm install /path/to/proxy-assistant-sdk/proxy-assistant-sdk-1.0.0.tgz
   ```

5. **Restart the Development Server**\
   To ensure the updated SDK is picked up, restart your development server with a cache reset:

   ```bash
   npm start --reset-cache
   ```

6. **Verify Changes**\
   Test the SDK in your project to confirm the updates are working as intended.

---

## Scripts

| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start development server with Vite. |
| `npm run build`      | Build for production.               |
| `npm run start`      | Serve production build.             |
| `npm run test`       | Run tests with Jest.                |
| `npm run test:watch` | Run tests in watch mode.            |

---

## Testing

### Running Tests

Ensure the SDK functions as expected by running:

```bash
npm run test
```

For real-time feedback during development:

```bash
npm run test:watch
```

---

## FAQ

### How do I install the SDK from a `.tgz` file?

Download the `.tgz` package and run:

```bash
npm install ./path-to-your-package.tgz
```

### Can I set a custom proxy server URL?

Yes, you can dynamically set the proxy server:

```javascript
Config.setApiBaseUrl('https://your-proxy-url.com');
```

---

## Recreating the `.tgz` File

If you need to recreate the `.tgz` file for the SDK:

1. Navigate to the root of the SDK project (where `package.json` is located):

   ```bash
   cd /path/to/proxy-assistant-sdk
   ```

2. Run the following command:

   ```bash
   npm pack
   ```

3. The command generates a `.tgz` file (e.g., `proxy-assistant-sdk-1.0.0.tgz`) in the same directory.

4. Use this file for local installations:

   ```bash
   npm install ./path-to-your-package.tgz
   ```
