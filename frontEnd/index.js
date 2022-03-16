
let url = "http://localhost:3000/";

result;

async function getSearch(){
    let searchTerm = document.getElementById("search").value;
   
    const response = await fetch(url+"search?term="+searchTerm, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }
    });

     let result = await response.json();

     document.getElementById("artistSearch").innerHTML = result.artist;
     document.getElementById("titleSearch").innerHTML = result.title;
    
    console.log(result);
    //console.log(result.artist);
}
