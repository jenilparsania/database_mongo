const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");
const {z} = require("zod");

// const JWT_SECRET = "s3cret";

const app = express();

app.use(express.json()); //for parsing the body in a post request

const {UserModel,TodoModel} = require("./db");
const { default: mongoose } = require("mongoose");
const {auth, JWT_SECRET } = require("./auth");
mongoose.connect("mongodb+srv://parsaniajenil:firstdb@cluster0.46eul.mongodb.net/hash_passwords");
// at the end of the / -> I had to enter the name of the database to create one , other wise , it was throwing an error 

app.post("/signup",async function(req,res){

    const requiredBody = z.object({
        email:z.string().min(3).max(100).email(),
        name:z.string().min(3).max(100),
        password:z.string().min(3).max(30),
    });

    const parsedDatawithSucess = requiredBody.safeParse(req.body);

    if(!parsedDatawithSucess.success){
        res.json({
            message: "Incorrect format",
            error:parsedDatawithSucess.error
        });

        return
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const hashedPassword = await bcrypt.hash(password,5);
    console.log(hashedPassword);
    let errorThrown = false;

    
    try{

        await UserModel.create({
            email:email,
            password:hashedPassword,
            name:name
        });
    }catch(e){
        res.json({
            message:"User Already Exists"
        });

        errorThrown = true;

    }

    if(!errorThrown){

        res.json({
            message: "you are signed up"
        });
    }
});


app.post("/signin",async function(req,res){
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email:email
    });

 
    if(!user){
        res.status(403).json({
            message:"user does not exist"
        });

        return

    }
    const passwordMatch = bcrypt.compare(password,user.password);
    // the compare function returns a promise so , it should be awaited
    

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




