const express = require("express");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "s3cret";

const app = express();

app.use(express.json()); //for parsing the body in a post request

const {UserModel,TodoModel} = require("./db");
const { default: mongoose } = require("mongoose");
mongoose.connect("mongodb+srv://parsaniajenil:firstdb@cluster0.46eul.mongodb.net/firsttime");
// at the end of the / -> I had to enter the name of the database to create one , other wise , it was throwing an error 

app.post("/signup",async function(req,res){

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    await UserModel.create({
        email:email,
        password:password,
        name:name
    });

    res.json({
        message: "you are logged in"
    });
});


app.post("/signin",async function(req,res){
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email:email,
        password:password
    });

    console.log(user);
    

    if(user){
        const token = jwt.sign({
            id:user._id.toString()
        },JWT_SECRET);

        res.json({
            token:token
        })
    }else{
        res.status(403).json({
            message:"Incorrect credentials"
        });
    }
});

// creating an auth middleware
async function auth(req,res,next){
   
    const token = req.headers.token;

    const response = jwt.verify(token,JWT_SECRET);
    //  here the response would be equal to the 'token' in the "signin" endpoint function

    if(response){
        req.userId = response.id;
        next();
    }else{
        res.status(403).json({
            message:"Incorrect creds"
        });
    }

}

app.post("/todo",auth,async function(req,res){
    // as the authentication is done , we would proceed now 
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;

    await TodoModel.create({
        userId:userId,
        title:title,
        done:done
    });

    res.json({
        message:"Todo Added"
    });

});

app.get("/todos",auth,async function(req,res){
    const userId = req.userId;

    const UserInformation = await TodoModel.find({
        userId
    });

    // if we want to return only todos ? 

    res.json({
        UserInformation
    });
});

app.listen(3000);




