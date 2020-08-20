const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
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
      });
    })
    .catch((err) => {
      return res.status(401).json({
        message: "User is not authenticated",
      });
    });
};
