"use strict"

const mongoose = require("mongoose")

const db = mongoose.connect(process.env.DB, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
})


module.exports = db