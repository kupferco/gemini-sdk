import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    // Development configuration
    return {
      root: './samples-internal',
      server: {
        open: true,
        port: 3000,
      },
    };
  } else {
    // Build configuration for packaging
    return {
      build: {
        outDir: 'lib', // Output directory for the built SDK
        lib: {
          entry: './src/index.js', // Main entry point of the SDK
          name: 'ProxyAssistantSDK', // Global variable name (for UMD build)
          fileName: (format) =>
            format === 'es' ? `proxy-assistant-sdk.esm.js` : `proxy-assistant-sdk.${format}.js`,
        },
        rollupOptions: {
          // Ensure external dependencies (like axios, uuid) are not bundled
          external: ['axios', 'uuid'],
          output: {
            globals: {
              axios: 'axios',
              uuid: 'uuid',
            },
          },
        },
      },
    };
  }
});
