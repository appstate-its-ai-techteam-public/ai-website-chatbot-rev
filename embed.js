// --- Configuration & Initialization ---

// Replace with your token endpoint
const tokenEndpoint = "https://default0f1fb691239348df971c93aa52a956.00.environment.api.powerplatform.com/powervirtualagents/botsbyschema/mm_aiWebsiteAssistantProd/directline/token?api-version=2022-03-01-preview";
let webChatInstance = null;
let directLineUrl = null;

// Style Options (Copied from your HTML)
const styleOptions = {"accent":"#04669d","autoScrollSnapOnPage":true,"autoScrollSnapOnPageOffset":0,"avatarBorderRadius":"7%","avatarSize":31,"backgroundColor":"#e8e9eb","botAvatarBackgroundColor":"#ffffff00","botAvatarImage":"https://appstate-its-ai-techteam-public.github.io/ai-website-chatbot-rev/assets/bot-avatar.png","botAvatarInitials":"A","bubbleAttachmentMaxWidth":480,"bubbleAttachmentMinWidth":250,"bubbleBackground":"#FFFFFF","bubbleBorderColor":"#f5f5f5","bubbleBorderRadius":41,"bubbleBorderStyle":"solid","bubbleBorderWidth":1,"bubbleFromUserBackground":"#F2F2F2","bubbleFromUserBorderColor":"#f5f5f5","bubbleFromUserBorderRadius":41,"bubbleFromUserBorderStyle":"solid","bubbleFromUserBorderWidth":1,"bubbleFromUserNubOffset":0,"bubbleFromUserNubSize":0,"bubbleFromUserTextColor":"#000000","bubbleImageHeight":10,"bubbleImageMaxHeight":240,"bubbleImageMinHeight":240,"bubbleMessageMaxWidth":480,"bubbleMessageMinWidth":120,"bubbleMinHeight":50,"bubbleNubOffset":0,"bubbleTextColor":"#000000","emojiSet":true,"fontSizeSmall":"70%","hideUploadButton":true,"messageActivityWordBreak":"break-word","monospaceFont":"Consolas","paddingRegular":10,"paddingWide":10,"primaryColor":"#ffcc00","primaryFont":null,"sendBoxBackground":"#e8e9eb","sendBoxBorderTop":"solid 1px #808080","sendBoxButtonColor":"#0078d4","sendBoxButtonColorOnHover":"#006cbe","sendBoxButtonShadeBorderRadius":40,"sendBoxButtonShadeColorOnHover":"","sendBoxHeight":60,"sendBoxPlaceholderColor":"#171616","sendBoxTextColor":"#2e2d2d","showAvatarInGroup":"status","spinnerAnimationHeight":16,"spinnerAnimationPadding":12,"spinnerAnimationWidth":16,"subtleColor":"#000000FF","suggestedActionBackgroundColor":"#FFCC00","suggestedActionBackgroundColorOnHover":"#FFCC00","suggestedActionBorderColor":"","suggestedActionBorderRadius":10,"suggestedActionBorderWidth":0,"suggestedActionLayout":"flow","suggestedActionTextColor":"#000000","typingAnimationBackgroundImage":"url('https://appstate-its-ai-techteam-public.github.io/ai-website-chatbot-rev/assets/loading.gif')","typingAnimationDuration":5000,"typingAnimationHeight":30,"typingAnimationWidth":30,"userAvatarBackgroundColor":"#ffffff00","userAvatarImage":"https://appstate-its-ai-techteam-public.github.io/ai-website-chatbot-rev/assets/user-avatar.png","userAvatarInitials":"U"};
const backgroundImage = "";

const environmentEndPoint = tokenEndpoint.slice(
  0,
  tokenEndpoint.indexOf("/powervirtualagents")
);
const apiVersion = tokenEndpoint
  .slice(tokenEndpoint.indexOf("api-version"))
  .split("=")[1];
const regionalChannelSettingsURL = `${environmentEndPoint}/powervirtualagents/regionalchannelsettings?api-version=${apiVersion}`;


// --- Helper Functions ---

function createGradient(baseColor) {
  const r = parseInt(baseColor.slice(1,3), 16);
  const g = parseInt(baseColor.slice(3,5), 16);
  const b = parseInt(baseColor.slice(5,7), 16);
  const lighterColor = `#${Math.min(255, r+30).toString(16).padStart(2,'0')}${Math.min(255, g+30).toString(16).padStart(2,'0')}${Math.min(255, b+30).toString(16).padStart(2,'0')}`;
  const darkerColor = `#${Math.max(0, r-30).toString(16).padStart(2,'0')}${Math.max(0, g-30).toString(16).padStart(2,'0')}${Math.max(0, b-30).toString(16).padStart(2,'0')}`;
  return `linear-gradient(135deg, ${lighterColor}, ${baseColor}, ${darkerColor})`;
}

