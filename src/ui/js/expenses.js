const electron = require('electron'); 
const { remote } = require('electron');
const main = remote.require('./main');

const filter_form = document.getElementById("filter_form");
const provider_filter = document.getElementById('provider_filter');

const table_body = document.getElementById("table_body");
const pagination = document.getElementById("pagination");
let total_cost = document.getElementById('total_cost');
let total_discount = document.getElementById('total_discount');

let maintenances = [];
let total_records = '';
let records_count = 0;
let total_pages = 0;
let pages = {};
let current_page = 0;
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

let chart_data = []
let chart_labels = []

async function calculate(){

    chart_data = [];
    chart_labels = [];
    
    let result = await main.Maintenance.getMaintenancesForCalculation({filter: filter, order_by: "maintenance_date", by: "ASC"});
    let t_cost = 0;
    let t_discount = 0;

    total_cost.innerHTML = ""
    total_discount.innerHTML = ""
    let flag = true;
    if (result.count == 0){
        $(function () {
            $('#modal_warning_data_not_found').modal('toggle');
        });        
        return;
    }
    result.data.forEach(item => { 
        if (item.cost == "" || item.cost == null){
            $(function () {
                $('#modal_warning_empty_data').modal('toggle');
            });
            flag = false;        
            return;
        }
        
        if(item.discount != "" || item.discount != null){
            t_discount += item.discount;
        }
        t_cost += item.cost;

        chart_data.push(item.cost)
        chart_labels.push(item.maintenance_date)
        
    })
    
    if (flag){
        total_cost.innerHTML = t_cost
        total_discount.innerHTML = t_discount
        showChart(chart_data, chart_labels)
        chart_footer.innerHTML = "Total de elementos graficados: " + result.count;
    }

}

async function fillProviders(){
    let result = await main.Provider.getAllProviders()
    
    result.forEach(item => {
        provider_filter.innerHTML += `
            <option value = "${item.id_provider}">${item.name}</option>
        `;
    });

}

filter_form.addEventListener('submit', async (e) => {
    e.preventDefault()
    await getMaintenances();
    let name = filter_form.elements['name'];
    // filter_form.reset()
    name.focus()
});

async function getMaintenances(page = 1){
    let name = filter_form.elements['name'];
    let date_min = filter_form.elements['date_min'];
    let date_max = filter_form.elements['date_max'];
    let status_of_equipment = filter_form.elements['status_of_equipment'];
    let equipment_category= filter_form.elements['equipment_category'];
    let type_of_service= filter_form.elements['type_of_service'];
    
    filter.name = name.value
    filter.date_min = date_min.value
    filter.date_max = date_max.value
    filter.status_of_equipment = status_of_equipment.value
    filter.equipment_category = equipment_category.value
    filter.type_of_service = type_of_service.value
    filter.provider_id = (provider_filter.value == "") ? "" : parseInt(provider_filter.value);

    let result = await main.Maintenance.getMaintenances({page: page - 1, filter: filter});
    
    current_page = page;
    maintenances = result.data;
    records_count = result.count;
    total_pages = result.total_pages;
    pages = result.pages;

    total_cost.innerHTML = "";
    total_discount.innerHTML = "";
    
    chart_container.innerHTML = "";
    chart_container.innerHTML = `<canvas id="myAreaChart" width="100%" height="30"></canvas>`;

    await renderItems(maintenances);
    await renderPagination();
    
}

function renderPagination(){

    pagination.innerHTML = "";

    
    if (pages.has_prev){
        pagination.innerHTML = `
            <li class="page-item">
                <a onclick ="getMaintenances(${current_page - 1})"class="page-link">Previous</a>
            </li>
        `;
    }
    else{
        pagination.innerHTML = `
            <li class="page-item disabled">
                <a class="page-link" href="#" tabindex="-1">Previous</a>
            </li>
        `;
    }
    // pagination.innerHTML = previous_HTML;
    pages.pages_showed.forEach(item => {
        if (item == current_page){
            pagination.innerHTML += `
                <li class="page-item active">
                    <a class="page-link">${item}</a>
                </li>
            `;
        }
        else {
            pagination.innerHTML += `
                <li class="page-item">
                    <a onclick ="getMaintenances(${item})" class="page-link">${item}</a>
                </li>
            `;
        }
    });
    
    if (pages.has_next){
        
        pagination.innerHTML += `
            <li class="page-item">
                <a onclick="getMaintenances(${current_page + 1})" class="page-link">Next</a>
            </li>
        `;
    }
    else{
        pagination.innerHTML += `
            <li class="page-item disabled">
                <a class="page-link" href="#" tabindex="-1">Next</a>
            </li>
        `;
    }
}

function renderItems(records){
    table_body.innerHTML = '';
    let current_time = moment().format('HH:mm');
    
    

    records.forEach(item => {
        let status = `<span class="badge badge-pill badge-success">Hecho</span>`;
        
        switch (item.type_of_service) {
            case "preventive":
                item.type_of_service = "Preventivo"
                break;
            case "corrective":
                item.type_of_service = "Correctivo"
                break;
            case "diagnostic":
                item.type_of_service = "Diagnóstico"
                break;
            default:
                break;
        }

        for(var key in item){
            if (item[key] == "" || item[key] == null){
                item[key] = "--";
            }
        }

        table_body.innerHTML += `
            <tr>
                <td>${item.id_maintenance}</td>
                <td>${item.maintenance_date}</td>
                <td>${item.maintenance_time}</td>
                <td>${item['equipment.name']}</td>
                <td>${item['provider.name']}</td>
                <td>${item.type_of_service}</td>
                <td>$ ${item.cost}</td>
                <td>$ ${item.discount}</td>
            </tr>
        `;
    });

}

function init(){
    fillProviders();
    getMaintenances();
}

init()