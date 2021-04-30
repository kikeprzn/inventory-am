module.exports = (sequelize, DataType) =>{

    const Provider = sequelize.define('provider', {
        id_provider: {
            type: DataType.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataType.STRING,
            allowNull: false
        },
        address: {
            type: DataType.STRING
        },
        cellphone: {
            type: DataType.STRING
        },
        email: {
            type: DataType.STRING
        },
        type: {
            type: DataType.STRING
        },
        observations: {
            type: DataType.STRING
        }},
        {
            underscored: true,
            freezeTableName: true,
            tableName: 'provider',
    });

    Provider.associate = (models) => {
        Provider.hasMany(models.Equipment, {
            onDelete: 'SET NULL',
            onUpdate: 'cascade',
            foreignKey: 'provider_id',
        });
        Provider.hasMany(models.Maintenance, {
            onDelete: 'SET NULL',
            onUpdate: 'cascade',
            foreignKey: 'provider_id',
        });
    }

    return Provider;
}
