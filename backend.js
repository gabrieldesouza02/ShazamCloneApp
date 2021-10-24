//imports expressjs(expressjs is a framework to facilitates REST api shit)
let express = require ("express");
//Cors facilitates sending and receiving requests when they come from the same origin
//used when api is being tested on the same computer it was made on
let cors = require("cors");

//creates new express object
let api = express();


//converts server response from text to json object
api.use(express.json());

//activates cors
api.use(cors());

//temporary users array
let users = [];

// ----------------------------------------------- ENDPOINTS -----------------------------------------------

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
  }
*/
api.post("/accounts", async(req,res)=>{

  let username = req.body.username;
  users.push(username);

  let response = {
    "message":"success"
  };
  res.send(response);

})

/*
  GET: CHECK IF ACCOUNT EXISTS

  Params: username
*/
api.get("/accounts/:username", async(req,res)=>{

  let username = req.params.username;

  for(let i=0;i<users.length;i++){

    if(users[i]== username) {

      let response = {
        "message":username
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
