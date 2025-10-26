global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
    onInstalled: {
      addListener: jest.fn(),
    },
    lastError: null,
    sendMessage: jest.fn(),
  },
  action: {
    onClicked: {
      addListener: jest.fn(),
    },
  },
  contextMenus: {
    create: jest.fn(),
    onClicked: {
      addListener: jest.fn(),
    },
  },
  tabs: {
    sendMessage: jest.fn(),
  },
  notifications: {
    create: jest.fn(),
  },
};

Object.defineProperty(window, "chrome", {
  value: global.chrome,
  writable: true,
});

