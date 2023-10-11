const channel = new BroadcastChannel('youtube-player-state');
if (isIframe(window)) {
    addExternalChatButton();
    window.addEventListener('message', (message) => {
        channel.postMessage(message.data);
    });
} else {
    channel.addEventListener('message', (message) => {
        window.postMessage(message.data, message.origin);
    });
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
