//imports expressjs(expressjs is a framework facilitates REST api)
let express = require ("express");
//Cors facilitates sending and receiving requests when they come from the same origin
//used when api is being tested on the same computer it was made on
let cors = require("cors");

//makes requests possible with shazam API
var axios = require("axios").default;

//local JSON based DB
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

//imports keys from other file
let secureInfo = require("./secureinfo.json");

//encryption
let jwt = require('jsonwebtoken');


//creates new express object
let api = express();

//User list
var users_db = low(new FileSync('users_db.json'));
users_db.defaults({
  user_list: []
}).write();


//converts server response from text to json object
api.use(express.json());

//activates cors
api.use(cors());



// ----------------------------------------------- ENDPOINTS -----------------------------------------------



/*
  PUT: sign in a user if they exist and if the password matches the username

  Params: username, password
*/
api.put("/accounts/signin", async(req,res)=>{

  let users = users_db.get("user_list").value();

  let username = req.body.username;
  let password = req.body.password;

  for(let i=0;i<users.length;i++){

    if(users[i].username == username ) {

      if( users[i].password != password){

        let response = {
          "message":"password incorrect"
        };
        return res.status(401).send(response);

      } else {

        var token = jwt.sign({ username: username }, secureInfo.jwtsecret);
        let response = {
          
          "message": "success",
          "token":token
        };
        return res.send(response);
      }
    }
  }

  let response = {
    "message":"username does not exist"
  };
  return res.status(401).send(response);

})







/*
  PUT: check if jwt token is correct

  body:token

*/
api.put("/accounts/checktoken", async(req,res)=>{

  

  let token = req.body.token

  // invalid token - synchronous
  try {
    let info = jwt.verify(token, secureInfo.jwtsecret);

    let response = {
      "message": info
    };
    return res.send(response);

  } catch(err) {
    let response = {
      "message": "wrong token"
    };
    return res.status(401).send(response);
  }


})






/*
  PUT: change password

  body:token

*/
api.put("/accounts/changepassword", async(req,res)=>{

  let users = users_db.get("user_list").value();

  let token = req.body.token
  let oldPassword = req.body.oldpassword
  let newPassword = req.body.newpassword

  // invalid token - synchronous
  try {

    let info = jwt.verify(token, secureInfo.jwtsecret);

    let username = info.username;


    for(let i=0;i<users.length;i++){

      if(users[i].username == username){

        if(users[i].password == oldPassword) {

          users[i].password = newPassword;

          users_db.set("user_list", users).write();


          let response = {
            "message": "password changed succesfully"
          };
          return res.send(response);

        }else{
          let response = {
            "message": "old password doesn't match"
          };
          return res.status(404).send(response);
        }

      }
    }

    
    

  } catch(err) {
    let response = {
      "message": "wrong token"
    };
    return res.status(401).send(response);
  }


})




/*
GET REQUEST
 returns an accounts entire search history
*/
api.get("/search/history", async(req,res)=>{

  let users = users_db.get("user_list").value();
  // invalid token - synchronous]
  let token = req.query.token;

  try {

    let info = jwt.verify(token, secureInfo.jwtsecret);
    let username = info.username;


    for(let i=0;i<users.length;i++){
      if(username == users[i].username){

        let search = users[i].searchHistory;

        let response = {
          search
        };
        return res.send(response);
      }
    }

  } catch(err) {
    let response = {
      "message": "wrong token"
    };
  return res.status(401).send(response);


}
})




/*
POST REQUEST
 to add a search query to the accounts' search history
*/
api.post("/search", async(req,res)=>{

  let users = users_db.get("user_list").value();
  let searchTerm = req.body.search;

  let token = req.body.token;

  // invalid token - synchronous
  try {

        let info = jwt.verify(token, secureInfo.jwtsecret);

        let username = info.username;

        for(let i=0;i<users.length;i++){
          if(username == users[i].username){


            var options = {
              method: 'GET',
              url: 'https://shazam.p.rapidapi.com/search',
              params: {term: searchTerm, locale: 'en-US', offset: '0', limit: '1'},
              headers: {
                'x-rapidapi-host': 'shazam.p.rapidapi.com',
                'x-rapidapi-key': secureInfo.key
              }
            };
              


              axios.request(options).then(function (response) {

                users[i].searchHistory.push({
                  "searchterm":searchTerm,
                  "result": response.data,
                  "time": Date.now()
                }
                );
              users_db.set("user_list", users).write();


                return res.send(response.data);
              }).catch(function (error) {
                return res.send(error)
              });
          
          }
        }

     } catch(err) {
  let response = {
    "message": "wrong token"
  };
  return res.status(401).send(response);

}

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
    return res.send(response.data);
  }).catch(function (error) {
    return res.send(error)
  });

})

/*
  POST: CREATE A NEW ACCOUNT

  Payload format:
  {
    "username": <string>
    "email":<string>
    "password":<string>
  }
*/
api.post("/createaccount", async(req,res)=>{

  let users = users_db.get("user_list").value();
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;

  for(let i=0;i<users.length;i++){
    if(username == users[i].username || email == users[i].email){
      let response ={
        "message":"email or username already exists"
      };
      return res.status(400).send(response);
    }

  }

  users_db.get("user_list").push({
    "username":username,
    "email":email,
    "password":password,
    "searchHistory": []
  }).write();


  let response = {
    "message":"success"
  };
  return res.send(response);

})




/*
  GET: CHECK IF ACCOUNT EXISTS USING USERNAME

  Params: username
*/
api.get("/accounts/username/:username", async(req,res)=>{

  let users = users_db.get("user_list").value();
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
  return res.status(404).send(response);

})





/*
  GET: CHECK IF ACCOUNT EXISTS USING EMAIL

  Params: email
*/
api.get("/accounts/email/:email", async(req,res)=>{

  let users = users_db.get("user_list").value();
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
  return res.status(404).send(response);

})







// ----------------------------------------------- ENDPOINTS -----------------------------------------------

//sets the port requests will be recieved at, and listens for requests
const PORT = 3000;
api.listen(PORT);
console.log("API is listening on PORT:" + PORT);
