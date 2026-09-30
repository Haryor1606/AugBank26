const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserModel = require("../models/user.model");
const AccountModel = require("../models/account.model");
const nodemailer = require("nodemailer");
const cloudinary = require ("cloudinary").v2
const app = express();

cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  cloud_key:process.env.CLOUD_KEY,
  cloud_secret:process.env.CLOUD_SECRET
})


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASS,
  },
});

const registerUser = async (req, res) => {
  const { firstname, lastname, email, password, tag, photo } = req.body;
  try {
    const saltround = await bcrypt.genSalt(10);
    const number = `${Math.ceil(Math.random() * 1000000)}`.padStart(7, "0");
    const generatedAccount = `AUG${number}`;

    const hashedPassword = await bcrypt.hash(password, saltround);

    const image = await cloudinary.uploader.upload(photo,{resource_type: "image"})
    const user = await UserModel.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      tag,
      accountNumber: generatedAccount,
      proflePicture:{
        secure_url:image.secure_url,
        public_id:image.public_id
      }
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "10m", algorithm: "HS256" },
    );

    let mailOptions = {
      from: process.env.APP_EMAIL,
      to: [
        "hassanabdulfatai06@gmail.com",
        "trustykolawole@gmail.com",
        "Oderinuisrael@gmail.com",
        "oyewolesamuel632@gmail.com",
        "alatisetimothy@gmail.com",
      ],
      subject: `Welcome to AugBank ${firstname}`,
      text: `Welcome to AugBank where transaction is made easy, your account number is ${user.accountNumber}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(201).send({
      message: "User created successfully",
      data: {
        firstname,
        lastname,
        email,
        tag: tag ? tag : null,
        accountNumer: generatedAccount,
        token,
        balance:user.balance,
        photo:user.profilePicture.secure_url
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send({
        message: "Email or tag already exist",
      });
    } else {
      res.status(400).send({
        message: "User cannot be created at this time",
      });
    }
  }
};

const registerOperator = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  try {
    const saltround = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltround);

    const user = await UserModel.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role: "operator",
    });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "10m", algorithm: "HS256" },
    );

    res.status(201).send({
      message: "Operator created successfully",
      data: {
        firstname,
        lastname,
        email,

        token,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send({
        message: "Email or tag already exist",
      });
    } else {
      res.status(400).send({
        message: "Operator cannot be created at this time",
      });
    }
  }
};

const getUser = async (req, res) => {
  const { id, role } = req.user;
  try {
    if (role !== "admin" && role !== "operator") {
      //(role == "user"){}
      res.status(403).send({
        message: "not possible",
      });

      return;
    }
    const users = await UserModel.find();
    res.status(200).send({
      message: "all users fetched successfully",
      data: users,
    });
  } catch (err) {
    res.status(400).send({
      message: "cannot fetch users at this time",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isUser = await UserModel.findOne({ email }).select("+password");

    if (!isUser) {
      res.status(400).send({
        message: "account does not exist",
      });

      return;
    }

    const isMatch = await bcrypt.compare(password, isUser.password);

    if (!isMatch) {
      res.status(400).send({
        message: "invalid credentials",
      });

      return;
    }

    const token = jwt.sign(
      { id: isUser._id, role: isUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "10m", algorithm: "HS256" },
    );

    res.status(200).send({
      message: "login successful",
      data: {
        firstname: isUser.firstname,
        lastname: isUser.lastname,
        email: isUser.email,
        role: isUser.role,
        tag: isUser.tag,
        token,
      },
    });
  } catch (err) {
    res.status(400).send({
      message: "invalid credentials",
    });
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers["authorization"].split(" ")[1]
      ? req.headers["authorization"].split(" ")[1]
      : req.headers["authorization"].split(" ")[0];

    const user = await jwt.verify(
      token,
      process.env.JWT_SECRET,
      function (err, decoded) {
        if (err) {
          res.status(401).send({
            message: "User unauthorized",
          });
          return;
        }

        req.user = decoded;
        console.log(decoded);

        next();
      },
    );
  } catch (error) {
    console.log(error);

    res.status(401).send({
      message: "User unauthorized",
    });
    return;
  }
};

const loginOperator = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isUser = await UserModel.findOne({ email }).select("+password");

    if (!isUser || isUser.role !== "operator") {
      res.status(400).send({
        message: "operator account does not exist",
      });

      return;
    }

    const isMatch = await bcrypt.compare(password, isUser.password);

    if (!isMatch) {
      res.status(400).send({
        message: "invalid credentials",
      });

      return;
    }

    const token = jwt.sign(
      { id: isUser._id, role: isUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "10m", algorithm: "HS256" },
    );

    res.status(200).send({
      message: "login successful",
      data: {
        firstname: isUser.firstname,
        lastname: isUser.lastname,
        email: isUser.email,
        role: isUser.role,

        token,
      },
    });
  } catch (err) {
    res.status(400).send({
      message: "invalid credentials",
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send({
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (err) {
    res.status(400).send({
      message: "Cannot fetch profile at this time",
    });
  }
};

const resolveAccount = async (req, res) => {
  const { accountNumber } = req.params;
  try {
    const user = await UserModel.findOne({ accountNumber });

    if (!user) {
      return res.status(404).send({
        message: "cannot resolve account number",
      });
    }

    res.status(200).send({
      message: "account retrieved",
      data: {
        accountname: user.firstname + " " + user.lastname,
        tag: user.tag ? user.tag : null,
        id: user._id,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      message: "cannot resolve account number",
    });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;
  const { firstname, lastname } = req.body;
  try {
    if (role !== "operator" && role !== "admin") {
      return res.status(403).send({
        message: "forbidden Resource",
      });
    }

    const allowUpdate = {
      ...(firstname && { firstname: firstname.trim() }),
      ...(lastname && { lastname: firstname.trim() }),
    };

    const updateUser = await UserModel.findByIdAndUpdate(id, allowUpdate, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!updatedUser) {
      return res.status(400).send({
        message: "cannot update user at this time",
      });
    }

    res.status(200).send({
      mesage: "User Update Sucessfully",
      data: updateUser,
    });
  } catch (error) {
    res.status(500).send({
      message: "User cannot be updated at this time",
    });
  }
};

module.exports = {
  registerUser,
  registerOperator,
  getUser,
  loginUser,
  loginOperator,
  verifyUser,
  getUserProfile,
  updateUser,
  resolveAccount,
};

//Assignment: Update User,

// a user suppose to fecth thier own infomation
