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

//expressjs format for requests
api.get("/test", async(req,res)=>{
let response = {
  "blahblah":27
}

res.send(response);

})

//sets the port requests will be recieved at, and listens for requests
const port = 3000;
api.listen(port);

console.log(port);
