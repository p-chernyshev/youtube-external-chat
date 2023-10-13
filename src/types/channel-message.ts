import { ChatParameters } from './chat-parameters';
import { PlayerStateMessage } from './youtube-player';

interface ChannelMessage<T extends ChannelMessageData = ChannelMessageData> {
    parameters: ChatParameters;
    message: T;
}
type ChannelMessageData = PlayerStateMessage | WindowStateMessage;
interface WindowStateMessage {
    event: 'close';
}
function isPlayerStateMessage(
    message: ChannelMessageData
): message is PlayerStateMessage {
    return !isWindowStateMessage(message);
}
function isWindowStateMessage(
    message: ChannelMessageData
): message is WindowStateMessage {
    return 'event' in message;
}

export {
    ChannelMessage,
    ChannelMessageData,
    WindowStateMessage,
    isPlayerStateMessage,
    isWindowStateMessage,
};
