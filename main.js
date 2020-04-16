const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

//SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//Listen to the app to be ready
app.on('ready', () => {
  //create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });

  //load the HTML into the window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true,
  }));

  //quit app when close
  mainWindow.on('closed', () => {
    app.quit();
  });

  //build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  //insert the menu
  Menu.setApplicationMenu(mainMenu);

});

//Handle create add window
function createAddWindow() {

  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    webPreferences: {
      nodeIntegration: true
    }
  });

  //load the HTML into the window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true,
  }));

  //Garbage collection handle
  //Limpar essa janela da memória
  addWindow.on('close', () => {
    addWindow = null;
  });

}

//Catch item:add
ipcMain.on('item:add', (event, item) => {
  // console.log(item);
  mainWindow.webContents.send('item:add', item); //o que é esse webcontent?
  addWindow.close();

})


//Create Menu Template
//Menu in electron is an array of objects
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        click() {
          createAddWindow();
        },
      },
      {
        label: 'Clear Items',
        click() {
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click() {
          app.quit();
        },
      },
    ],
  }
];

//If mac add empty object to the menu
if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({});
}

//Add Developer Tools Item if not in production
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Dev Tools',
    submenu: [
      {
        label: 'Toggle Dev Tools',
        accelerator: 'CmdOrCtrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload',
      },
    ],
  });
}