import type { PageInfo, CopyResult } from "./types";

export function formatToMarkdownLink(pageInfo: PageInfo): string {
  const { title, url } = pageInfo;

  const sanitizedTitle = title.trim() || "Untitled";

  return `[${sanitizedTitle}](${url})`;
}

export function getPageInfo(): PageInfo {
  return {
    title: document.title,
    url: window.location.href,
  };
}

export async function copyToClipboard(text: string): Promise<CopyResult> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return {
        success: true,
        markdownText: text,
      };
    } else {
      return {
        success: false,
        error: "Clipboard API is not available",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function copyLinkAndTitle(): Promise<CopyResult> {
  const pageInfo = getPageInfo();
  const markdownText = formatToMarkdownLink(pageInfo);

  return await copyToClipboard(markdownText);
}