function showChat() {
  const popup = document.getElementById("chatbot-popup");
  const openButton = document.getElementById("open-chat");
  if (popup && openButton) {
    popup.classList.add("visible");
    openButton.classList.add("hidden");
  }
}

function hideChat() {
  const popup = document.getElementById("chatbot-popup");
  const openButton = document.getElementById("open-chat");
  if (popup && openButton) {
    popup.classList.remove("visible");
    openButton.classList.remove("hidden");
  }
}

function createCustomStore() {
  return window.WebChat.createStore(
    {},
    ({ dispatch }) =>
      (next) =>
      (action) => {
        if (action.type === "DIRECT_LINE/CONNECT_FULFILLED") {
          dispatch({
            type: "DIRECT_LINE/POST_ACTIVITY",
            meta: { method: "keyboard" },
            payload: {
              activity: {
                channelData: { postBack: true },
                name: "startConversation",
                type: "event",
              },
            },
          });
        }
        return next(action);
      }
  );
}

async function restartConversation() {
  try {
    if (!directLineUrl) {
      console.error("DirectLine URL not initialized");
      return;
    }
    const response = await fetch(tokenEndpoint);
    const conversationInfo = await response.json();
    if (!conversationInfo.token) {
      throw new Error("Failed to get conversation token");
    }
    const newDirectLine = window.WebChat.createDirectLine({
      domain: `${directLineUrl}v3/directline`,
      token: conversationInfo.token,
    });
    const webchatElement = document.getElementById("webchat");
    if (webchatElement && window.WebChat) {
        webChatInstance = window.WebChat.renderWebChat(
            {
                directLine: newDirectLine,
                styleOptions,
                store: createCustomStore(),
            },
            webchatElement
        );
    }
  } catch (err) {
    console.error("Failed to restart conversation:", err);
  }
}

async function initializeChat() {
  try {
    const response = await fetch(regionalChannelSettingsURL);
    const data = await response.json();
    directLineUrl = data.channelUrlsById.directline;
    if (!directLineUrl) {
      throw new Error("Failed to get DirectLine URL");
    }
    const conversationResponse = await fetch(tokenEndpoint);
    const conversationInfo = await conversationResponse.json();
    if (!conversationInfo.token) {
      throw new Error("Failed to get conversation token");
    }
    const directLine = window.WebChat.createDirectLine({
      domain: `${directLineUrl}v3/directline`,
      token: conversationInfo.token,
    });
    const webchatElement = document.getElementById("webchat");
    if (webchatElement && window.WebChat) {
        webChatInstance = window.WebChat.renderWebChat(
            {
                directLine,
                styleOptions,
                store: createCustomStore(),
            },
            webchatElement
        );
    }
  } catch (err) {
    console.error("Failed to initialize chat:", err);
  }
}

// --- DOM Injection Function ---

