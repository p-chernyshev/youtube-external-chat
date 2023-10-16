import { ChatPage } from './chat-page';
import { ChatParameters } from './types/chat-parameters';
import {
    ChannelMessageData,
    isPlayerStateMessage,
    isWindowStateMessage,
} from './types/channel-message';

export class ExternalChatPage extends ChatPage {
    public override run(): void {
        this.channel.receiveMessages((messageParameters, message, origin) => {
            if (this.settings.syncToNewWindow) {
                this.syncToNewWindowWithSameVideo(messageParameters);
            }
            if (!this.messageFromSameChat(messageParameters)) return;
            this.updateUnsetParameters(messageParameters);
            if (this.settings.closeWithParentWindow) {
                this.closeWindowWhenClosingOriginalVideo(message);
            }
            this.replicatePlayerState(message, origin);
        });
    }

    private syncToNewWindowWithSameVideo(parameters: ChatParameters): void {
        if (
            this.chatParameters.video === parameters.video &&
            this.chatParameters.href !== parameters.href &&
            parameters.openedAt > this.chatParameters.openedAt
        ) {
            this.chatParameters.href = parameters.href;
            this.chatParameters.openedAt = parameters.openedAt;
        }
    }

    private messageFromSameChat(messageParameters: ChatParameters): boolean {
        return this.chatParameters.href === messageParameters.href;
    }

    private updateUnsetParameters(messageParameters: ChatParameters): void {
        if (this.chatParameters.video === null) {
            this.chatParameters.video = messageParameters.video;
        }
    }

    private closeWindowWhenClosingOriginalVideo(
        message: ChannelMessageData
    ): void {
        if (isWindowStateMessage(message)) window.close();
    }

    private replicatePlayerState(
        message: ChannelMessageData,
        origin: string
    ): void {
        if (isPlayerStateMessage(message)) window.postMessage(message, origin);
    }
}
