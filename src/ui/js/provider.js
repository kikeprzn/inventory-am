const { remote } = require('electron');
const main = remote.require('./main');

const update_form = document.getElementById("update_form");
const filter_form = document.getElementById("filter_form");
const table_body = document.getElementById("table_body");
const pagination = document.getElementById("pagination");

const success_alert = document.getElementById("success_alert");
const success_text = document.getElementById("success_text");

let delete_id = '';
let edit_id = '';
let providers = [];
let total_records = '';
let records_count = 0;
let total_pages = 0;
let pages = {};
let current_page = 0;
let filter = {
    name: "",
    type: ""
}

function removeSuccessAlert(){
    success_text.innerHTML = "";
    success_alert.classList.add("d-none");
}
function showSuccessAlert(text){
    success_text.innerHTML = text;
    success_alert.classList.remove("d-none");
}

update_form.addEventListener('submit', async (e) => {
    e.preventDefault()

    let name = update_form.elements['name'];
    let address = update_form.elements['address'];
    let cellphone = update_form.elements['cellphone'];
    let email = update_form.elements['email'];
    let type = update_form.elements['type'];
    let observations = update_form.elements['observations'];

    const edit_provider = {
        name: name.value,
        address: address.value,
        cellphone: cellphone.value,
        email: email.value,
        type: type.value,
        observations: observations.value,   
    }

    let result = await main.Provider.updateProvider(edit_id, edit_provider)
    edit_id = '';
    getProviders()

    $(function () {
        $('#update_modal').modal('toggle');
    });

    await showSuccessAlert("Registro actualizado correctamente")
    update_form.reset();
    name.focus();

});


async function onUpdateModalOpen(id){
    let name = update_form.elements['name'];
    let address = update_form.elements['address'];
    let cellphone = update_form.elements['cellphone'];
    let email = update_form.elements['email'];
    let type = update_form.elements['type'];
    let observations = update_form.elements['observations'];

    try {
        let result = await getProviderById(id);
        name.value = result.name
        address.value = result.address
        cellphone.value = result.cellphone
        email.value = result.email
        type.value = result.type
        observations.value = result.observations
        edit_id = id;
        
    } catch (error) {
        console.log(error);
    }
};

filter_form.addEventListener('submit', async (e) => {
    e.preventDefault()
    await getProviders();

});

async function onDelete(){
    let result = await main.Provider.deleteProvider(delete_id);
    await getProviders();
    
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

async function getProviders(page = 1) {
    
    let name = filter_form.elements['name'];
    let type = filter_form.elements['type'];
    filter.name = name.value
    filter.type = type.value

    let result = await main.Provider.getProviders({page: page - 1, filter: filter});
    
    current_page = page;
    providers = result.data
    records_count = result.count
    total_pages = result.total_pages;
    pages = result.pages

    renderItems(providers);
    renderPagination();
}
async function getProviderById(id){
    let result = await main.Provider.getProviderById(id)
    return result
}

function renderPagination(){

    pagination.innerHTML = "";

    
    if (pages.has_prev){
        pagination.innerHTML = `
            <li class="page-item">
                <a onclick ="getProviders(${current_page - 1})"class="page-link">Previous</a>
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
                    <a onclick ="getProviders(${item})" class="page-link">${item}</a>
                </li>
            `;
        }
    });
    
    if (pages.has_next){
        
        pagination.innerHTML += `
            <li class="page-item">
                <a onclick="getProviders(${current_page + 1})" class="page-link">Next</a>
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

function renderItems(providers){
    table_body.innerHTML = '';
    providers.forEach(item => {
        
        let type_aux = ""
        switch (item.type) {
            case "sale":
                type_aux = "Venta"
                break;
            case "maintenance":
                type_aux = "Mantenimiento"
                break;
            case "service":
                type_aux = "Servicio"
                break;            
            default:
                break;
        }
        let observations_aux = item.observations;
        if (item.observations == ""){
            observations_aux = "--"
        }

        table_body.innerHTML += `
            <tr>
                <td>${item.id_provider}</td>
                <td>${item.name}</td>
                <td>${item.address}</td>
                <td>${item.cellphone}</td>
                <td>${item.email}</td>
                <td>${type_aux}</td>
                <td>${observations_aux}</td>
                <td>
                    <button type="button" class="btn btn-success btn-sm" onclick="onUpdateModalOpen(${item.id_provider})" data-toggle="modal" data-target="#update_modal">
                        <i class="fa fa-edit" aria-hidden="true"></i>
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick = "onDeleteModalOpen(${item.id_provider})" data-toggle="modal" data-target="#modal_delete">
                        <i class="fa fa-trash" aria-hidden="true"></i>
                        Eliminar
                    </button>
                </td>
            </tr>
        `;
    });

}

async function init(){
    await getProviders();
}

init()