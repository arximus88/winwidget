const { app, BrowserWindow, Tray, Menu } = require("electron");
const path = require("path");

let tray = null;
let widgetWindows = {};

const widgetDefinitions = {
  clock: {
    name: "Clock",
    width: 200,
    height: 100,
    file: "clock.html",
  },
  "clock-simple": {
    name: "Clock Simple",
    width: 200,
    height: 100,
    file: "clock-simple.html",
  },
  // Add more widget definitions here
};

function createTray() {
  tray = new Tray(path.join(__dirname, "icon.png"));
  const contextMenu = Menu.buildFromTemplate([
    { label: "Widgets", submenu: buildWidgetSubmenu() },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setToolTip("Widget Manager");
  tray.setContextMenu(contextMenu);
}

function buildWidgetSubmenu() {
  return Object.keys(widgetDefinitions).map((widgetKey) => ({
    label: widgetDefinitions[widgetKey].name,
    submenu: [
      {
        label: "Run",
        click: () => createWidgetWindow(widgetKey),
        enabled: !widgetWindows[widgetKey],
      },
      {
        label: "Close",
        click: () => closeWidget(widgetKey),
        enabled: !!widgetWindows[widgetKey],
      },
    ],
  }));
}

function createWidgetWindow(widgetKey) {
  if (widgetWindows[widgetKey]) return;

  const widget = widgetDefinitions[widgetKey];
  const win = new BrowserWindow({
    width: widget.width,
    height: widget.height,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    skipTaskbar: true,
  });

  win.loadFile(widget.file);
  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true);

  widgetWindows[widgetKey] = win;

  win.on("closed", () => {
    delete widgetWindows[widgetKey];
    updateTrayMenu();
  });

  updateTrayMenu();
}

function closeWidget(widgetKey) {
  if (widgetWindows[widgetKey]) {
    widgetWindows[widgetKey].close();
  }
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    { label: "Widgets", submenu: buildWidgetSubmenu() },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  createTray();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
