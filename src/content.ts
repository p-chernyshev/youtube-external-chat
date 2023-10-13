import {
    ChannelMessage,
    ChannelMessageData,
    WindowStateMessage,
    isPlayerStateMessage,
    isWindowStateMessage,
} from './types/channel-message';
import { ChatParameters } from './types/chat-parameters';
import { PlayerStateMessage } from './types/youtube-player';
import { DEFAULT_SETTINGS } from './default-settings';

const channel = new BroadcastChannel('youtube-player-state');
const chatParameters = initializeChatWindowParameters();
// TODO Settings interface
const settings = DEFAULT_SETTINGS;

if (isIframe(window)) {
    addExternalChatButton();
    broadcastParentVideoPlayerState();
    broadcastParentVideoWindowClosed();
} else {
    receiveMessages((messageParameters, message, origin) => {
        if (settings.syncToNewWindow) {
            syncToNewWindowWithSameVideo(messageParameters);
        }
        if (!messageFromSameChat(messageParameters)) return;
        updateUnsetParameters(messageParameters);
        if (settings.closeWithParentWindow) {
            closeWindowWhenClosingOriginalVideo(message);
        }
        replicatePlayerState(message, origin);
    });
}

function initializeChatWindowParameters(): ChatParameters {
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

function isIframe(window: Window): boolean {
    return !!window.frameElement;
}

function addExternalChatButton(): void {
    const menuButton = document.querySelector<HTMLElement>(
        'yt-live-chat-button'
    );
    if (!menuButton) throw new Error('Could not find chat menu button element');

    const popoutButton = document.createElement('button');
    popoutButton.className = 'yt-external-chat-button';
    popoutButton.addEventListener('click', openChatWindow);
    popoutButton.title = 'Open external chat window';

    const svg = document.createElement('svg');
    popoutButton.appendChild(svg);
    // TODO load file
    svg.outerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="yt-external-chat-button__icon">
            <path
                d="M18 18V20H4A2 2 0 0 1 2 18V8H4V18M22 6V14A2 2 0 0 1 20 16H8A2 2 0 0 1 6 14V6A2 2 0 0 1 8 4H20A2 2 0 0 1 22 6M20 6H8V14H20Z"
                fill="currentColor"
            />
        </svg>
    `;

    menuButton.before(popoutButton);
}

function openChatWindow(): void {
    const popup = window.open(
        window.location.href,
        '_blank',
        'popup,location=no'
    );
    if (!popup) throw new Error('Could not open chat popup');
}

function broadcastParentVideoPlayerState(): void {
    window.addEventListener(
        'message',
        (message: MessageEvent<PlayerStateMessage>) => {
            const channelMessage: ChannelMessage<PlayerStateMessage> = {
                parameters: chatParameters,
                message: message.data,
            };
            channel.postMessage(channelMessage);
        }
    );
}

function broadcastParentVideoWindowClosed(): void {
    window.addEventListener('pagehide', () => {
        const channelMessage: ChannelMessage<WindowStateMessage> = {
            parameters: chatParameters,
            message: {
                event: 'close',
            },
        };
        channel.postMessage(channelMessage);
    });
}

function receiveMessages(
    handler: (
        parameters: ChatParameters,
        message: ChannelMessageData,
        origin: MessageEvent['origin']
    ) => void
): void {
    channel.addEventListener(
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

function syncToNewWindowWithSameVideo(parameters: ChatParameters): void {
    if (
        chatParameters.video === parameters.video &&
        chatParameters.href !== parameters.href &&
        parameters.openedAt > chatParameters.openedAt
    ) {
        chatParameters.href = parameters.href;
        chatParameters.openedAt = parameters.openedAt;
    }
}

function messageFromSameChat(messageParameters: ChatParameters): boolean {
    return chatParameters.href === messageParameters.href;
}

function updateUnsetParameters(messageParameters: ChatParameters): void {
    if (chatParameters.video === null) {
        chatParameters.video = messageParameters.video;
    }
}

function closeWindowWhenClosingOriginalVideo(
    message: ChannelMessageData
): void {
    if (isWindowStateMessage(message)) window.close();
}

function replicatePlayerState(
    message: ChannelMessageData,
    origin: string
): void {
    if (isPlayerStateMessage(message)) window.postMessage(message, origin);
}
