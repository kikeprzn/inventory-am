const electron = require('electron'); 
const { remote } = require('electron');
const main = remote.require('./main');
const PATH = require('path'); 

const update_form = document.getElementById("update_form");
const provider_update = document.getElementById('provider_update');
const status_update = document.getElementById('status_update');
const status_description_update = document.getElementById('status_description_update');
const category_update = document.getElementById('category_update');
const serial_number_update = document.getElementById('serial_number_update');


const filter_form = document.getElementById("filter_form");
const provider_filter = document.getElementById('provider_filter');

const table_body = document.getElementById("table_body");
const pagination = document.getElementById("pagination");

const success_alert = document.getElementById("success_alert");
const success_text = document.getElementById("success_text");

const image_upload = document.getElementById('image_upload');
const image_local_url = document.getElementById('image_local_url');

let delete_id = '';
let edit_id = '';
let providers = [];
let total_records = '';
let records_count = 0;
let total_pages = 0;
let pages = {};
let current_page = 0;
let filter = {
    id_equipment: "",
    serial_number: "",
    name: "",
    provider_id: "",
    model: "",
    brand: "",
    type: "",
    category: "",
    status: ""
}

category_update.addEventListener("change", (e) =>{
    
    if (e.target.value == "tool"){
        serial_number_update.required = false;
        serial_number_update.classList.add("d-none");
        
    }else{
        serial_number_update.required = true;
        serial_number_update.classList.remove("d-none");
    }

});

status_update.addEventListener("change", (e) =>{
    
    if (e.target.value == "active"){
        status_description_update.classList.add("d-none");

    }else{
        status_description_update.classList.remove("d-none");
    }
});

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

async function fillEquipments(){
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

update_form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let id_equipment = update_form.elements['id_equipment'];
    let name = update_form.elements['name'].value;
    let model = update_form.elements['model'].value;
    let brand = update_form.elements['brand'].value;
    let type = update_form.elements['type'].value;
    let serial_number = (category_update.value == "tool") ? null : serial_number_update.value; 
    let features = update_form.elements['features'].value
    let stock = update_form.elements['stock'].value
    let provider_id = (provider_update.value == "") ? null : parseInt(provider_update.value); 
    let laboratory = update_form.elements['laboratory'].value;
    let description_of_the_location = update_form.elements['description_of_the_location'].value;
    let status_description = (status_update.value == "active") ? "" : status_description_update.value; 

    console.log(category_update.value)
    const edit_equipment = {
        id_equipment: id_equipment.value,
        name: name,
        model:model,
        brand:brand,
        type:type,
        category: category_update.value,
        serial_number:serial_number,
        features:features,
        stock:parseInt(stock),
        status: status_update.value,
        status_description: status_description,
        laboratory: laboratory,
        description_of_the_location: description_of_the_location,
        image_url: image_local_url.value,
        provider_id: provider_id,
    }

    let result = await main.Equipment.updateEquipment(edit_id, edit_equipment)
    
    $(function () {
        $('#update_modal').modal('toggle');
    });
    edit_id = '';
    update_form.reset();
    id_equipment.focus();

    if (result.result == "Success"){
        getEquipments()
        console.log(result);
        showSuccessAlert("Registro actualizado correctamente")
    }else{
        $(function () {
            $('#modal_warning_not_unique').modal('toggle');
        });
    }
    

});

async function onUpdateModalOpen(id){
    let id_equipment = update_form.elements['id_equipment'];
    let name = update_form.elements['name'];
    let model = update_form.elements['model'];
    let brand = update_form.elements['brand'];
    let type = update_form.elements['type'];
    let serial_number = update_form.elements['serial_number'];
    let features = update_form.elements['features'];
    let stock = update_form.elements['stock'];
    let description_of_the_location = update_form.elements['description_of_the_location']
    let laboratory = update_form.elements['laboratory']
    
    try {
        let result = await getEquipmentById(id);
        
        provider_update.value = (result.provider_id == null) ? "": result.provider_id
        id_equipment.value = result.id_equipment;
        name.value = result.name;
        model.value = result.model;
        brand.value = result.brand;
        type.value = result.type;
        category_update.value = result.category;
        serial_number.value = (result.serial_number == null ) ? "": result.serial_number;
        features.value = result.features;
        stock.value = result.stock;
        image_local_url.value = result.image_url;
        description_of_the_location.value = result.description_of_the_location
        laboratory.value = result.laboratory
        status_update.value = result.status
        status_description_update.value = result.status_description
        
        if (result.status == "inactive"){
            status_description_update.classList.remove("d-none");
        }
        else{
            status_description_update.classList.add("d-none");
        }

        if(result.category == "tool"){
            serial_number_update.required = false;
            serial_number_update.classList.add("d-none");
            
        }else{
            serial_number_update.required = true;
            serial_number_update.classList.remove("d-none");
        }

        edit_id = id;
        
    } catch (error) {
        console.log(error);
    }
};

