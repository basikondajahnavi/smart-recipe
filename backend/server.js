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
app.get("/", (req, res) => res.send("Smart Recipe Generator Backend 🚀"));

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

// ----------------- SUGGESTIONS -----------------
app.get("/api/suggestions", (req, res) => {
  try {
    const recipes = JSON.parse(fs.readFileSync(RECIPES_FILE, "utf-8"));
    let favorites = [];
    if (fs.existsSync(FAVORITES_FILE)) favorites = JSON.parse(fs.readFileSync(FAVORITES_FILE, "utf-8"));
    let ratings = {};
    if (fs.existsSync(RATINGS_FILE)) ratings = JSON.parse(fs.readFileSync(RATINGS_FILE, "utf-8"));

    const favoriteRecipes = recipes.filter((r) => favorites.includes(r.id));

    let suggestedRecipes = [];
    favoriteRecipes.forEach((fav) => {
      const similar = recipes
        .filter((r) => !favorites.includes(r.id))
        .map((r) => {
          const common = r.ingredients.filter((i) => fav.ingredients.includes(i));
          return { ...r, commonCount: common.length, rating: ratings[r.id] || 0 };
        })
        .filter((r) => r.commonCount > 0);
      suggestedRecipes.push(...similar);
    });

    const unique = [];
    const ids = new Set();
    suggestedRecipes.forEach((r) => {
      if (!ids.has(r.id)) {
        ids.add(r.id);
        unique.push(r);
      }
    });

    unique.sort((a, b) => b.commonCount - a.commonCount || b.rating - a.rating);

    res.json({ suggestions: unique.slice(0, 5) });
  } catch (err) {
    console.error("Error fetching suggestions:", err);
    res.status(500).json({ error: "Error fetching suggestions" });
  }
});

// ----------------- RATINGS -----------------
app.post("/api/rate", (req, res) => {
  const { recipeId, rating } = req.body;
  if (!recipeId || rating == null) return res.status(400).json({ error: "Missing data" });

  let ratings = {};
  if (fs.existsSync(RATINGS_FILE)) ratings = JSON.parse(fs.readFileSync(RATINGS_FILE, "utf-8"));

  ratings[recipeId] = rating;
  fs.writeFileSync(RATINGS_FILE, JSON.stringify(ratings, null, 2));

  res.json({ success: true });
});

// ----------------- MATCH RECIPES -----------------
function matchRecipes(userIngredients, dietary, difficulty) {
  const data = JSON.parse(fs.readFileSync(RECIPES_FILE, "utf-8"));

  // Filter by dietary and difficulty
  let filtered = dietary !== "none" ? data.filter((r) => r.dietary === dietary) : data;
  if (difficulty !== "none") filtered = filtered.filter((r) => r.difficulty === difficulty);

  // Calculate match % and missing ingredients
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

  // Sort by matchPercentage descending
  scored.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return scored.slice(0, 10); // return top 10 matches
}

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
