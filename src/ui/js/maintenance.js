const electron = require('electron'); 
const { remote } = require('electron');
const main = remote.require('./main');

const update_form = document.getElementById("update_form");
const provider_update = document.getElementById('provider_update');
const equipment_update = document.getElementById('equipment_update');

const filter_form = document.getElementById("filter_form");
const provider_filter = document.getElementById('provider_filter');

const table_body = document.getElementById("table_body");
const table_footer = document.getElementById("table_footer");
const pagination = document.getElementById("pagination");

const success_alert = document.getElementById("success_alert");
const success_text = document.getElementById("success_text");

const maintenance_date_update = document.getElementById("maintenance_date_update");

let delete_id = '';
let edit_id = '';
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
    status : "",
    status_of_equipment : "",
    equipment_category : "",
    type_of_service : "",
}

function removeSuccessAlert(){
    success_text.innerHTML = "";
    success_alert.classList.add("d-none");
}
function showSuccessAlert(text){
    success_text.innerHTML = text;
    success_alert.classList.remove("d-none");
}

function showImage(image_url){

    var img = document.createElement("img");
    img.src = image_url
    img.style.width = "200px";
    img.style.objectFit = "contain";
    img.alt = "No se pudo encontrar la imagen";
    
    let modal_image_container = document.getElementById('modal_image_container')
    modal_image_container.innerHTML = '';
    modal_image_container.appendChild(img);
}

async function fillProviders(){
    let result = await main.Provider.getAllProviders()
    
    result.forEach(item => {
        provider_filter.innerHTML += `
            <option value = "${item.id_provider}">${item.name}</option>
        `;
        provider_update.innerHTML += `
            <option value = "${item.id_provider}">${item.name}</option>
        `;
    });

}
async function fillEquipments(){
    let result = await main.Equipment.getAllEquipments()

    result.forEach(item => {
        equipment_update.innerHTML += `
            <option value = "${item.id_equipment}">${item.name}</option>
        `;
    });

}

update_form.addEventListener('submit', async (e) => {
    e.preventDefault()

    let maintenance_date = update_form.elements['maintenance_date'].value
    let maintenance_time = update_form.elements['maintenance_time'].value
    let observations = update_form.elements['observations'].value
    let in_charge = update_form.elements['in_charge'].value
    let type_of_service = update_form.elements['type_of_service'].value
    let status = update_form.elements['status'].value
    let cost = update_form.elements['cost'].value
    let discount = update_form.elements['discount'].value
    
    const edit_maintenance = {
        maintenance_date : maintenance_date,
        maintenance_time : maintenance_time,
        observations : observations,
        in_charge : in_charge,
        type_of_service : type_of_service,
        status : status,
        cost : (cost == "") ? null : parseInt(cost),
        discount : (discount == "") ? null : parseInt(discount),
        equipment_id: parseInt(equipment_update.value), 
        provider_id: (provider_update.value == "") ? null : parseInt(provider_update.value)
    } 
    let result = await main.Maintenance.updateMaintenance(edit_id, edit_maintenance)
    edit_id = '';
    getMaintenances()

    $(function () {
        $('#update_modal').modal('toggle');
    });

    await showSuccessAlert("Registro actualizado correctamente")
    update_form.reset();
    equipment_update.focus();
})

async function onUpdateModalOpen(id){
    let maintenance_date = update_form.elements['maintenance_date']
    let maintenance_time = update_form.elements['maintenance_time']
    let observations = update_form.elements['observations']
    let in_charge = update_form.elements['in_charge']
    let type_of_service = update_form.elements['type_of_service']
    let status = update_form.elements['status']
    let cost = update_form.elements['cost']
    let discount = update_form.elements['discount']
    
    try {
        let result = await getMaintenanceById(id);
        
        provider_update.value = (result.provider_id == null) ? "": result.provider_id;
        equipment_update.value = result.equipment_id;

        maintenance_date.value = result.maintenance_date;

        if (actual_date < result.maintenance_date){
            maintenance_date_update.setAttribute("min", actual_date);
        }else{
            maintenance_date_update.setAttribute("min", result.maintenance_date);
        }


        maintenance_time.value = result.maintenance_time;
        observations.value = result.observations;
        in_charge.value = result.in_charge;
        type_of_service.value = result.type_of_service;
        status.value = result.status;
        cost.value = result.cost;
        discount.value = result.discount

        edit_id = id;
        
    } catch (error) {
        console.log(error);
    }
};

