//imports expressjs(expressjs is a framework facilitates REST api)
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
      res.send(response);
    }

  }

  users.push({
    "username":username,
    "email":email,
    "password":password
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
