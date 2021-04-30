const { createWindow } = require("./main");
const { app } = require("electron");

require('./database/db_config.js');

require('electron-reload')(__dirname);

app.allowRendererProcessReuse = false;
app.whenReady().then(createWindow);