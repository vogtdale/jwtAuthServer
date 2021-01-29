"use strict";

const app = require("express").Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../model.js")


// Register a user 
app.post("/api/adduser", async (req,res) => {
  
  try {
    const {email, pwd, pwdVerified} = req.body
    if (!email || !pwd || !pwdVerified) {
      return res
        .status(400)
        .send({error: "Please enter all required filed(s)."})
    }

    if (pwd.length < 6) {
      return res
        .status(400)
        .send({error: "Password can not be less than 6 characters."})
    }

    if (pwd !== pwdVerified) {
      return res
        .status(400)
        .send({error: "please enter the same password Twice."})
    }

    //check for an existing user with same email 

    const doesUSerExist = await User.findOne({ email})

    if (doesUSerExist) {
      return res
        .status(400)
        .send({error: "An account with this email already exists."})
    }

    // in order to hash the password it first needs to be salted
    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(pwd, salt)
    // console.log(passwordHash);

    // save a new user account to db
    const user = new User({
      email,
      passwordHash
    })
    const savedUser = await user.save()

    // create the token 
    const token = jwt.sign({
      user: savedUser._id
    }, process.env.JWT_SECRET)
    

    // send token in a HTTPOnly cookie
    res.cookie("authtoken", token, {
      httpOnly: true,
    })
    .send()
    
  } catch (err) {
    console.log(err);
    res.status(500).send()
    
  }

})

// log the user in 

app.post("/login", async (req,res) => {
  try {

    const {email, pwd} = req.body

    // validation 
    if (!email || !pwd) {
      return res
        .status(400)
        .send({error: "Please enter all required filed(s)."})
    }

    const existingUser = await User.findOne({email})
    if(!existingUser) {
      return res
        .status(401)
        .send({error: "Wrong email or password."})
    }

    const ispwdCorrect = await bcrypt.compare
    (
      pwd,
      existingUser.passwordHash
    )

    if(!ispwdCorrect) {
      return res
        .status(401)
        .send({error: "Wrong email or password."})
    }

     // create the token 
     const token = jwt.sign({
      user: existingUser._id
    }, process.env.JWT_SECRET)
    

    // send token in a HTTPOnly cookie
    res.cookie("authtoken", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 5000)
    })
    .send()
    

    
  } catch (err) {
    console.log(err);
    res.status(500).send()
    
  }

})

app.get("/logout", (req,res) => {
  res.cookie("authtoken", "", {
    httpOnly: true,
    expires: new Date(0)
  })
  .send()
})

module.exports = app