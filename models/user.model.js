const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
     firstname: { type: String, required: true},
    lastname: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true, select:false},
    tag: { type: String, sparse: true, unique: true},
    role: { type: String, enum:["user", "admin", "operator"]},

    accountNumber:{type: String, sparse: true, unique: true},
    balance:{type:Number, required:true, default:10000},
    proflePicture:{
        secure_url:{type:String},
        public_id:{type:String}
    }
    
}, {timestamps:true, strict:"throw"})

const UserModel = mongoose.model("User", userSchema)

module.exports = UserModel;