function injectChatbot() {
    // Inject the Bot Framework Web Chat script
    const webchatScript = document.createElement('script');
    webchatScript.src = "https://cdn.botframework.com/botframework-webchat/latest/webchat.js";
    webchatScript.onload = () => {
        // Once the Web Chat library is loaded, proceed with initialization
        initializeChat();
    };
    document.head.appendChild(webchatScript);

    // Create a style element and append all the CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = `
    :root {
      --chat-width: 450px;
      --chat-height: 520px;
      --header-height: 56px;
      --border-radius: 16px;
      --transition-speed: 0.3s;
    }
    #chatbot-popup * {
        box-sizing: border-box;
    }
    #chatbot-popup {
      display: none;
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: var(--chat-width);
      height: var(--chat-height);
      background: white;
      border-radius: var(--border-radius);
      box-shadow: 0 18px 40px -5px rgba(0, 0, 0, 0.2),
        0 15px 20px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      opacity: 0;
      transform-origin: bottom right;
      transform: scale(0.95);
      transition: all var(--transition-speed) ease-in-out;
      z-index: 99999; /* Higher z-index for visibility */
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #chatbot-popup.visible {
      display: block;
      opacity: 1;
      transform: scale(1);
    }
    #chatbot-header {
      background: var(--primary-color-gradient);
      padding: 16px 20px;
      height: var(--header-height);
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--header-textColor);
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 500;
    }
    .header-buttons {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .icon-button {
      background: none;
      border: none;
      color: var(--header-textColor);
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .icon-button:hover {
      color: var(--header-textColor);
      background: rgba(255, 255, 255, 0.1);
    }
    .icon-button:focus {
      outline: 2px solid rgba(255, 255, 255, 0.5);
      outline-offset: 2px;
    }
    #webchat {
      height: calc(100% - var(--header-height));
      background-color: #f9fafb;
      position: relative;
    }
    .webchat-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.85);
      pointer-events: none;
      z-index: 1;
    }
    #webchat > div {
      position: relative;
      z-index: 2;
    }
    #webchat .webchat__basic-transcript__content {
      white-space: pre-wrap !important;
      word-break: break-word !important;
    }
    #webchat .webchat__bubble__content {
      padding: 8px 12px !important;
    }
    #webchat .webchat__bubble {
      max-width: 85% !important;
      margin: 8px !important;
    }
    #webchat .webchat__basic-transcript__content ul,
    #webchat .webchat__basic-transcript__content ol,
    #webchat .webchat__bubble__content ul,
    #webchat .webchat__bubble__content ol {
      padding-left: 24px !important;
      margin: 8px 0 !important;
      list-style-position: outside !important;
    }
    #webchat .webchat__basic-transcript__content li,
    #webchat .webchat__bubble__content li {
      margin: 4px 0 !important;
      padding-left: 4px !important;
    }
    #open-chat {
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--primary-color-gradient);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all var(--transition-speed) ease-in-out;
      z-index: 99998; /* Lower z-index than popup */
    }
    #open-chat.hidden {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
      pointer-events: none;
    }
    #open-chat:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    #open-chat:focus {
      outline: 3px solid rgba(79, 70, 229, 0.5);
      outline-offset: 2px;
    }
    #open-chat svg {
      width: 28px;
      height: 28px;
      color: black;
      transition: transform 0.2s ease;
    }
    @media (max-width: 768px) {
      #chatbot-popup {
        width: 100%;
        height: 100%;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }
    }
    `;
    document.head.appendChild(styleElement);

    // Create the chatbot popup HTML structure
    const chatPopupHtml = `
      <div id="chatbot-popup" role="complementary" aria-label="Chat Assistant">
        <div id="chatbot-header">
          <div class="header-title">
            <svg
              class="chat-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              ></path>
            </svg>
            <span>AI Website Assistant</span>
          </div>
          <div class="header-buttons">
            <button
              class="icon-button"
              id="restart-button"
              aria-label="Restart Conversation"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path
                  d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                ></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </button>
            <button
              class="icon-button"
              id="close-button"
              aria-label="Close Chat"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div id="webchat" role="main"></div>
      </div>
      <button
        id="open-chat"
        aria-label="Open Chat Assistant"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          ></path>
        </svg>
      </button>
    `;

    const chatContainer = document.createElement('div');
    chatContainer.innerHTML = chatPopupHtml;

    // Append the elements to the body
    while (chatContainer.firstChild) {
        document.body.appendChild(chatContainer.firstChild);
    }
    
    // Set dynamic styles and attach event listeners after elements are in DOM
    const root = document.documentElement;
    root.style.setProperty('--primary-color-gradient', createGradient(styleOptions.primaryColor));
    root.style.setProperty('--header-textColor', styleOptions.suggestedActionTextColor);
    
    // Attach event listeners using the IDs now that they exist
    document.getElementById("open-chat").onclick = showChat;
    document.getElementById("close-button").onclick = hideChat;
    document.getElementById("restart-button").onclick = restartConversation;

    if (backgroundImage) {
      const webchatElement = document.getElementById('webchat');
      webchatElement.style.backgroundImage = `url(${backgroundImage})`;
      webchatElement.style.backgroundSize = 'cover';
      webchatElement.style.backgroundPosition = 'center';
      webchatElement.style.backgroundRepeat = 'no-repeat';
      const overlay = document.createElement('div');
      overlay.className = 'webchat-overlay';
      webchatElement.appendChild(overlay);
    }
}

// Ensure the injection runs only after the full document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChatbot);
} else {
    injectChatbot();
}

// Expose functions globally for debugging/manual control if needed
window.showChatbot = showChat;
window.hideChatbot = hideChat;
window.restartChatbotConversation = restartConversation;