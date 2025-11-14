require("dotenv").config();
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY;
const FAVORITES_FILE = "favorites.json";
const RECIPES_FILE = "recipes.json";
const RATINGS_FILE = "ratings.json";

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ----------------- TEST -----------------
app.get("/api", (req, res) => res.send("Backend Working 🚀"));

// ----------------- IDENTIFY -----------------
app.post("/api/identify", upload.single("image"), async (req, res) => {
  try {
    let ingredients = [];
    const dietary = req.body.dietary || "none";
    const difficulty = req.body.difficulty || "none";

    if (req.body.ingredients) {
      ingredients = req.body.ingredients
        .split(",")
        .map((i) => i.trim().toLowerCase())
        .filter(Boolean);
    }

    if (req.file) {
      const imageBase64 = fs.readFileSync(req.file.path, { encoding: "base64" });
      const response = await axios.post(
        "https://api.clarifai.com/v2/models/general-image-recognition/versions/aa7f35c01e0642fda5cf400f543e7c40/outputs",
        { inputs: [{ data: { image: { base64: imageBase64 } } }] },
        { headers: { Authorization: `Key ${CLARIFAI_API_KEY}`, "Content-Type": "application/json" } }
      );

      const detected = response.data.outputs[0].data.concepts
        .map((c) => c.name.toLowerCase())
        .slice(0, 5);

      ingredients = [...new Set([...ingredients, ...detected])];
    }

    if (ingredients.length === 0) {
      return res.status(400).json({ error: "No ingredients provided" });
    }

    const recipes = matchRecipes(ingredients, dietary, difficulty);
    res.json({ ingredients, recipes });
  } catch (err) {
    console.error("Error generating recipes:", err.response?.data || err.message);
    res.status(500).json({ error: "Error generating recipes" });
  }
});

// ----------------- FAVORITES -----------------
app.post("/api/favorite", (req, res) => {
  const { recipeId } = req.body;
  if (!recipeId) return res.status(400).json({ error: "Missing recipeId" });

  let favorites = [];
  if (fs.existsSync(FAVORITES_FILE)) favorites = JSON.parse(fs.readFileSync(FAVORITES_FILE, "utf-8"));

  if (!favorites.includes(recipeId)) favorites.push(recipeId);
  fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2));
  res.json({ success: true });
});

app.post("/api/remove-favorite", (req, res) => {
  const { recipeId } = req.body;
  if (!recipeId) return res.status(400).json({ error: "Missing recipeId" });

  let favorites = [];
  if (fs.existsSync(FAVORITES_FILE)) favorites = JSON.parse(fs.readFileSync(FAVORITES_FILE, "utf-8"));

  favorites = favorites.filter((id) => id !== recipeId);
  fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2));
  res.json({ success: true });
});

app.get("/api/favorites", (req, res) => {
  try {
    const recipes = JSON.parse(fs.readFileSync(RECIPES_FILE, "utf-8"));
    let favorites = [];
    if (fs.existsSync(FAVORITES_FILE)) favorites = JSON.parse(fs.readFileSync(FAVORITES_FILE, "utf-8"));
    let ratings = {};
    if (fs.existsSync(RATINGS_FILE)) ratings = JSON.parse(fs.readFileSync(RATINGS_FILE, "utf-8"));

    const favoriteRecipes = recipes
      .filter((r) => favorites.includes(r.id))
      .map((r) => ({ ...r, rating: ratings[r.id] || 0 }));

    res.json({ favorites: favoriteRecipes });
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ error: "Error fetching favorites" });
  }
});

// ----------------- MATCH RECIPES -----------------
function matchRecipes(userIngredients, dietary, difficulty) {
  const data = JSON.parse(fs.readFileSync(RECIPES_FILE, "utf-8"));

  let filtered = dietary !== "none" ? data.filter((r) => r.dietary === dietary) : data;
  if (difficulty !== "none") filtered = filtered.filter((r) => r.difficulty === difficulty);

  const scored = filtered.map((r) => {
    const recipeIngredientsLower = r.ingredients.map((i) => i.toLowerCase());
    const matchedIngredients = userIngredients.filter((ui) => recipeIngredientsLower.includes(ui));
    const missingIngredients = recipeIngredientsLower.filter((ri) => !userIngredients.includes(ri));
    const matchPercentage = Math.round((matchedIngredients.length / recipeIngredientsLower.length) * 100);

    return {
      ...r,
      matchedIngredients,
      missingIngredients,
      matchPercentage,
    };
  });

  scored.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return scored.slice(0, 10);
}

// ----------------- FRONTEND SERVE -----------------

// Serve React build folder
app.use(express.static(path.join(__dirname, "build")));

// Any unknown route → send React index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
