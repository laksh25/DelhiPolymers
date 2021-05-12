const mongoose= require('mongoose');

const BuyerInfoSchema= new mongoose.Schema({

    name: {
        type: String,
    },
    mobileNumber:{
        type: Number
    },
    email:{
        type: String,
        unique: true
    },
    companyAddress: {
        type: String
    },
    pincode:{
        type:Number
    },
    password:{
        type: String
    }
})

const BuyerRegister = new mongoose.model("BuyerRegister", BuyerInfoSchema );
module.exports=BuyerRegister;