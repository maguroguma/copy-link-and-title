export interface PageInfo {
  title: string;
  url: string;
}

export interface CopyResult {
  success: boolean;
  markdownText?: string;
  error?: string;
}

export type MessageType =
  | "COPY_LINK_AND_TITLE"
  | "GET_PAGE_INFO"
  | "COPY_TO_CLIPBOARD";

// background <-> content 間のメッセージ形式
export interface ChromeMessage {
  type: MessageType;
  payload?: unknown;
}
