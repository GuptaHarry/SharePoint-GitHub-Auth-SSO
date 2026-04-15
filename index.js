
const axios = require("axios");
const express = require("express");
const app = express();
 require("dotenv").config();
const userStore = {};

console.log("Starting Server ....");

app.get("/", (req, res) => {
    console.log("Request Recieved");
  res.send("Server is running ");
});

app.get("/auth/github/callback" ,  async (req,res)=>{
  
    const code = req.query.code;
    console.log("code received");

 try{

   const tokenResponse  = await axios.post(
        "https://github.com/login/oauth/access_token" , {
            client_id : process.env.CLIENT_ID,
            client_secret : process.env.CLIENT_SECRET,
            code : code,
        },
        {
            headers : { Accept : "application/json"}
        }
    );

     const accessToken = tokenResponse.data.access_token;
     console.log(accessToken);

    // const accessTokenJWT = jsonwebtoken.sign(
    //     {access_token : accessToken},
    //     "my-key",
    //     { 
    //         expiresIn : "3h",
    //         algorithm : "HS384"
    //     }
    // );

     console.log("Redirecting to the sharpeotn");
  res.redirect(`https://dprprod.sharepoint.com/sites/HarikrishnaSPFxPractice/_layouts/15/workbench.aspx?token=${accessToken}`);
//  res.send("Success");
 }
 catch( error){
    console.log(error.response);
    res.send("Error occured");
 }   
});

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
  console.log("heelo");
});



