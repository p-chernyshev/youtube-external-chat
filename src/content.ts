import { DEFAULT_SETTINGS } from './default-settings';
import { NativeChatPage } from './native-chat-page';
import { ExternalChatPage } from './external-chat-page';
import { isIframe } from './utils';
import { ChatPage } from './chat-page';

// TODO Settings interface
const settings = DEFAULT_SETTINGS;
const page: ChatPage = isIframe(window)
    ? new NativeChatPage(settings)
    : new ExternalChatPage(settings);
page.run();
