const express=require('express');
const app=express();
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const User=require("./dbconnection");
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');



// ================  Database Connection  ====================//

dotenv.config({path:'./config.env'});
const dbs=process.env.DATABASE;
const port=process.env.PORT;

mongoose.connect(dbs,{useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on('connected', function() {
    console.log("Mongoose is connected");
});

mongoose.connection.on('disconnected', function() {
    console.log("Mongoose is disconnected");
    process.exit(1);
});

mongoose.connection.on('error', function(err) {
    console.log('Mongoose connection error: ', err);
    process.exit(1);
});

process.on('SIGINT', function() {
    console.log("app is terminating");
    mongoose.connection.close(function() {
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});

// ====================== Server  =============================//


// ====================== Rest APIs  =============================//
app.post('/signup',(req,res)=>{
    const {name,email,password,age,bloodgroup,gender,phone,imageURL}=req.body;
    if(!name || !email || !password || !age || !bloodgroup || !gender || !phone){
      return res.status(422).json({error:"Kindly fill all the fields"});
    }
    else{
        User.findOne({email:email}).then((userExist)=>{
            if(userExist){
            return res.status(422).json({error:"Email exist"});
            }
           else{
            const user=new User({name,email,password,age,bloodgroup,gender,phone,imageURL});
            user.save().then(()=>{
                res.status(201).json({message:"User register"})
            })
            .catch((err)=>{res.status(500).json({err:"Registration failed"})})
            console.log(user);
           }
        })
        .catch(err=> {console.log(err)})
    }
})


app.post('/login',async(req,res)=>{
    try{
        const{email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({error:"Kindly fill all the fields"});
        }
        else{
            const login= await User.findOne({email:email});
            if(login){
                const passMatch=bcrypt.compare(password,login.password);
              const token= await login.generationAuthToken();
               console.log(token)
                res.cookie("jwtoken",token,{
                    expires:new Date(Date.now()+86400000),
                    httpOnly:true,
                })
            console.log(login.name,login.age);
            
             if(!passMatch){
            res.status(400).send({error:"Invalid User"})

            // res.status(400).json({error:"Invalid User"})
             }
             else{
            res.send({message:"Login successfully"})
            res.json(login);

            // res.json({message:"Login successfully"})

             }   
            }
            else{
                res.status(400).json({error:"Invalid data"})
            }
        }
    }
    catch(err){
          res.json({err:"Operations Failed"})
    }
})


// ====================== PORT listening =======================//
app.listen(port,()=>{
    console.log("server is running");
})