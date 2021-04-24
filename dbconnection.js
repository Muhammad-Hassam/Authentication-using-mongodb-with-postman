const mongoose=require("mongoose");
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

var UserSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    tokens:[
        {
         token:{
            type:String,
            required:true
         }
        }
    ]
})

UserSchema.pre('save', async function(next){
    if(this.isModified){
        this.password=await bcrypt.hash(this.password,12);
    }
    next();
})
UserSchema.methods.generationAuthToken=async function(){
    try{
    let token=jwt.sign({_id:this._id},process.env.SECRET_KEY);
    this.tokens=this.tokens.concat({token:token});
    await this.save();
    return token;
    }
    catch(error){
       console.log(error);
    }
}

var User=mongoose.model("SIGNUP",UserSchema);
module.exports=User;