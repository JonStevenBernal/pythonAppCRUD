const userForm = document.querySelector('#userForm'); // # = id, . = class

//console.log(userForm);
userForm.addEventListener('submit', async e => {
    e.preventDefault() // cancela el comportamiento por default del form
    
    const username = userForm['username'].value;
    const email    = userForm['email'].value;
    const password = userForm['password'].value;

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

   const data = await response.json()
   console.log(data)

   userForm.reset(); // Limpia el formulario despues de enviar

   //console.log(username, email, password)
} );