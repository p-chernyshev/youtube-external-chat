import { ChatParameters } from './types/chat-parameters';
import { ChannelMessage, ChannelMessageData } from './types/channel-message';

export class ChatMessagesChannel {
    private readonly channel = new BroadcastChannel('youtube-player-state');

    public postMessage(
        parameters: ChatParameters,
        message: ChannelMessageData
    ): void {
        const channelMessage: ChannelMessage = {
            parameters,
            message,
        };
        this.channel.postMessage(channelMessage);
    }

    public receiveMessages(
        handler: (
            parameters: ChatParameters,
            message: ChannelMessageData,
            origin: MessageEvent['origin']
        ) => void
    ): void {
        this.channel.addEventListener(
            'message',
            (messageEvent: MessageEvent<ChannelMessage>) => {
                handler(
                    messageEvent.data.parameters,
                    messageEvent.data.message,
                    messageEvent.origin
                );
            }
        );
    }
}
