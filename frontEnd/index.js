
let url = "http://localhost:3000/";

async function getSearch(){
    let searchTerm = document.getElementById("search").value;
    console.log(searchTerm);

    let token = localStorage.scaToken;
    
    let data = {
        "search":searchTerm,
        "token": token
    }
    
    const response = await fetch(url+"search", {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    let result = await response.json();
    
    console.log(token);
    console.log(result);
}
