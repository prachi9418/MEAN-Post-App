const User = require("../models/user");
const sender = require("../middelwares/senderEmail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateRandomChar = () => {
  let text = "";
  let char_list =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 16; i++) {
    text += char_list.charAt(Math.floor(Math.random() * char_list.length));
  }
  return text;
};

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
      hashedNumber: generateRandomChar(),
    });
    user
      .save()
      .then((result) => {
        const verifyLink =
          req.protocol +
          "://" +
          req.get("host") +
          "/api/users/verify?hashedNumber=" +
          result.hashedNumber;
        console.log(verifyLink);
        sender.senderEmail(result.email, verifyLink);
        res.status(200).json({
          message: "User Created Successfully",
          result: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Invalid User Credentials",
        });
      });
  });
};

exports.login = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "User is not authenticated",
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "User is not authenticated",
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id,
        isVerified: fetchedUser.isVerified,
      });
    })
    .catch((err) => {
      return res.status(401).json({
        message: "User is not authenticated",
      });
    });
};

exports.verify = (req, res, next) => {
  User.findOne({ hashedNumber: req.query.hashedNumber })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "User is not authorized",
        });
      }
      if (user.isVerified) {
        return res.status(200).json({
          message: "User is already verified!",
        });
      }

      user.isVerified = true;
      return user.save();
    })
    .then((user) => {
      // res.status(200).json({
      //   message: "User is verified successfully",
      // });
      res.redirect("http://localhost:4200/auth/login");
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: "User is not verified!",
      });
    });
};
