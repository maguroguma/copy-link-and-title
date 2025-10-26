import type { ChromeMessage, PageInfo } from "./types";
import { getPageInfo, copyLinkAndTitle } from "./utils";

// Content Script
// 各 Web ページに注入されて動く「実行部隊」

// 登録するコールバック関数は、非同期処理の場合は true を返す
chrome.runtime.onMessage.addListener(
  (
    message: ChromeMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ): boolean | void => {
    switch (message.type) {
      case "GET_PAGE_INFO":
        handleGetPageInfo(sendResponse);
        return true;

      case "COPY_LINK_AND_TITLE":
        handleCopyLinkAndTitle(sendResponse);
        return true;

      default:
        sendResponse({ error: "Unknown message type" });
        return false;
    }
  },
);

function handleGetPageInfo(sendResponse: (response: PageInfo) => void): void {
  const pageInfo = getPageInfo();
  sendResponse(pageInfo);
}

async function handleCopyLinkAndTitle(
  sendResponse: (response: unknown) => void,
): Promise<void> {
  try {
    const result = await copyLinkAndTitle();
    sendResponse(result);
  } catch (error) {
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
