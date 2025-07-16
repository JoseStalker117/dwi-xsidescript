const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const validator = require("validator");
const helmet = require("helmet");
const app = express();

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", "https://cdn.jsdelivr.net"],
    scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
    styleSrc: ["'self'", "https://cdn.jsdelivr.net"],
    imgSrc: ["'self'", "data:"]
  }
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
const db = new sqlite3.Database("./db/citasdb.sqlite");

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS comentarios (id INTEGER PRIMARY KEY, autor TEXT, contenido TEXT)");
});

app.get("/", (req, res) => {
    db.all("SELECT * FROM comentarios ORDER BY autor ASC", (err, rows) => {
        res.render("index", { comentarios: rows });
    });
});

app.post("/nuevo", (req, res) => {
    let { autor, contenido } = req.body;
    // Sanitización y validación
    autor = validator.escape(validator.trim(autor));
    contenido = validator.escape(validator.trim(contenido));
    if (!autor || !contenido) {
        return res.status(400).send("Datos inválidos");
    }
    db.run("INSERT INTO comentarios (autor, contenido) VALUES (?, ?)", [autor, contenido], () => {
        res.redirect("/");
    });
});

app.get("/buscar", (req, res) => {
    let autor = req.query.autor || "";
    autor = validator.escape(validator.trim(autor));
    db.all("SELECT * FROM comentarios WHERE autor LIKE ?", [`%${autor}%`], (err, rows) => {
        res.render("busqueda", { resultados: rows, autor: autor });
    });
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));