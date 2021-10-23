//imports expressjs(expressjs is a framework to facilitates REST api shit)
let express = require ("express");

//cors facilitates sending and receiving requests when they come from the same origin
//used when api is being tested on the same computer it was made on
let cors = require("cors");

//creates new express object
let api = express();


//converts server response from text to json object
api.use(express.json());

//activates cors
api.use(cors());

let users=[];

//expressjs format for requests
api.get("/test", async(req,res)=>{
let response = {
  "blahblah":27
}

res.send(response);

})

api.post("/accounts", async(req,res)=>{

  let username = req.body.username;
  users.push(username);

  let response = {
    "message":"success"

  }

  res.send(response);

})


api.get("/accounts/:username", async(req,res)=>{

  let username = req.params.username;
  console.log(username);

  for(let i=0;i<users.length;i++){


    if(users[i]== username) {
      let response = {
        "message":username
      }
    
      
      return res.send(response);
    }

  }

  let response = {
    "message":"not found"
  }

  res.status(404).send(response);

  

})

//sets the port requests will be recieved at, and listens for requests
const port = 3000;
api.listen(port);

console.log(port);
