import { ChatPage } from './chat-page';
import { PlayerStateMessage } from './types/youtube-player';

export class NativeChatPage extends ChatPage {
    private static openExternalChat(): void {
        const popup = window.open(
            window.location.href,
            '_blank',
            'popup,location=no'
        );
        if (!popup) throw new Error('Could not open chat popup');
    }

    public override run(): void {
        this.addExternalChatButton();
        this.broadcastParentVideoPlayerState();
        this.broadcastParentVideoWindowClosed();
    }

    private addExternalChatButton(): void {
        const menuButton = document.querySelector<HTMLElement>(
            'yt-live-chat-button'
        );
        if (!menuButton) {
            throw new Error('Could not find chat menu button element');
        }

        const popoutButton = document.createElement('button');
        popoutButton.className = 'yt-external-chat-button';
        popoutButton.addEventListener('click', NativeChatPage.openExternalChat);
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

    private broadcastParentVideoPlayerState(): void {
        window.addEventListener(
            'message',
            (message: MessageEvent<PlayerStateMessage>) => {
                this.channel.postMessage(this.chatParameters, message.data);
            }
        );
    }

    private broadcastParentVideoWindowClosed(): void {
        window.addEventListener('pagehide', () => {
            this.channel.postMessage(this.chatParameters, { event: 'close' });
        });
    }
}
