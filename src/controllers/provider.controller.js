const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

const {getPages, paginate} = require("../helper/pagination")
const {Provider} = require("../database/db_config");

async function createProvider(provider){
    try {
        const result = await Provider.create(provider)
        return result;
        
    } catch (error) {
        return undefined;
    }

}   
async function getAllProviders(){
    let result = await Provider.findAll( 
        Object.assign(
            {
                raw: true,
                attributes: ['id_provider', 'name'],
                order: [[
                    ['id_provider', 'DESC'],
                ]],
            }
        )
    );

    return result;
}

async function getProviders({page = 0, pageSize = 5, filter = false}){
    result = {}
    if (!filter){
        filter = {}
        filter.name = "" 
        filter.type = ""
    }
    let paginate_result = paginate({page, pageSize})
    const {count, rows} = await Provider.findAndCountAll(
        Object.assign(
            {
                raw: true,
                where: {
                    name: { 
                        [Op.like]: '%'+filter.name+'%' 
                    },
                    type: { 
                        [Op.like]: '%'+filter.type+'%' 
                    }
                },
                order: [[
                    ['id_provider', 'DESC'],
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

async function getProviderById(id){
    const result = await Provider.findByPk(id).then(provider => {
        if (!provider) {
            return 'Not find';
        }
        return provider.dataValues;
     });

     return result;
}

async function deleteProvider(id){
    const result = await Provider.destroy({
        where: {
          id_provider: id
        }
    });

    return result.dataValues;
}

async function updateProvider(id, provider){
    const result = await Provider.update(provider, {
        where: {
          id_provider: id
        }
      }); 
      return result.dataValues;  
}

module.exports = {
    createProvider,
    getAllProviders,
    getProviders,
    getProviderById,
    deleteProvider,
    updateProvider,
}

