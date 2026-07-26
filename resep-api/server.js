const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function getRecipesData() {
    const response = await fetch("https://dummyjson.com/recipes?limit=50");
    if (!response.ok) {
        throw new Error("Gagal mengambil data dari dummyjson");
    }
    return response.json();
}

app.get(["/recipes", "/api/recipes"], async (req, res) => {
    try {
        const data = await getRecipesData();
        res.json(data);
    } catch (error) {
        console.error("API error:", error);
        res.status(500).json({
            message: "Gagal mengambil data API"
        });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
}

module.exports = app;