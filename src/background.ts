import type { ChromeMessage, CopyResult, PageInfo } from "./types";
import { formatToMarkdownLink } from "./utils";

// Service Worker
// ブラウザレベルで動作するコード
// イベント処理の中心となる
// 拡張機能のバックグラウンドで動く「司令塔」

const CONTEXT_MENU_ID = "copy-link-and-title";

chrome.runtime.onInstalled.addListener((): void => {
  createContextMenu();
});

chrome.action.onClicked.addListener(
  async (tab: chrome.tabs.Tab): Promise<void> => {
    await handleCopyAction(tab);
  },
);

chrome.contextMenus.onClicked.addListener(
  async (
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab,
  ): Promise<void> => {
    if (info.menuItemId === CONTEXT_MENU_ID && tab) {
      await handleCopyAction(tab);
    }
  },
);

function createContextMenu(): void {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Copy Link and Title",
    contexts: ["page"],
  });
}

async function handleCopyAction(tab: chrome.tabs.Tab): Promise<void> {
  if (!tab.id || !tab.url || tab.url.startsWith("chrome://")) {
    showNotification("エラー", "このページでは拡張機能を使用できません");
    return;
  }

  try {
    const pageInfo = await getPageInfoFromTab(tab);
    const markdownText = formatToMarkdownLink(pageInfo);

    const copyResult = await copyToClipboardViaContentScript(
      tab.id,
      markdownText,
    );

    if (copyResult.success) {
      showNotification(
        "コピー完了",
        `Markdownリンクをクリップボードにコピーしました: ${markdownText}`,
      );
    } else {
      showNotification("エラー", copyResult.error || "コピーに失敗しました");
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    showNotification("エラー", `処理中にエラーが発生しました: ${errorMessage}`);
  }
}

// Content Script にメッセージを送信する
// レスポンスはコールバックから受け取る
async function getPageInfoFromTab(tab: chrome.tabs.Tab): Promise<PageInfo> {
  if (!tab.id) {
    throw new Error("Tab ID is not available");
  }

  const message: ChromeMessage = { type: "GET_PAGE_INFO" };

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id!, message, (response: PageInfo) => {
      if (chrome.runtime.lastError) {
        reject(
          new Error(
            chrome.runtime.lastError.message || "Unknown Chrome runtime error",
          ),
        );
      } else {
        resolve(response);
      }
    });
  });
}

async function copyToClipboardViaContentScript(
  tabId: number,
  text: string,
): Promise<CopyResult> {
  const message: ChromeMessage = { type: "COPY_LINK_AND_TITLE" };

  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response: CopyResult) => {
      if (chrome.runtime.lastError) {
        resolve({
          success: false,
          error:
            chrome.runtime.lastError.message || "Unknown Chrome runtime error",
        });
      } else {
        resolve(response);
      }
    });
  });
}

function showNotification(title: string, message: string): void {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon48.png",
    title,
    message,
  });
}
