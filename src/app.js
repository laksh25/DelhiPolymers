if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: '.env' })
}

// const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
// const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
// const fs= require('fs')

// const stripe= require('stripe')(stripeSecretKey)
const Insta = require("instamojo-nodejs");
const API_KEY = process.env.API_KEY
const AUTH_KEY = process.env.AUTH_KEY

Insta.setKeys(API_KEY, AUTH_KEY);

Insta.isSandboxMode(true);

var useremail = ""

const express = require('express');
const path = require('path');
const hbs = require('hbs');


const app = express();
const port = process.env.PROCESS || 8000;

require('./db/conn');
const BuyerRegister = require("./models/register");

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");


app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(express.static(static_path));
app.set("view engine", "hbs");

app.set("views", template_path);
hbs.registerPartials(partials_path);


app.get("/", (req, res) => {
    res.render("index");
});

app.get("/ContactUs", (req, res) => {
    res.render("ContactUs");
})

app.get("/Register", (req, res) => {
    res.render("Register");
})

app.get("/Login", (req, res) => {
    res.render("Login");
})

app.get("/Payment", (req, res) => {
    res.render("Payment")
})

// app.get("/Purchase",(req,res)=>{
//     res.send("I am purchase")
// })

app.get("/ContactUsLoggedIn", (req, res) => {
    res.render("ContactUsLoggedIn");
})

app.post("/Register", async (req, res) => {
    try {
        const password = req.body.Password;
        const cpass = req.body.cPassword;

        if (password === cpass) {
            const registerBuyer = new BuyerRegister({

                name: req.body.Name,
                mobileNumber: req.body.MobileNumber,
                email: req.body.Email,
                companyAddress: req.body.Address,
                pincode: req.body.Pincode,
                password: password
            })


            const registered = await registerBuyer.save();
            console.log("Registration Successful");
            res.status(201).render("Login");
        }
        else {
            res.send("Pass are not Matching");
        }

    } catch (error) {
        console.log("Can't Register");
        res.status(400).send(error);
    }
})


app.post("/Login", async (req, res) => {
    try {
        const pass = req.body.Password;
        const BR = await BuyerRegister.findOne({ password: pass });

        if (BR.password === pass) {
            useremail = BR.email;
            console.log(useremail)
            console.log("Login Successful");
            res.status(201).render("Payment");
        }
        else {
            res.send("Invalid Details");
        }


    } catch (error) {
        res.send("Can't Login");
        console.log("Can't Login");
    }
});

// app.post("/Purchase", (req,res)=>{
//     fs.readFile('items.json', function(error,data){
//         if(error){
//             console.log("items.json read file error")
//             res.status(500).end()
//         }else{
//             console.log("Purchase")
//             const itemsJson =JSON.parse(data)
//             const itemsArray= itemsJson.pvcCompound.concat(itemsJson.burada)

//             let total=0
//             req.body.items.forEach(function(item){
//                 const itemJson= itemsArray.find(function(i){
//                     return i.id==item.id
//                 })
//                 total= total + itemJson.price * item.quantity
//             })

//             stripe.charges.create({
//                 amount:total,
//                 source: req.body.stripeTokenId,
//                 currency:'INR'
//             }).then(function(){
//                 console.log("charge successful")
//                 res.json({message: 'Successfully purchased Items'})
//             }).catch(function(){
//                 console.log("Charge Failed")
//                 res.status(500).end()
//             })
//         }
//     })
// })

app.post("/Payment", (req, res) => {
    console.log(useremail)
    console.log(req.body.price)

    var data = new Insta.PaymentData();

    const REDIRECT_URL = "http://localhost:8000/success";

    data.setRedirectUrl(REDIRECT_URL);
    data.send_email = "True";
    data.purpose = "Buy Goods from Delhi Polymers"; 

    data.amount=req.body.price
    data.email=useremail

    Insta.createPayment(data, function (error, response) {
        if (error) {
          console.log("Error in InstaMojo Payment post method")
        } else {
          // Payment redirection link at response.payment_request.longurl
          console.log(response)
          res.send("Please check your email to make payment")
        }
      });
})

app.get('/success',(req,res)=>{
    res.send("Payment is successful, Please check your email for invoice")
})

app.listen(port, () => {
    console.log(`Sever is Running at: ${port}`);
});

