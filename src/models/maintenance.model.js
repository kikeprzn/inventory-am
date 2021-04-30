
module.exports = (sequelize, DataType) =>{
    const Maintenance = sequelize.define('maintenance', {
        id_maintenance: {
            type: DataType.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        maintenance_date: {
            type: DataType.DATEONLY
        },
        maintenance_time: {
            type: DataType.TIME(4)
        },
        observations: {
            type: DataType.STRING
        },
        in_charge: {
            type: DataType.STRING
        },
        type_of_service: {
            type: DataType.STRING
        },
        status: {
            type: DataType.STRING,
            defaultValue: 'to_do'
        },
        cost:{
            type: DataType.FLOAT
        },
        discount:{
            type: DataType.FLOAT
        },
        provider_id:{
            type: DataType.INTEGER
        },
        equipment_id:{
            type: DataType.INTEGER
        }},
        {
            underscored: true,
            freezeTableName: true,
            tableName: 'maintenance',
        });
    
    Maintenance.associate = (models) => {
        Maintenance.belongsTo(models.Provider, {
            foreignKey: 'provider_id'
        });
        Maintenance.belongsTo(models.Equipment, {
            foreignKey: 'equipment_id',
        })
    }
    
    return Maintenance;
}
