import {
    app,
    BrowserWindow,
    protocol,
    shell,
    Menu,
    screen,
    Tray,
    dialog,
    ipcMain
} from "electron";
import path from "path";
import Datastore from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

(() => {
    "我所遗失的心啊";

    "我曾做过的梦啊";

    "随风飘散 被什么人 丢到哪里";

    "我所追求的生活";

    "我曾努力过的那些事";

    "都是笑话 不值一提 该放弃";

    require('@electron/remote/main').initialize()
})();

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */

if (process.env.NODE_ENV !== "development") {
    global.__static = path.join(__dirname, "/static").replace(/\\/g, "\\\\");
}

global.STATIC = __static
global.STORE_PATH = app.getPath("userData");
const STORE_PATH = global.STORE_PATH;

const winURL =
    process.env.NODE_ENV === "development"
        ? `http://localhost:9080`
        : `file://${__dirname}/index.html`;

let loginWindow, mainWindow;
var isLoggingin = false;

global.loadMainWindow = function () {
    isLoggingin = true;
    loginWindow.destroy();
    //start main window
    let winSize = glodb.get('winSize').value()
    if (!winSize) {
        const size = screen.getPrimaryDisplay().size;
        winSize = {
            height: size.height - 200,
            width: size.width - 300,
            max: false
        }
        if (winSize.width > 1440)
            winSize.width = 1440;
    }
    mainWindow = new BrowserWindow({
        height: winSize.height,
        width: winSize.width,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            webSecurity: false,
            contextIsolation: false
        },
        icon: path.join(__static, "/512x512.png"),
    });

    if (winSize.max)
        mainWindow.maximize()

    if (process.env.NODE_ENV === "development")
        mainWindow.webContents.session.loadExtension(
            "/usr/lib/node_modules/vue-devtools/vender/"
        );

    if (!process.env.NYA)
        mainWindow.on("close", (e) => {
            e.preventDefault();
            mainWindow.hide();
        });

    mainWindow.loadURL(winURL + "#/main");
    mainWindow.webContents.setVisualZoomLevelLimits(1, 3);

    global.tray = new Tray(path.join(__static, "/256x256.png"));
    isLoggingin = false;
};

app.on("ready", () => {
    const isFirstInstance = app.requestSingleInstanceLock();
    if (!isFirstInstance) app.quit();
    else {
        require('./ipc/ipcBot')
        require('./ipc/openImage')
        app.allowRendererProcessReuse = false;
        if (process.windowsStore) app.setAppUserModelId("com.clansty.electronqq");
        else if (process.platform === "win32") app.setAppUserModelId("Electron QQ");
        const adapter = new FileSync(path.join(STORE_PATH, "/data.json"));
        global.glodb = Datastore(adapter);
        if (process.env.NODE_ENV === "development")
            protocol.registerFileProtocol("file", (request, cb) => {
                const pathname = request.url.replace("file:///", "");
                cb(pathname);
            });
        Menu.setApplicationMenu(new Menu());
        if (process.env.NYA) {
            //ui debug mode
            global.bot = {
                on() {
                },
                logout() {
                },
            };
            global.loadMainWindow();
        }
        else {
            //login window
            loginWindow = new BrowserWindow({
                height: 720,
                width: 450,
                maximizable: false,
                webPreferences: {
                    nodeIntegration: true,
                    enableRemoteModule: true,
                    contextIsolation: false
                },
                icon: path.join(__static, "/512x512.png"),
            });

            // if (process.env.NODE_ENV === 'development')
            // 	loginWindow.webContents.session.loadExtension('/usr/lib/node_modules/vue-devtools/vender/')

            loginWindow.loadURL(winURL + "#/login");
        }
    }
});

app.on("window-all-closed", () => {
    if (isLoggingin) return;
    if (global.bot) global.bot.logout();
    setTimeout(() => {
        app.quit();
    }, 1000);
});

app.on("web-contents-created", (e, webContents) => {
    webContents.on("new-window", (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });
});

app.on("second-instance", () => {
    if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
    }
    else if (loginWindow) {
        loginWindow.show();
        loginWindow.focus();
    }
});

app.on('before-quit', () => {
    if (mainWindow) mainWindow.destroy()
    if (global.bot) global.bot.logout();
})

app.on('will-quit', () => {
    if (mainWindow) mainWindow.destroy()
    if (global.bot) global.bot.logout();
})


/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
