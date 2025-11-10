const https = require("https");
const fs = require("fs");
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;
const JWT_SECRET = "secret_key_for_demo";
let user = { id: 1, name: "Alice", deleted: false };

// Sets JWT in cookie with SameSite=None
app.get("/login", (req, res) => {
  const token = jwt.sign({ sub: user.id, name: user.name }, JWT_SECRET, { expiresIn: "1h" });

  res.cookie("authToken", token, {
    httpOnly: true, // cookie cannot be accessed via JavaScript
    secure: true, // cookie is only sent over HTTPS
    sameSite: "None", // cross-site requests allowed
    maxAge: 1000 * 60 * 60,
  });

  user.deleted = false;
  res.send(`
    <h1>Bank (JWT over HTTPS, VULN)</h1>
    <p>Welcome, ${user.name}</p>
    <p>Deleted? <b>${user.deleted}</b></p>
    <form action="/forget" method="POST">
      <button type="submit">Delete my account (legit)</button>
    </form>
    <p>Open attacker demo on http://localhost:5000 (same browser) to trigger attack.</p>
  `);
});

app.post("/forget", (req, res) => {
  const token = req.cookies.authToken;
  if (!token) return res.status(401).send("No token, please login.");

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload && payload.sub === user.id) {
      user.deleted = true;
      return res.send(
        `<h1>Account Deleted (VULN)</h1><p>${user.name} deleted</p><a href="/login">Reset</a>`
      );
    } else {
      return res.status(403).send("Invalid token payload.");
    }
  } catch (e) {
    return res.status(401).send("Invalid or expired token.");
  }
});

app.get("/", (req, res) => res.send(`<p>Bank demo. Go to <a href="/login">/login</a></p>`));

// HTTPS server: cert.pem, key.pem
const options = {
  key: fs.readFileSync("./server.pem"),
  cert: fs.readFileSync("./server.cert"),
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`Bank (HTTPS, vuln) running at https://localhost:${PORT}`);
});
