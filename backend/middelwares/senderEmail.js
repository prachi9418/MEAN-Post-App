const nodemailer = require("nodemailer");

exports.senderEmail = (email, link) => {
  let transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "7215a0b15877f0",
      pass: "085c339f1e7be0",
    },
  });

  let mailOptions = {
    from: "from@example.com",
    to: email,
    subject: "Email Confirmation",
    html: `<h1>Hello, ${email} </h1>
          <h4>Please confirm above link to confirm the user</h4><br>
          <a href='${link}'>Click here to verify</a>`,
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Email sent: " + info.response);
  });
};
