const userForm = document.querySelector('#userForm'); // # = id, . = class

// Elements data
let users = [];

// For editing
let deleted = false;
let editing = false;
let userId = null;

// Get data when get up


window.addEventListener('DOMContentLoaded', async () => {
    //by default the value is GET
    const response = await fetch('/api/users');
    // Convert to JSON
    const data = await response.json();
    users = data;
    renderUser(users);
    // console.log(data);
});



//console.log(userForm);
userForm.addEventListener('submit', async e => {
    e.preventDefault() // cancela el comportamiento por default del form

    const username = userForm['username'].value;
    const email = userForm['email'].value;
    const password = userForm['password'].value;

    if (!editing) {
        const response = await fetch('/api/users', { // me devuelve un objeto
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // forma decir que vamos a enviar un json al server
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        })

        const data = await response.json();
        // console.log(data)
        users.unshift(data);
        // renderUser(users);
    } else {
        const response = await fetch(`/api/users/${userId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json', // forma decir que vamos a enviar un json al server
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });
        const dataUpdate = await response.json();
        users = users.map(user => user.id === dataUpdate.id ? dataUpdate : user);
        // console.log(users)
        editing = false;
        userId = null;
    }
    if (deleted) {
        const response = await fetch('/api/users');
        // Convert to JSON
        const data = await response.json();
        users = data;
        console.log(users);
        deleted = false;
    }

    // users = users.filter(user => user.id !== data.id);
    // console.log(users)
    renderUser(users);
    console.log(users)
    userForm.reset(); // Limpia el formulario despues de enviar

});

//
function renderUser(users) {

    const userList = document.querySelector('#userList');
    userList.innerHTML = '';

    users.forEach(user => {
        const userItem = document.createElement('li');
        userItem.classList = 'list-group-item list-group-item-dark my-2'
        userItem.innerHTML = `
            <header class="d-flex justify-content-between align-items-center">
                <h3>${user.username}</h3>
                <div>
                    <button class="btn-delete btn btn-danger btn-sm">Delete</button>
                    <button class="btn-edit btn btn-secondary btn-sm">Edit</button>
                </div>
            </header>
            <p>${user.email}</p>
            <p class="text-truncate">${user.password}</p>
        `
        // Delete user
        const btnDelete = userItem.querySelector('.btn-delete');
        btnDelete.addEventListener('click', async () => {
            const responseDelete = await fetch(`/api/users/${user.id}`, {
                method: 'DELETE'
            })
            const data = await responseDelete.json();
            users = users.filter(user => user.id !== data.id);
            renderUser(users);
            console.log(users)
            deleted = true;
        });

        // Update user
        const btnEdit = userItem.querySelector('.btn-edit');
        btnEdit.addEventListener('click', async () => {
            const responseUpdate = await fetch(`/api/users/${user.id}`)
            const data = await responseUpdate.json()

            userForm["username"].value = data.username;
            userForm["email"].value = data.email;

            editing = true;
            userId = data.id
        })

        userList.append(userItem);
    });



}