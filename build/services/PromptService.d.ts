declare const _default: PromptService;
export default _default;
declare class PromptService {
    getPrompt(sessionId: any): Promise<any>;
    setPrompt(sessionId: any, newPrompt: any): Promise<void>;
}
