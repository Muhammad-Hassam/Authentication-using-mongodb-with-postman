const jwt = require('jsonwebtoken');
const User = require('../dbmodels/authuser');
const dotenv=require('dotenv');

dotenv.config({path:"../config.env"})
const Authentication = async (req, res, next) => {
    
    try {
        const token = req.cookies.jwtoken;
        const vToken = jwt.verify(token, process.env.SECRET_KEY);
        const profile = await User.findOne({ _id: vToken._id, "tokens.token": token });
        if (!profile) {
            console.log("User is not valid")
        }
        else {
            req.token = token;
            req.profile = profile;
            req.ID = profile._id;
            next();
        }

    }
    catch (err) {
        res.status(400).send("Invalid User");
        console.log(err)
    }
}
module.exports = Authentication;