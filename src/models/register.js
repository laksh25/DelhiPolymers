const mongoose= require('mongoose');

const ContactUsQuery = new mongoose.Schema({
    query:{
        type: String
    },
    queryDate:{
        type: String
    }
})

const paymentSchema= new mongoose.Schema({
    name:{
        type: String
    },
    email:{
        type: String,
        unique: true
    },
    amount:{
        type:Number
    },
    paidFor:{
        type:String
    },
    status:{
        type:String
    },
    transactionDate:{
        type:String
    }
})

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
    userType: {
        type: String
    },
    pincode:{
        type:Number
    },
    password:{
        type: String
    },
    payment:{
        type:[paymentSchema]
    },
    contact:{
        type:[ContactUsQuery]
    }
})

const BuyerRegister = new mongoose.model("BuyerRegister", BuyerInfoSchema );
module.exports=BuyerRegister;