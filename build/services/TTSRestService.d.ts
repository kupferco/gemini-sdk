import { default as TTSService } from './TTSService';
export default TTSRestService;
declare class TTSRestService extends TTSService {
    fetchAndPlayText(text: any): Promise<void>;
}
