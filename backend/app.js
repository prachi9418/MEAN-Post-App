const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const postsRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const path = require("path");

const app = express();
mongoose
  .connect(
    //mongodb+srv://prachi:" +
    //process.env.AWS_ATLAS_PW +
    //"@cluster0.iojal.mongodb.net/node-angular?retryWrites=true&w=majority
    "mongodb+srv://prachi:" +
      process.env.AWS_ATLAS_PW +
      "@cluster0.iojal.mongodb.net/node-angular?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));
//app.use("/", express.static(__dirname,path.join("angular"))); static files for rendering script files

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/users", userRoutes);
/* app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "angular", "index.html"))
}); */

module.exports = app;
