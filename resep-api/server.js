const express = require("express");

const app = express();

app.use(express.static("public"));

app.get("/recipes", async (req, res) => {
    try {
        const response = await fetch("https://dummyjson.com/recipes?limit=50");
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({
            message: "Gagal mengambil data API"
        });
    }
});

module.exports = app;
