import { ChatParameters } from './types/chat-parameters';
import { Settings } from './types/settings';
import { ChatMessagesChannel } from './chat-messages-channel';

export abstract class ChatPage {
    protected readonly chatParameters = this.initializeChatWindowParameters();
    protected readonly channel = new ChatMessagesChannel();

    public constructor(protected readonly settings: Settings) {}

    private initializeChatWindowParameters(): ChatParameters {
        let video: string | null = null;
        try {
            video = new URLSearchParams(window.parent.location.search).get('v');
        } catch (error) {
            if (!(error instanceof DOMException)) throw error;
        }
        return {
            href: window.location.href,
            video,
            openedAt: Date.now(),
        };
    }

    public abstract run(): void;
}
