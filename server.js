"use strict"

const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const cors = require("cors")

require("dotenv").config()
require("./dbConfig/dbConnect.js")



// app config 
const app = express()
const port = process.env.PORT || 8080

// App middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.use(cors({origin: 'http://localhost:3000', credentials: true}))

// App db Config
mongoose.connection.once("open", () => {
    console.log("MongoDb connected");
  });

// Api Routing
app.use("/auth", require("./routes/api"))

app.get("/", (req,res) => {
    res.status(200).send("Server up and Running")
})

// 404 error route page
app.use((req, res, next) => {
    res.status(404).type("text").send("Not Found");
  });



// listener
app.listen(port, () => {
    console.log(`Your app is listening on port ${port}`);
})