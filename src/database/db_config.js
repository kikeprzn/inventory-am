const {Sequelize, DataTypes} = require('sequelize');

const db = {};

// const db_config = {
//     host: 'localhost',
//     user: 'root',
//     password: '2022CFGing',
//     port: 3306,
//     database: 'inventory_anahuac'
// }
// const db_props = `mysql://${db_config.user}:${db_config.password}@${db_config.host}:${db_config.port}/${db_config.database}`;
const db_props = "sqlite::./database:";

db.connection = new Sequelize({dialect: 'sqlite', storage: './database.sqlite'})

const Provider = require('../models/provider.model')(db.connection, DataTypes);
const Equipment = require('../models/equipment.model')(db.connection, DataTypes);
const Maintenance = require('../models/maintenance.model')(db.connection, DataTypes);

db.Provider = Provider;
db.Maintenance = Maintenance;
db.Equipment = Equipment;


db.Provider.associate(db);
db.Equipment.associate(db);
db.Maintenance.associate(db);

module.exports = db;



