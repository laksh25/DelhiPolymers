const express = require('express');
const path=require('path');
const hbs= require('hbs');


const app=express();
const port= process.env.PROCESS || 8000;

require('./db/conn');
const BuyerRegister= require("./models/register");


const static_path= path.join(__dirname,"../public");
const template_path= path.join(__dirname,"../templates/views");
const partials_path= path.join(__dirname,"../templates/partials");


app.use(express.json());
app.use(express.urlencoded({extended: false}));


app.use(express.static(static_path));
app.set("view engine","hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);


app.get("/", (req,res)=>{
    res.render("index");
});

app.get("/ContactUs",(req,res)=>{
    res.render("ContactUs");
})

app.get("/Register",(req,res)=>{
    res.render("Register");
})

app.get("/Login", (req,res)=>{
    res.render("Login");
})

app.get("/Payment", (req,res)=>{
    res.render("Payment");
})

app.get("/ContactUsLoggedIn", (req,res)=>{
    res.render("ContactUsLoggedIn");
})

app.post("/Register", async (req,res)=>{
    try{
        const password= req.body.Password;
        const cpass= req.body.cPassword;

        if(password===cpass){
            const registerBuyer= new BuyerRegister({

                name: req.body.Name,
                mobileNumber: req.body.MobileNumber,
                email:req.body.Email,
                companyAddress:req.body.Address,
                pincode:req.body.Pincode,
                password:password
            })

            
            const registered = await registerBuyer.save();
            console.log("Registration Successful");
            res.status(201).render("Login");
        }
        else{
            res.send("Pass are not Matching");
        }

    }catch(error){
        console.log("Can't Register");
        res.status(400).send(error);
    }
})


app.post("/Login", async (req,res)=>{
    try{
        const pass= req.body.Password;
        const BR= await BuyerRegister.findOne({password: pass})

        if(BR.password === pass){
            console.log("Login Successful");
            res.status(201).render("Payment");
        }
        else{
            res.send("Invalid Details");
        }


    }catch(error){
        res.send("Can't Login");
        console.log("Can't Login");
    }
});

app.listen(port, ()=>{
    console.log(`Sever is Running at: ${port}`);
});

