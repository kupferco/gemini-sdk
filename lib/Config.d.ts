declare const _default: Config;
export default _default;
declare class Config {
    apiBaseUrl: any;
    endpoints: {
        prompt: string;
        stt: string;
        tts: string;
        gemini: string;
        geminiHistory: string;
        voice: string;
    };
    setApiBaseUrl(baseUrl: any): void;
    getApiBaseUrl(): any;
    getEndpoint(serviceName: any): string;
}
