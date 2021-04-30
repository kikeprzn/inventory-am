const electron = require('electron'); 
const { remote } = require('electron');
const main = remote.require('./main');
const PATH = require('path'); 
const { resourceUsage } = require('process');

const form = document.getElementById('equipment_form');
const provider = document.getElementById('provider');
const image_upload = document.getElementById('image_upload');
const image_local_url = document.getElementById('image_local_url');

const category = document.getElementById('category');
const serial_number = document.getElementById('serial_number');

const status = document.getElementById('status');
const status_description = document.getElementById('status_description');

const success_alert = document.getElementById("success_alert");
const success_text = document.getElementById("success_text");

category.addEventListener("change", (e) =>{
    
    if (e.target.value == "tool"){
        serial_number.required = false;
        serial_number.classList.add("d-none");
        
    }else{
        serial_number.required = true;
        serial_number.classList.remove("d-none");
    }
    serial_number.value = "";

});

status.addEventListener("change", (e) =>{
    
    if (e.target.value == "active"){
        status_description.classList.add("d-none");

    }else{
        status_description.classList.remove("d-none");
    }
    status_description.value = "";

});

function removeSuccessAlert(){
    success_text.innerHTML = "";
    success_alert.classList.add("d-none");
}
function showSuccessAlert(text){
    success_text.innerHTML = text;
    success_alert.classList.remove("d-none");
}

// Importing dialog module using remote 
const dialog = electron.remote.dialog; 
// Defining a Global file path Variable to store  
// user-selected file 
global.filepath = undefined; 
  
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let id_equipment = form.elements['id_equipment']
    let name = form.elements['name'].value
    let model = form.elements['model'].value
    let brand = form.elements['brand'].value
    let type = form.elements['type'].value
    let features = form.elements['features'].value
    let stock = form.elements['stock'].value
    let laboratory = form.elements['laboratory'].value

    const new_equipment = {
        id_equipment: id_equipment.value,
        name: name,
        model: model,
        brand: brand,
        type: type,
        category: category.value,
        serial_number: (category.value == "tool") ? null : serial_number.value,
        features: features,
        stock: parseInt(stock),
        provider_id: parseInt(provider.value),
        laboratory: laboratory,
        status: status.value,
        status_description: status_description.value,
        image_url: image_local_url.value,
    }
    
    const result = await main.Equipment.createEquipment(new_equipment);

    if (result.result == "Success"){
        showSuccessAlert("Elemento añadido")
        form.reset();
        id_equipment.focus();
    }else{
        $(function () {
            $('#modal_warning_not_unique').modal('toggle');
        }); 
    }

});

async function fillProviders(){
    let result = await main.Provider.getAllProviders()
    
    result.forEach(item => {
        provider.innerHTML += `
            <option value = "${item.id_provider}">${item.name}</option>
        `;
    });

}


// The function triggered by your button
image_upload.addEventListener('click', (e) => { 
    
        e.preventDefault()
        // Resolves to a Promise<Object> 
        dialog.showOpenDialog({ 
            title: 'Selecciona la imagen del equiopo', 
            defaultPath: PATH.join(__dirname, '../assets/uploads'), 
            buttonLabel: 'Seleccionar', 
            // Restricting the user to only Text Files. 
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

fillProviders();

