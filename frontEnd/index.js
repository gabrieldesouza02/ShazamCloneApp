
let url = "http://localhost:3000/";

async function getSearch(){
    let searchTerm = document.getElementById("search").value;
   
    const response = await fetch(url+"search?term="+searchTerm, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }
    });

     let result = await response.json();
    
    console.log(result);
    //console.log(result.artist);
}
