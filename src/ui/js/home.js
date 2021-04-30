const electron = require('electron'); 
const { remote } = require('electron');
const main = remote.require('./main');

const table_body_upcoming_maintenances = document.getElementById("table_body_upcoming_maintenances");
const table_body_expenses = document.getElementById("table_body_expenses");
let maintenances = [];
let expenses = [];

async function getMaintenances(){
    let filter = {
        name : "",
        provider_id: "",
        date_min : "",
        date_max : "",
        status : "to_do",
        status_of_equipment : "",
        equipment_category : "",
        type_of_service : "",
    }

    let result = await main.Maintenance.getMaintenances({page: 0, filter: filter, order_by: 'maintenance_date'});
    
    maintenances = result.data;

    await renderMaintenances(maintenances);
    
}
async function getExpenses(){
    let filter = {
        name : "",
        provider_id: "",
        date_min : "",
        date_max : "",
        status : "done",
        status_of_equipment : "",
        equipment_category : "",
        type_of_service : "",
    }

    let result = await main.Maintenance.getMaintenances({page: 0, filter: filter});
    
    expenses = result.data;

    await renderExpenses(expenses);
    
}

function renderExpenses(records){
    table_body_expenses.innerHTML = '';
    let current_time = moment().format('HH:mm');

    records.forEach(item => {
        let status = `<span class="badge badge-pill badge-info">Pendiente</span>`;
        for(var key in item){
            if (item[key] == "" || item[key] == null){
                item[key] = "--";
            } 
        }
        
        table_body_expenses.innerHTML += `
            <tr>
                <td>${item.id_maintenance}</td>
                <td>${item.maintenance_date}</td>
                <td>${item['equipment.name']}</td>
                <td>${item['provider.name']}</td>
                <td>${item.type_of_service}</td>
                <td>$ ${item.cost}</td>
                <td>$ ${item.discount}</td>
            </tr>
        `;
    });
}

function renderMaintenances(records){
    table_body_upcoming_maintenances.innerHTML = '';
    let current_time = moment().format('HH:mm');

    records.forEach(item => {
        let status = `<span class="badge badge-pill badge-info">Pendiente</span>`;
        for(var key in item){
            if (item[key] == "" || item[key] == null){
                item[key] = "--";
            } 
        }
        
        table_body_upcoming_maintenances.innerHTML += `
            <tr>
                <td>${item.id_maintenance}</td>
                <td>${item.maintenance_date}</td>
                <td>${item.maintenance_time}</td>
                <td>${item['provider.name']}</td>
                <td>${status}</td>
                <td>${item['equipment.name']}</td>
                <td>${item['equipment.brand']} / ${item['equipment.model']}</td>
                <td>${item['equipment.type']}</td>
            </tr>
        `;
    });
}

async function init(){
    await getMaintenances();
    await getExpenses();
}

init()