filter_form.addEventListener('submit', async (e) => {
    e.preventDefault()
    await getEquipments();
    // filter_form.reset()
});

async function onDelete(id){
    let result = await main.Equipment.deleteEquipment(delete_id);
    await getEquipments();
    
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

async function getEquipments(page = 1){
    let id_equipment = filter_form.elements['id_equipment'];
    let serial_number = filter_form.elements['serial_number'];
    let name = filter_form.elements['name'];
    let model = filter_form.elements['model'];
    let brand = filter_form.elements['brand'];
    let type = filter_form.elements['type'];
    let status = filter_form.elements['status'];
    let category = filter_form.elements['category'];
    
    filter.id_equipment = id_equipment.value
    filter.serial_number = serial_number.value
    filter.name = name.value
    filter.model = model.value
    filter.brand = brand.value
    filter.type = type.value
    filter.status = status.value
    filter.category = category.value
    filter.provider_id = (provider_filter.value == "") ? "" : parseInt(provider_filter.value);

    let result = await main.Equipment.getEquipments({page: page - 1, filter: filter, not_equipment: true});
    
    current_page = page;
    equipments = result.data;
    records_count = result.count;
    total_pages = result.total_pages;
    pages = result.pages;

    renderItems(equipments);
    renderPagination();
}
async function getEquipmentById(id){
    let result = await main.Equipment.getEquipmentById(id);
    return result;
}

function renderPagination(){

    pagination.innerHTML = "";

    
    if (pages.has_prev){
        pagination.innerHTML = `
            <li class="page-item">
                <a onclick ="getEquipments(${current_page - 1})"class="page-link">Previous</a>
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
                    <a onclick ="getEquipments(${item})" class="page-link">${item}</a>
                </li>
            `;
        }
    });
    
    if (pages.has_next){
        
        pagination.innerHTML += `
            <li class="page-item">
                <a onclick="getEquipments(${current_page + 1})" class="page-link">Next</a>
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

function renderItems(equipments){
    table_body.innerHTML = '';
    equipments.forEach(item => {

        for(var key in item){
            if (item[key] == "" || item[key] == null){
                item[key] = "--";
            } 
        }
        let status = "Activo";
        if (item.status == "inactive"){
            status = "Inactivo"
        }
        if (item.category == "tool"){
            item.category = "Herramienta"
        }else{
            item.category = "Instrumento"
        }
        table_body.innerHTML += `
            <tr>
                <td>${item.id_equipment}</td>
                <td>${item.name}</td>
                <td>${item.model}</td>
                <td>${item.brand}</td>
                <td>${item.type}</td>
                <td>${item.serial_number}</td>
                <td>${item.category}</td>
                <td>${item.features}</td>
                <td>${item.stock}</td>
                <td>${status}</td>
                <td>${item.status_description}</td>
                <td>${item.laboratory}</td>
                <td>
                    <button type="button" class="btn btn-secondary" onclick="showImage('${item.image_url}')" data-toggle="modal" data-target="#modal_image">
                        <i class="fa fa-image" aria-hidden="true"></i>
                        Ver imagen
                    </button>
                </td>
                <td>
                    <button type="button" class="btn btn-success btn-sm" onclick="onUpdateModalOpen(${item.id_equipment})" data-toggle="modal" data-target="#update_modal">
                        <i class="fa fa-edit" aria-hidden="true"></i>
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick = "onDeleteModalOpen(${item.id_equipment})" data-toggle="modal" data-target="#modal_delete">
                        <i class="fa fa-trash" aria-hidden="true"></i>
                        Eliminar
                    </button>
                </td>
            </tr>
        `;
    });

}

async function init(){
    fillEquipments()
    await getEquipments();
}


// Importing dialog module using remote 
const dialog = electron.remote.dialog; 

global.filepath = undefined; 


// Defining a Global file path Variable to store  
// user-selected file 
// The function triggered by your button
image_upload.addEventListener('click', (e) => { 
    
        e.preventDefault()
        // Resolves to a Promise<Object> 
        dialog.showOpenDialog({ 
            title: 'Selecciona la imagen del equiopo', 
            buttonLabel: 'Seleccionar', 
            // Restricting the user to only images Files. 
            filters: [  
                { 
                    name: 'Images', 
                    extensions: ['jpg', 'png'] 
                }, ], 
            // Specifying the File Selector Property 
            properties: ['openFile'] 
        }).then(file => { 
            // Stating whether dialog operation was 
            // cancelled or not. 
            if (!file.canceled) { 
                // Updating the GLOBAL filepath variable  
                // to user-selected file.
                global.filepath = file.filePaths[0].toString(); 
                image_local_url.value = global.filepath.replace(/\\/g, "/");; 
            }   
        }).catch(err => { 
            console.log(err);
        }); 
});


init()