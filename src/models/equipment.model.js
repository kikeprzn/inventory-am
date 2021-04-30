
module.exports = (sequelize, DataType) =>{

    const Equipment = sequelize.define('equipment', {
        id_equipment: {
            type: DataType.INTEGER,
            allowNull: false,
            autoIncrement: false,
            primaryKey: true,
        },
        serial_number: {
            type: DataType.STRING,
            allowNull: true, 
            unique: { 
                args: true,
                msg: 'Serial number already in use!'
            }
        },
        name: {
            type: DataType.STRING
        },
        model: {
            type: DataType.STRING
        },
        brand: {
            type: DataType.STRING
        },
        type: {
            type: DataType.STRING
        },
        category: {
            type: DataType.STRING
        },
        features: {
            type: DataType.STRING
        },
        stock: {
            type: DataType.INTEGER,
            defaultValue: '0'
        },
        status:{
            type: DataType.STRING
        },
        status_description:{
            type: DataType.STRING,
            allowNull: true
        },
        laboratory:{
            type: DataType.STRING
        },
        description_of_the_location:{
            type: DataType.STRING
        },
        number_of_occupants: {
            type: DataType.INTEGER,
            defaultValue: '0'
        },
        image_url: {
            type: DataType.STRING
        },
        provider_id:{
            type: DataType.INTEGER
        }
        },
        {
            underscored: true,
            freezeTableName: true,
            tableName: 'equipment',
        });

    Equipment.associate = (models) => {
        Equipment.hasMany(models.Maintenance, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
            foreignKey: 'equipment_id'
        });
        Equipment.belongsTo(models.Provider, {
            foreignKey: 'provider_id',
        })
    }
        return Equipment;
}
