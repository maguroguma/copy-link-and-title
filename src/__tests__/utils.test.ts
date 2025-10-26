import { formatToMarkdownLink, getPageInfo, copyToClipboard } from "../utils";
import type { PageInfo } from "../types";

describe("formatToMarkdownLink", () => {
  test("通常のタイトルとURLで正しいMarkdown形式が生成される", () => {
    const pageInfo: PageInfo = {
      title: "Example Page",
      url: "https://example.com",
    };

    const result = formatToMarkdownLink(pageInfo);
    expect(result).toBe("[Example Page](https://example.com)");
  });

  test('空文字のタイトルは"Untitled"に置換される', () => {
    const pageInfo: PageInfo = {
      title: "",
      url: "https://example.com",
    };

    const result = formatToMarkdownLink(pageInfo);
    expect(result).toBe("[Untitled](https://example.com)");
  });

  test("前後に空白があるタイトルはトリムされる", () => {
    const pageInfo: PageInfo = {
      title: "  Example Page  ",
      url: "https://example.com",
    };

    const result = formatToMarkdownLink(pageInfo);
    expect(result).toBe("[Example Page](https://example.com)");
  });

  test("特殊文字を含むタイトルとURLが正しく処理される", () => {
    const pageInfo: PageInfo = {
      title: "Test [Brackets] & Special Characters",
      url: "https://example.com/path?param=value&other=123",
    };

    const result = formatToMarkdownLink(pageInfo);
    expect(result).toBe(
      "[Test [Brackets] & Special Characters](https://example.com/path?param=value&other=123)",
    );
  });
});

describe("getPageInfo", () => {
  beforeEach(() => {
    Object.defineProperty(document, "title", {
      value: "Test Page Title",
      writable: true,
    });

    Object.defineProperty(window, "location", {
      value: {
        href: "https://test.example.com/page",
      },
      writable: true,
    });
  });

  test("ページのタイトルとURLを正しく取得できる", () => {
    const result = getPageInfo();

    expect(result).toEqual({
      title: "Test Page Title",
      url: "https://test.example.com/page",
    });
  });
});

describe("copyToClipboard", () => {
  const mockWriteText = jest.fn();

  beforeEach(() => {
    mockWriteText.mockClear();

    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
    });
  });

  test("正常にクリップボードにコピーできる場合", async () => {
    const testText = "[Test](https://example.com)";
    mockWriteText.mockResolvedValue(undefined);

    const result = await copyToClipboard(testText);

    expect(mockWriteText).toHaveBeenCalledWith(testText);
    expect(result).toEqual({
      success: true,
      markdownText: testText,
    });
  });

  test("クリップボード書き込みでエラーが発生した場合", async () => {
    const testText = "[Test](https://example.com)";
    const errorMessage = "Permission denied";
    mockWriteText.mockRejectedValue(new Error(errorMessage));

    const result = await copyToClipboard(testText);

    expect(result).toEqual({
      success: false,
      error: errorMessage,
    });
  });

  test("Clipboard APIが利用できない場合", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
    });

    const result = await copyToClipboard("[Test](https://example.com)");

    expect(result).toEqual({
      success: false,
      error: "Clipboard API is not available",
    });
  });
});

