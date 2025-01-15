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

| Environment  | Base URL                                      |
|--------------|-----------------------------------------------|
| Development  | `http://localhost:8080`                      |
| Ngrok        | `https://your-ngrok-url.ngrok-free.app`       |
| Production   | `https://proxy-server-14953211771.run.app`   |

### Custom Configuration

To override the default base URL:

```javascript
Config.setApiBaseUrl('https://custom-proxy.com');
```

This allows you to connect to a different proxy server dynamically.

---

## Scripts

| Command           | Description                            |
|-------------------|----------------------------------------|
| `npm run dev`     | Start development server with Vite.   |
| `npm run build`   | Build for production.                 |
| `npm run start`   | Serve production build.               |
| `npm run test`    | Run tests with Jest.                  |
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

---

## Contributing

We welcome contributions! Please open an issue or pull request to share your improvements.

---

## License

This project is licensed under the ISC License. See the `LICENSE` file for details.

