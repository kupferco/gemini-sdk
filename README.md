# Proxy Assistant SDK

## Introduction

The Proxy Assistant SDK is a toolkit for integrating Gemini chatbot services. It offers a flexible way for developers to connect their applications to a proxy server, either locally or in production, and allows for customization based on different environments.

---

## Features

- Dynamic API base URL configuration.
- Support for multiple environments (development, production, ngrok).
- Easy-to-use endpoints for chatbot services (STT, TTS, Gemini).
- Developer-friendly overrides for proxy servers.

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd proxy-assistant-sdk
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

---

## Usage

### Running the SDK Locally

To start the SDK locally in development mode:

```bash
NODE_ENV=development npm run dev
```

To use a local ngrok proxy:

```bash
NODE_ENV=ngrok npm run dev
```

To use a live proxy server in production mode locally:

```bash
NODE_ENV=production npm run dev
```

For Windows:

```cmd
set NODE_ENV=development && npm run dev
```

### Building for Production

To build the SDK for production:

```bash
npm run build
```

This creates an optimized `dist` folder with the compiled files.

### Serving the Production Build

To serve the production build locally:

```bash
npm run start
```

This starts a local server using `vite preview`.

---

## Configuration

### Environment Variables

The SDK uses a dynamic configuration system based on the `NODE_ENV` variable to determine which proxy server to use.

#### Default Environment Configurations

- **Development**

  - `API_BASE_URL`: `http://localhost:8080`

- **Ngrok**

  - `API_BASE_URL`: `https://adcb-2a01-4b00-be13-4400-8c76-4d16-4b6b-14c9.ngrok-free.app`

- **Production**

  - `API_BASE_URL`: `https://proxy-server-14953211771.europe-west2.run.app`

#### Setting `NODE_ENV`

- **UNIX/Linux/macOS:**
  ```bash
  NODE_ENV=development npm run dev
  ```
- **Windows (Command Prompt):**
  ```cmd
  set NODE_ENV=production && npm run dev
  ```

### Overriding the Proxy Server

Developers can dynamically override the proxy server URL in their application:

```javascript
import Config from './src/Config.js';

Config.setApiBaseUrl('https://custom-proxy-server.com');
```

This allows flexibility to test custom proxies without modifying the core configuration.

---

## Scripts

### Available Commands

- **`npm run dev`**: Starts the development server using Vite.
- **`npm run build`**: Builds the project for production.
- **`npm run start`**: Serves the production build using `vite preview`.
- **`npm run test`**: Runs tests with Jest.
- **`npm run test:watch`**: Runs tests in watch mode.

---

## Testing

### Running Tests

Run the test suite with coverage:

```bash
npm run test
```

For continuous testing:

```bash
npm run test:watch
```

---

## FAQ

### How do I switch between local ngrok and production proxies?

You can switch by setting the `NODE_ENV` environment variable:

- For local ngrok: `NODE_ENV=ngrok`.
- For production: `NODE_ENV=production`.

Alternatively, use:

```javascript
Config.setApiBaseUrl('https://your-ngrok-url.ngrok-free.app');
```

### Can I use the SDK without `NODE_ENV`?

Yes. The SDK defaults to `development` if `NODE_ENV` is not set. You can also manually set the base URL using `Config.setApiBaseUrl()`.

