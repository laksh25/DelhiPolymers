require('dotenv').config({ path: '.env' })

const Insta = require("instamojo-nodejs");
const API_KEY = process.env.API_KEY
const AUTH_KEY = process.env.AUTH_KEY
const fetch = require('node-fetch')

Insta.setKeys(API_KEY, AUTH_KEY);

Insta.isSandboxMode(true);

var useremail = ""
var username = ""
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
app.get("/ViewBuyers", (req, res) => {
    res.render("ViewBuyers")
})
app.get("/ViewQueryRequests", (req, res) => {
    res.render("ViewQueryRequests")
})

app.get("/UserProfile", async (req, res) => {
    try {
        const BR = await BuyerRegister.findOne({ email: useremail });
        console.log(BR.name)
        res.status(201).render("UserProfile",
            {
                userDetails: BR
            })

    } catch (error) {
        res.send("Error in loading profile")
    }
})

app.get("/PaymentRecords", async (req, res) => {
    try {
        const BR = await BuyerRegister.findOne({ email: useremail });
        console.log(BR.name)
        res.status(201).render("PaymentRecords",
            {
                userPaymentDetails: BR.payment
            })
    } catch (error) {
        res.send("Error in loading PaymentRecords")
    }
});

app.get("/ViewOrderRequests", async (req, res)=>{
    try{
        const cursor = await BuyerRegister.find({userType: "Customer"});
        // cursor.each(function(err, item){
        //     userPayment.push(item);
        // })
        console.log(cursor);
        res.status(201).render("ViewOrderRequests",{
            orderDetails : cursor
        })
    }catch(error){
        res.send("Error in loading ViewOrderRequests");
        console.log(error);
    }
});

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
                password: password,
                userType : "Customer"
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
        const email = req.body.Email;
        const pass = req.body.Password;
        const BR = await BuyerRegister.findOne({ email: email });

        if (BR.password === pass && BR.userType == "Customer") {
            useremail = BR.email;
            username = BR.name;
            console.log(useremail);
            console.log(username);
            console.log("Login Successful");
            res.status(201).render("Payment");
        }
        else if(BR.password === pass && BR.userType == "Admin"){
            console.log("Admin is in");
            res.status(201).render("ViewOrderRequests");
        }
        else {
            res.send("Invalid Details");
        }

    } catch (error) {
        res.send("Can't Login");
        console.log("Can't Login");
        console.log(error)
    }
});

app.post("/ContactUsLoggedIn", async (req, res)=>{
    try {
        console.log("Inside ContactUs",useremail)
        await BuyerRegister.updateOne({ 'email': useremail },
            {
                '$push': {
                    'contact': [{
                        query : req.body.query,
                        queryDate : new Date().toISOString().slice(0, 10),
                    }]
                }
            })
        console.log("Query Submitted")
        res.status(201).render("ContactUsLoggedIn");
    } catch (error) {
        res.status(400).send(error);
    }
});

//middleware err
// async function auth(req, res, next) {
//     try {
//         console.log(` Email inside middleware ${req.body.Email}`);
//         const email = req.body.Email;
//         const pass = req.body.Password;
//         const BR = await BuyerRegister.findOne({ email: email });
//         if (BR.password === pass) {
//             req.email = email
//         }
//         next();
//         return;
//     } catch (err) {
//         console.log("Error in middleware")
//     }
// }


app.post("/Payment", (req, res) => {

    console.log(useremail)
    console.log(req.body.price)

    var data = new Insta.PaymentData();

    const REDIRECT_URL = "http://localhost:8000/success";

    data.setRedirectUrl(REDIRECT_URL);
    data.send_email = "True";
    data.purpose = req.body.str;

    data.amount = req.body.price;
    data.email = useremail;

    Insta.createPayment(data, async function (error, response) {
        if (error) {
            console.log("Error in InstaMojo Payment post method")
        } else {
            console.log(response)

            try {
                await BuyerRegister.updateOne({ 'email': useremail },
                    {
                        '$push': {
                            'payment': [{
                                name : username,
                                email : useremail,
                                amount: req.body.price,
                                paidFor: req.body.str,
                                transactionDate:new Date().toISOString().slice(0, 10),
                                status: "Pending"
                            }]
                        }
                    })
                console.log("Payment details fetched in database")
            } catch (error) {
                res.status(400).send(error);
            }
            res.send("Please check your email to make payment")
        }
    });
})


app.get('/success', onsuccess ,async (req, res) => {
    res.send("Payment is successful, Please check your email for invoice")
})

async function onsuccess(req, res, next) {
    try {
        await BuyerRegister.updateOne({ 'email': useremail }, {
            '$push': {
                'payment': [{
                    status: "Successful"
                }]
            }
        })
        next();
    } catch (error) {
        console.log(error)
    }
}

app.listen(port, () => {
    console.log(`Sever is Running at: ${port}`);
});

