const express = require("express");
const userController = require("../controllers/users");

const router = express.Router();

router.post("/signup", userController.createUser);

router.post("/login", userController.login);

router.get("/verify", userController.verify);

module.exports = router;
