const express = require("express");
const {
  registerUser,
  getUser,
  registerOperator,
  loginOperator,
  verifyUser,
  loginUser,
  updateUser,
  resolveAccount,
} = require("../controller/user.controller");
const router = express.Router();

router.post("/register", registerUser);
router.post("/register/operator", registerOperator);
router.get("/getuser", verifyUser, getUser);
router.post("/loginOperator", loginOperator);
router.post("/MyDetails", verifyUser);
router.post("/loginUser", loginUser);
router.patch("/user/:id", verifyUser, updateUser);  
router.get("/user/:accountNumber", verifyUser,resolveAccount)

module.exports = router;

//create function for operator andr
//login, register, fetch user login details
