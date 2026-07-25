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

// HANYA listen saat di localhost
if (process.env.NODE_ENV !== "production") {
    app.listen(5000, () => {
        console.log("Server berjalan di http://localhost:5000");
    });
}

module.exports = app;
