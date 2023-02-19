const { app, BrowserWindow, Menu, dialog, shell, clipboard } = require('electron');
const remoteMain = require('@electron/remote/main');
const path = require('path');

const { StoreTitles } = require('./storage');
const Request = require('./request');
const Parser = require('./parser');
const IPC = require('./ipc');

const debug = false;

let mainWindow = null;

app.requestSingleInstanceLock();
remoteMain.initialize();

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus();
  }
})

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1520,
    height: 780,
    title: 'Tinfoil Wishlist',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  remoteMain.enable(mainWindow.webContents);
  mainWindow.loadFile('index.html');

  const menuTemplate = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload database',
          click: () => {
            mainWindow.webContents.send('update-database');
          },
        },
        { type: 'separator' },
        { role: 'quit' },
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Copy title link',
          accelerator: 'CmdOrCtrl+Shift+C',
          click: async () => {
            const { id } = StoreTitles.current;
            if (!id) return;
            clipboard.writeText(`${ Request.titleUrl }/${ id }`);
          }
        },
        { type: 'separator' },
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' },
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Add/Remove title',
          accelerator: 'CmdOrCtrl+Down',
          click: async () => {
            mainWindow.webContents.send('add-title-wishlist');
          }
        },
        {
          label: 'Next title',
          accelerator: 'Right',
          click: async () => {
            mainWindow.webContents.send('change-title-next');
          }
        },
        {
          label: 'Previuos title',
          accelerator: 'Left',
          click: async () => {
            mainWindow.webContents.send('change-title-previous');
          }
        },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' },
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'GitHub Repo',
          click: async () => {
            await shell.openExternal('https://github.com/fomalssj/tinfoil-wishlist')
          }
        }
      ]
    }
  ]);
  Menu.setApplicationMenu(menuTemplate);

  IPC.init();

  mainWindow.once('ready-to-show', async () => {
    mainWindow.show();

    if (!StoreTitles.ready) {
      const titlesJson = await Request.titles();
      const titlesParse = Parser.titles(titlesJson);
      StoreTitles.put(titlesParse);
    }

    const titles = StoreTitles.limit(100);

    mainWindow.webContents.send('is-ready');
    mainWindow.webContents.send('update-titles', titles);
    mainWindow.webContents.send('update-wishlist');
    mainWindow.webContents.send('loader', false);
  });

  if (debug) {
    mainWindow.webContents.openDevTools();
  }
};

app.on('ready', () => createWindow());
app.on('activate', () => mainWindow === null ? createWindow() : null);
app.on('window-all-closed', () => process.platform !== 'darwin' ?  app.quit() : null);
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

process.on('unhandledRejection', (err) => {
  console.log(err);

  dialog.showErrorBox('Error', err.message);
  mainWindow.webContents.send('loader', false);
});