filter_form.addEventListener('submit', async (e) => {
    e.preventDefault()
    await getMaintenances();
    let name = filter_form.elements['name'];
    // filter_form.reset()
    name.focus()
});

async function onDelete(id){
    let result = await main.Maintenance.deleteMaintenance(delete_id);
    await getMaintenances();
    
    $(function () {
        $('#modal_delete').modal('toggle');
    });

    await showSuccessAlert("Registro eliminado correctamente");
}

function onDeleteModalOpen(id){
    delete_id = id;
}

// Para resetear el delete_id cuando el modal se esconda
$('#modal_delete').on('hidden.bs.modal', function () {
    delete_id = ''
})

async function getMaintenances(page = 1){
    let name = filter_form.elements['name'];
    let date_min = filter_form.elements['date_min'];
    let date_max = filter_form.elements['date_max'];
    let status = filter_form.elements['status'];
    let status_of_equipment = filter_form.elements['status_of_equipment'];
    let equipment_category= filter_form.elements['equipment_category'];
    let type_of_service= filter_form.elements['type_of_service'];

    filter.name = name.value
    filter.date_min = date_min.value
    filter.date_max = date_max.value
    filter.status = status.value
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
    await renderItems(maintenances);
    await renderPagination();
    
}
async function getMaintenanceById(id){
    let result = await main.Maintenance.getMaintenanceById(id);
    return result;
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
        let status = ""
        if (item.status == 'to_do'){
            status = `<span class="badge badge-pill badge-info">Pendiente</span>`;
            
            let is_empty = (item.maintenance_time != "" && item != null);
            
            if(actual_date > item.maintenance_date){
                status = `<span class="badge badge-pill badge-danger">Pendiente - Vencido</span>`
            }
            else if (is_empty && actual_date == item.maintenance_date && current_time > item.maintenance_time){
                status = `<span class="badge badge-pill badge-danger">Pendiente - Vencido</span>`
            }
        }
        else if(item.status == 'done'){
            status = `<span class="badge badge-pill badge-success">Hecho</span>`;
        }
        
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
        if (item['equipment.category'] == "instrument"){
            item['equipment.category']= "Instrumento"
        }else{
            item['equipment.category']= "Equipo"
        }
        table_body.innerHTML += `
            <tr>
                <td>${item.id_maintenance}</td>
                <td>${item.maintenance_date}</td>
                <td>${item.maintenance_time}</td>
                <td>${item['equipment.name']}</td>
                <td>${item['equipment.brand']} / ${item['equipment.model']}</td>
                <td>${item['equipment.category']}</td>
                <td>${item.observations}</td>
                <td>${item.type_of_service}</td>
                <td>${status}</td>
                <td>${item.in_charge}</td>
                <td>
                    <button type="button" class="btn btn-secondary" onclick="showImage('${item['equipment.image_url']}')" data-toggle="modal" data-target="#modal_image">
                        <i class="fa fa-image" aria-hidden="true"></i>
                        Ver imagen
                    </button>
                </td>
                <td>
                    <button type="button" class="btn btn-success btn-sm" onclick="onUpdateModalOpen(${item.id_maintenance})" data-toggle="modal" data-target="#update_modal">
                        <i class="fa fa-edit" aria-hidden="true"></i>
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick = "onDeleteModalOpen(${item.id_maintenance})" data-toggle="modal" data-target="#modal_delete">
                        <i class="fa fa-trash" aria-hidden="true"></i>
                        Eliminar
                    </button>
                </td>
            </tr>
        `;
    });

}

function init(){
    fillEquipments();
    fillProviders();
    getMaintenances();
}

init()