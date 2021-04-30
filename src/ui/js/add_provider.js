const { remote } = require('electron');
const main = remote.require('./main');

const form = document.getElementById('provider_form')
const success_alert = document.getElementById("success_alert");
const success_text = document.getElementById("success_text");

function removeSuccessAlert(){
    success_text.innerHTML = "";
    success_alert.classList.add("d-none");
}
function showSuccessAlert(text){
    success_text.innerHTML = text;
    success_alert.classList.remove("d-none");
}

form.addEventListener('submit', async (e) => {
    e.preventDefault()

    let name = form.elements['name'];
    let address = form.elements['address'];
    let cellphone = form.elements['cellphone'];
    let email = form.elements['email'];
    let type = form.elements['type'];
    let observations = form.elements['observations'];

    const new_provider = {
        name: name.value,
        address: address.value,
        cellphone: cellphone.value,
        email: email.value,
        type: type.value,
        observations: observations.value
    }
    try {
        const result = await main.Provider.createProvider(new_provider);
        
    } catch (error) {
        console.log(error);
    }
    
    showSuccessAlert("Elemento añadido")
    form.reset();
    name.focus();
    

});