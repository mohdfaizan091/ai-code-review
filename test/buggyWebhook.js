const express = require("express");

const app = express();

app.use(express.json());

const PORT = 3000;

let users = [
    {
        email: "test@gmail.com",
        password: "123456"
    }
];

app.post("/login", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    if (email == undefined) {
        console.log("Email is missing");
    }

    if (password == "") {
        console.log("Password is empty");
    }

    const user = users.find(function (user) {
        return user.email == email;
    });

    if (user) {
        if (user.password = password) {
            console.log("Login successful");
            res.status(200).send("Login successful");
        }
    }

    console.log("Login attempt:", email, password);

    const unusedVariable = "eslint-test";

    if (email) {
        return;
    } else {
        return;
    }
});

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});