/*
  SHAZAM CLONE APP - BACKEND API
  Written by: Gabriel De Souza 

  Provided endpoints:
    - 

  TODO:
    - Add status codes in error messages
    - Add input validation (maybe JOI)
    - Look through endpoint TODOs. Fix responses.
*/



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\
 *                                                                                                         *
 *                                               DEPENDENCIES                                              *
 *                                                                                                         *
\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */ 

let express = require ("express");                //imports expressjs(expressjs is a framework which facilitates REST api)
let cors = require("cors");                       //Cors facilitates sending and receiving requests when they come from the same origin         
                                                  //Used when api is being tested on the same computer it was made on
var axios = require("axios").default;             //makes requests possible with shazam API
const low = require('lowdb')                      //local JSON based Database
const FileSync = require('lowdb/adapters/FileSync')
let secureInfo = require("./secureinfo.json");    //imports keys from other file
let jwt = require('jsonwebtoken');                //encryption, a jwt is a token used to verify a user
let api = express();                              //creates new express object

//User list ----------------------------------------- POTENTIALLY TEMPORARY
var users_db = low(new FileSync('users_db.json'));
users_db.defaults({
  user_list: []
}).write();


api.use(express.json());      //converts server response from text to json object
api.use(cors());              //activates cors



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\
 *                                                                                                         *
 *                                              REST ENDPOINTS                                             *
 *                                 (8 ENDPOINTS IN TOTAL, 1 SHAZAM RELATED)                                *
 *                                                                                                         *
\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */ 

/*
  [PUT] /accounts/signin
  {
    username: <string>,
    password: <string>
  }
  --------- Response ---------
  {
    message: <string>,
    token: <string>         // Depends on valid inputs
  }

  Description: sign in a user if they exist and if the password matches the username
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

});


// +--------+--------+--------+--------+--------+--------+--------+--------+--------+


/*
  [PUT] /accounts/checktoken
  {
    token: <string>
  }
  --------- Response ---------
  {
    message: <string>
  }

  Description: check if jwt token is correct
*/
api.put("/accounts/checktoken", async(req,res)=>{

  let token = req.body.token

  // invalid token - synchronous
  try {
    let info = jwt.verify(token, secureInfo.jwtsecret);


    // TODO: Fix this, message should always be a string
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
});


// +--------+--------+--------+--------+--------+--------+--------+--------+--------+


/*
  [PUT] /accounts/changepassword
  {
    token: <string>,
    oldpassword: <string>,
    newpassword: <string>
  }
  --------- Response ---------
  {
    message: <string>
  }

  Description: change password to a newer one
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

});


// +--------+--------+--------+--------+--------+--------+--------+--------+--------+


/*
  [GET] /search/history?token=<string>
  --------- Response ---------
  {
    message: <string>,
    // TODO: Fix response
  }

  Description: returns an accounts entire search history
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
});


// +--------+--------+--------+--------+--------+--------+--------+--------+--------+


/*
  [POST] /search
  {
    token: <string>
    search: <string>
  }
  --------- Response ---------
  {
    message: <string>,
    // TODO: Fix response
  }

  Description: to add a search query to the accounts' search history
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

});


// +--------+--------+--------+--------+--------+--------+--------+--------+--------+


/*
  [GET] /search?term=<string>
  --------- Response ---------
  {
    message: <string>,
    // TODO: Fix response
  }

  Description: returns a search result from a shazam search query
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

});


// +--------+--------+--------+--------+--------+--------+--------+--------+--------+


/*
  [POST] /createaccount
  {
    username: <string>
    email: <string>
    password: <string>
  }
  --------- Response ---------
  {
    message: <string>,
    // TODO: Fix response
  }

  Description: create a new account
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

});


// +--------+--------+--------+--------+--------+--------+--------+--------+--------+


/*
  [GET] /search/<username: string>
  --------- Response ---------
  {
    message: <string>
  }

  Description:
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
});


// +--------+--------+--------+--------+--------+--------+--------+--------+--------+


/*
  [GET] /search/<email: string>
  --------- Response ---------
  {
    message: <string>
  }

  Description:
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

});



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\
 *                                                                                                         *
 *                                             MAIN DRIVER CODE                                            *
 *                                                                                                         *
\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */ 

//sets the port requests will be recieved at, and listens for requests
const PORT = 3000;
api.listen(PORT);
console.log("API is listening on PORT:" + PORT);
