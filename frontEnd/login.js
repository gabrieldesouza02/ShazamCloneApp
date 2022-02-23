let url = "http://localhost:3000/";



async function signUp(){
    let username = document.getElementById("newusername").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("newpassword").value;
    

    
    let data = {
        "username":username,
        "email": email,
        "password":password
    }
    
    const response = await fetch(url+"createaccount", {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    let result = await response.json();
    
    alert(result.message);
}

async function logIn(){
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let data = {
        "username":username,
        "password":password
    }
    
    const response = await fetch(url+"accounts/signin", {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    let result = await response.json();
    
    console.log(result.message);
    console.log(result.token);

    //Save JWT in local storage
    localStorage.scaToken = result.token;



}