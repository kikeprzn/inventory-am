const {BrowserWindow} = require('electron');
const db = require('./database/db_config');

const Provider = require('./controllers/provider.controller');
const Equipment = require('./controllers/equipment.controller');
const Maintenance = require('./controllers/maintenance.controller');
const main = require('electron-reload');

async function test_db(){
  await db.connection.authenticate().then(() => {
    console.log('Connection has been established successfully!');
  }).catch((error) => {
      console.log('Connection has been established successfully.');
  })

  await db.connection.sync({ force:false});

}

let window 

function createWindow() {
    
    test_db()
    window = new BrowserWindow({
      icon:__dirname + '/ui/img/Anahuac.png',
      width: 1000,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        // devTools: false
      },
    });
    // window.removeMenu() 
    window.loadFile("src/ui/index.html");
  }
module.exports = {
    createWindow,
    Provider,
    Equipment,
    Maintenance,
}