//imports expressjs(expressjs is a framework facilitates REST api)
let express = require ("express");
//Cors facilitates sending and receiving requests when they come from the same origin
//used when api is being tested on the same computer it was made on
let cors = require("cors");

//makes requests possible with shazam API
var axios = require("axios").default;

//imports keys from other file
let secureInfo = require("./secureinfo.json");

//encryption
let jwt = require('jsonwebtoken');


//creates new express object
let api = express();

//converts server response from text to json object
api.use(express.json());

//activates cors
api.use(cors());

//temporary users array
let users = [];





// ----------------------------------------------- ENDPOINTS -----------------------------------------------


/*
POST REQUEST
 to add a search query to the accounts search history
*/
api.get("/search/history", async(req,res)=>{


  let user = req.query.username;

  for(let i=0;i<users.length;i++){
    if(user == users[i].username){

      let search = users[i].searchHistory;

      let response = {
        search
      };
      res.send(response);
      return;
    }
  }

  let response = {
    "message":"user was not found"
  };
  res.status(404).send(response);

  

})




/*
POST REQUEST
 to add a search query to the accounts search history
*/
api.post("/search", async(req,res)=>{


  let search = req.body.search;
  let user = req.body.username;

  for(let i=0;i<users.length;i++){
    if(user == users[i].username){
      users[i].searchHistory.push(search);

      let response = {
        "message":"success"
      };
      res.send(response);
      return;
    }
  }

  let response = {
    "message":"user was not found"
  };
  res.status(404).send(response);

  

})






/*
GET REQUEST


*/

api.get("/search",async(req,res)=>{

  let searchterm = req.query.term;

  var options = {
    method: 'GET',
    url: 'https://shazam.p.rapidapi.com/search',
    params: {term: searchterm, locale: 'en-US', offset: '0', limit: '5'},
    headers: {
      'x-rapidapi-host': 'shazam.p.rapidapi.com',
      'x-rapidapi-key': secureInfo.key
    }
  };
  
  axios.request(options).then(function (response) {
    res.send(response.data);
  }).catch(function (error) {
    res.send(error)
  });

})





//Test endpoint
api.get("/test", async(req, res) => {

  let response = {
    "blahblah":27
  };

  res.send(response);

});

/*
  POST: CREATE A NEW ACCOUNT

  Payload format:
  {
    "username": <string>
    "email":<string>
    "password":<string>
  }
*/
api.post("/accounts", async(req,res)=>{


  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;

  for(let i=0;i<users.length;i++){
    if(username == users[i].username || email == users[i].email){
      let response ={
        "message":"email or username already exists"
      };
      res.status(400).send(response);
    }

  }

  users.push({
    "username":username,
    "email":email,
    "password":password,
    "searchHistory": []
  })


  let response = {
    "message":"success"
  };
  res.send(response);

})




/*
  GET: CHECK IF ACCOUNT EXISTS USING USERNAME

  Params: username
*/
api.get("/accounts/username/:username", async(req,res)=>{

  let username = req.params.username;

  for(let i=0;i<users.length;i++){

    if(users[i].username == username) {

      let response = {
        "message":users[i]
      };
      return res.send(response);

    }

  }

  let response = {
    "message":"not found"
  };
  res.status(404).send(response);

})





/*
  GET: CHECK IF ACCOUNT EXISTS USING EMAIL

  Params: email
*/
api.get("/accounts/email/:email", async(req,res)=>{

  let email = req.params.email;

  for(let i=0;i<users.length;i++){

    if(users[i].email == email) {

      let response = {
        "message":users[i]
      };
      return res.send(response);

    }

  }

  let response = {
    "message":"not found"
  };
  res.status(404).send(response);

})







// ----------------------------------------------- ENDPOINTS -----------------------------------------------

//sets the port requests will be recieved at, and listens for requests
const PORT = 3000;
api.listen(PORT);
console.log("API is listening on PORT:" + PORT);
