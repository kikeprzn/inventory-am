const electron = require('electron'); 
const { remote } = require('electron');
const main = remote.require('./main');

const form = document.getElementById('maintenance_form');
const provider = document.getElementById('provider');
const equipment = document.getElementById('equipment');

const warning_alert = document.getElementById("warning_alert");

const success_alert = document.getElementById("success_alert");
const success_text = document.getElementById("success_text");

const maintenance_date = document.getElementById("maintenance_date");
maintenance_date.setAttribute("min", actual_date);


function removeWarningAlert(){
    warning_alert.classList.add("d-none");
}
function showWarningAlert(){
    warning_alert.classList.remove("d-none");
}

function removeSuccessAlert(){
    success_text.innerHTML = "";
    success_alert.classList.add("d-none");
}
function showSuccessAlert(text){
    success_text.innerHTML = text;
    success_alert.classList.remove("d-none");
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let maintenance_date = form.elements['maintenance_date']
    let maintenance_time = form.elements['maintenance_time']
    let type_of_service = form.elements['type_of_service']

    const new_maintenance = {
        maintenance_date: maintenance_date.value,
        maintenance_time: maintenance_time.value,
        type_of_service: type_of_service.value,
        equipment_id: parseInt(equipment.value), 
        provider_id: (provider.value == "") ? null : parseInt (provider.value)
    }
    const result = await main.Maintenance.createMaintenance(new_maintenance);
    showSuccessAlert("Elemento añadido")
    form.reset();
    provider.focus();

});

async function fillProviders(){
    let result = await main.Provider.getAllProviders()
    
    result.forEach(item => {
        provider.innerHTML += `
            <option value = "${item.id_provider}">${item.name}</option>
        `;
    });

}
async function fillEquipments(){
    let result = await main.Equipment.getAllEquipments()

    if (result.length == 0){
        showWarningAlert()
    }

    result.forEach(item => {
        equipment.innerHTML += `
            <option value = "${item.id_equipment}">${item.name}</option>
        `;
    });

}

async function init(){
    fillProviders();
    fillEquipments();
} 

init()