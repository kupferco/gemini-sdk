export default ConversationService;
declare class ConversationService {
    static fetchHistory(): Promise<any>;
    static clearHistory(): Promise<void>;
}
