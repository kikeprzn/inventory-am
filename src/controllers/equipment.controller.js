const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;
const {Equipment} = require("../database/db_config");
const {getPages, paginate} = require("../helper/pagination")

async function createEquipment(equipment){
    try {
        const result = await Equipment.create(equipment).then(function(item){
            return {
                "result": "Success",
                "message" : "Created item.",
                "item" : item
             };
        }).catch(function (err) {
            return {
                "result": "Error",
                "message" : "The action could not be completed.",
                "error" : {
                    type: err.errors[0].type,
                    message: err.errors[0].message,
                    source_of_error: err.errors[0].path,
                }
            }
        });
        return result;
        
    } catch (error) {
        // console.log(error);
        let result = {
            "result": "Error",
            "message" : "Something got wrong",
        };
        return result
    }

}

async function getAllEquipments(){
    let result = await Equipment.findAll( 
        Object.assign(
            {
                raw: true,
                attributes: ['id_equipment', 'name'],
                where: {
                    category:{
                        [Op.ne] : "tool"
                    }
                },
                order: [[
                    ['id_equipment', 'DESC'],
                ]],
            }
        )
    );

    return result;
}

async function getEquipments({page = 0, pageSize = 5, filter = false, not_equipment = false}){
    result = {}
    if (!filter){
        filter = {}
        filter.id_equipment = ""
        filter.serial_number = ""
        filter.name = ""
        filter.provider_id = ""
        filter.model = ""
        filter.brand = ""
        filter.type = ""
        filter.category = ""
        filter.status = ""

    }
    let conditions = {
        provider_id: {
            [Op.or] : {
                [Op.like]: '%%',
                [Op.is] : null
            }
        },
        category: {
            [Op.like]: '%'+filter.category+'%'
        }
    }

    if ( filter.provider_id != ""){
        conditions.provider_id = {
        [Op.eq]: filter.provider_id
        }
    }

    if(not_equipment){
        conditions.category = {
            [Op.and]:{
                [Op.like]: '%'+filter.category+'%',
                [Op.ne]: "equipment",
            }
        }
    }

    let paginate_result = paginate({page, pageSize})

    const {count, rows} = await Equipment.findAndCountAll(
        Object.assign(
            {
                raw: true,
                where: {
                    id_equipment: {
                        [Op.like]: '%'+filter.id_equipment+'%',
                    },
                    serial_number: {
                        [Op.or]:{
                            [Op.like]: '%'+filter.serial_number+'%',
                            [Op.is]: null

                        }
                    },
                    name: { 
                        [Op.like]: '%'+filter.name+'%',
                    },
                    provider_id: conditions.provider_id,
                    model: {
                        [Op.like]: '%'+filter.model+'%', 
                    },
                    brand: {
                        [Op.like]: '%'+filter.brand+'%',                         
                    },
                    type: {
                        [Op.like]: '%'+filter.type+'%',                         
                    },
                    category: conditions.category,
                    status: {
                        [Op.like]: '%'+filter.status+'%',                         
                    }
                },
                order: [[
                    ['id_equipment', 'DESC'],
                ]],
            },   
            paginate_result
        )
    );
    result.count = count;
    result.data = rows
    result.total_pages = Math.ceil(result.count / 5);
    result.pages = await getPages(result.total_pages, page + 1); 

    return result;
    
}



async function getEquipmentById(id){
    const result = await Equipment.findByPk(id).then(equipment => { 
        if (!equipment) {
            return 'Not find';
        }
        return equipment.dataValues;
     });

     return result;
}

async function deleteEquipment(id){
    const result = await Equipment.destroy({
        where: {
          id_equipment: id
        }
    });

    return result.dataValues;
}

async function updateEquipment(id, equipment){
    const result = await Equipment.update(equipment, {
        where: {
          id_equipment: id
        }
      }).then(function(item){
        return {
            "result": "Success",
            "message" : "Updated item.",
            "item" : item
         };
    }).catch(function (err) {
        return {
            "result": "Error",
            "message" : "The action could not be completed.",
            "error" : {
                type: err.errors[0].type,
                message: err.errors[0].message,
                source_of_error: err.errors[0].path,
            }
        }
    });
    return result;  
}

module.exports = {
    createEquipment,
    getAllEquipments,
    getEquipments,
    getEquipmentById,
    deleteEquipment,
    updateEquipment
}