const Sequelize = require('sequelize');
const db = require('./db_config');

const Product = db.define('product', {
    id_product: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    },
    price: {
        type: Sequelize.DOUBLE
    },
    description: {
        type: Sequelize.STRING
    }},
    {
        underscored: true,
        freezeTableName: true,
        tableName: 'product',
    });

// Product.sync()

module.exports = Product