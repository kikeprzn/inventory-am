const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const moment = require('moment') 

const { Provider, Equipment, Maintenance} = require("../database/db_config");
const {getPages, paginate} = require("../helper/pagination")

async function createMaintenance(maintenance){
    try {
        const result = await Maintenance.create(maintenance)
        return result;
        
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

async function getMaintenances({page = 0, pageSize = 5, 
    filter = false, order_by = 'id_maintenance', by = 'DESC'}){

    result = {}

    if (!filter){
        filter.name = "";
        filter.provider_id = "";
        filter.date_min = "";
        filter.date_max = "";
        filter.status = "";
        filter.equipment_category = "";
        filter.type_of_service = "";
        filter.status_of_equipment = "";
    }
    let current_date = moment(new Date()).format("YYYY-MM-DD");
    let current_time = moment().format('HH:mm');

    let conditions = {
        maintenance_date: {
            [Op.ne]: null
        },
        filter_by_status: [
            {
                status:{
                    [Op.like]: '%'+filter.status+'%'
                }
            }
        ],
        provider_id: {
            [Op.or] : {
                [Op.like]: '%%',
                [Op.is] : null
            }
        },
    };
    
    if ( filter.provider_id != ""){
        conditions.provider_id = {
            [Op.eq]: filter.provider_id
        }
    } 

    if (filter.date_min != "" && filter.date_max != ""){
        conditions.maintenance_date = {
            [Op.between]: [filter.date_min, filter.date_max]
        }        
    }
    else if(filter.date_min != "" && filter.date_max == ""){
        conditions.maintenance_date = {
            [Op.gte]: filter.date_min                         
        }
    }
    else if(filter.date_min == "" && filter.date_max != ""){
        conditions.maintenance_date = {
            [Op.lte]: filter.date_max                         
        }  
    }
    
    if (filter.status == "expired"){
        conditions.filter_by_status = [
            {
                maintenance_date:{
                    [Op.lt]: current_date
                },
                status : {
                    [Op.ne]: "done"
                }
            },
            {
                maintenance_date:{
                    [Op.eq]: current_date
                },
                maintenance_time: {
                    [Op.lt]: current_time
                },
            }
        ]
    }  
    if(filter.status == "to_do"){
        conditions.filter_by_status = [
            {
                maintenance_date:{
                    [Op.gt]: current_date
                }, 
                status : {
                    [Op.ne]: "done"
                }
            },
            {
                maintenance_date:{
                    [Op.eq]: current_date
                },
                maintenance_time: {
                    [Op.gt]: current_time
                },
                status : {
                    [Op.ne]: "done"
                }
            }

        ]
    }

    let paginate_result = paginate({page, pageSize})

    const {count, rows} = await Maintenance.findAndCountAll(
        Object.assign(
            {
                raw: true,
                where: {
                    provider_id: conditions.provider_id,
                    [Op.or]: conditions.filter_by_status,
                    maintenance_date: conditions.maintenance_date,
                    type_of_service:{
                        [Op.like]: '%'+filter.type_of_service+'%'
                    },

                },
                order: [[
                    [order_by, by],
                ]],
                include: [
                    {
                        model: Equipment,
                        where: {
                            name: {
                                [Op.like]: '%' +filter.name+'%'
                            },
                            status:{
                                [Op.like]: '%' +filter.status_of_equipment+'%'
                            },
                            category:{
                                [Op.like]: '%' +filter.equipment_category+'%'
                            },
                        }
                    
                    },
                    {
                         model: Provider
                    }
                ],   
            },
            paginate_result
        )
    );
    result.count = count;
    result.data = rows;
    result.total_pages = Math.ceil(result.count / 5);
    result.pages = await getPages(result.total_pages, page + 1); 

    return result;
    
}

async function getMaintenancesForCalculation({filter = false}){

    result = {}
    
    if (!filter){
        filter.name = "";
        filter.provider_id = "";
        filter.date_min = "";
        filter.date_max = "";
        filter.equipment_category = "";
        filter.status_of_equipment = "";
        filter.type_of_service = "";
    }

    let conditions = {
        maintenance_date: {
            [Op.ne]: null
        },
        provider_id: {
            [Op.or] : {
                [Op.like]: '%%',
                [Op.is] : null
            }
            
        },
    };

    if ( filter.provider_id != ""){
        conditions.provider_id = {
            [Op.eq]: filter.provider_id
        }
    } 

    if (filter.date_min != "" && filter.date_max != ""){
        conditions.maintenance_date = {
            [Op.between]: [filter.date_min, filter.date_max]
        }        
    }
    else if(filter.date_min != "" && filter.date_max == ""){
        conditions.maintenance_date = {
            [Op.gte]: filter.date_min                         
        }
    }
    else if(filter.date_min == "" && filter.date_max != ""){
        conditions.maintenance_date = {
            [Op.lte]: filter.date_max                         
        }  
    }

    const {count, rows} = await Maintenance.findAndCountAll(
        Object.assign(
            {
                raw: true,
                attributes: ['id_maintenance', 'maintenance_date','cost', 'discount' ],
                where: {
                    provider_id: conditions.provider_id,
                    status: "done",
                    maintenance_date: conditions.maintenance_date,
                    type_of_service: {
                        [Op.like]: '%'+ filter.type_of_service +'%'
                    }
                },
                order: [[
                    ["id_maintenance", 'DESC'],
                ]],
                include: [
                    {
                        model: Equipment,
                        where: {
                            name: {
                                [Op.like]: '%' +filter.name+'%'
                            },
                            status:{
                                [Op.like]: '%' +filter.status_of_equipment+'%'
                            },
                            category:{
                                [Op.like]: '%' +filter.equipment_category+'%'
                            },
                        },
                        attributes: ['id_equipment', 'name']
                    
                    },
                ],   
            }
        )
    );

    result.count = count;
    result.data = rows;

    return result
}
async function getMaintenanceById(id){
    const result = await Maintenance.findByPk(id).then(maintenance => { 
        if (!maintenance) {
            return 'Not find';
        }
        return maintenance.dataValues;
     });

     return result;
}

async function deleteMaintenance(id){
    const result = await Maintenance.destroy({
        where: {
          id_maintenance: id
        }
    });

    return result.dataValues;
}

async function updateMaintenance(id, maintenance){
    const result = await Maintenance.update(maintenance, {
        where: {
          id_maintenance: id
        }
      }); 
      return result.dataValues;  
}

module.exports = {
    createMaintenance,
    getMaintenances,
    getMaintenancesForCalculation,
    getMaintenanceById,
    deleteMaintenance,
    updateMaintenance
}