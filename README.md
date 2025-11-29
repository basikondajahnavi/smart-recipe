 🍲 Smart Recipe Generator
                                                    
The Smart Recipe Generator helps users discover recipes using the ingredients they already have.
It accepts manual ingredient input and also supports automatic ingredient extraction from uploaded food images using the Clarifai AI API.

The system cleans and filters all extracted & typed ingredients, matches them against a 20+ recipe database, and ranks the best recipe results based on ingredient similarity, cooking time, difficulty level, and dietary category.

Each recipe includes detailed steps, nutritional information, serving size adjustment, and smart suggestions.

Built with React (Frontend) + Node.js/Express (Backend) + Clarifai AI (Image Ingredient Detection).

✨ Features
✅ 1. User Input Options

Manual ingredient entry (with autocomplete)

Upload food images for automatic ingredient recognition

Dietary preference selection: Vegetarian, Vegan, Gluten-Free, None

✅ 2. Recipe Generation

Generates multiple recipe suggestions

Step-by-step cooking instructions

Includes detailed nutrition facts (calories, protein, etc.)

Beautiful full-screen recipe view with image & smooth UI

✅ 3. Filters & Customization

Filter recipes by:

Difficulty: Easy / Medium / Hard

Cooking Time: < 20 min / 20–40 min / > 40 min

Serving Size: Increase/decrease dynamically

✅ 4. Recipe Database

Includes 20+ curated recipes:

Complete ingredient lists

Cooking steps

Nutrition details

Difficulty, cuisine style, time

Default servings

✅ 5. User Feedback Features

Save recipes to favorites ❤️

Remove from favorites

Rating system for better suggestions

Personalized recipe recommendations

✅ 6. UI/UX Highlights

Clean modern design

Fully mobile responsive

Autocomplete ingredient dropdown

Smooth animations and transitions

Loading + error handling

🧠 Smart Features
🔍 AI Ingredient Recognition

Powered by Clarifai Image Recognition API

Automatically extracts ingredients from uploaded food images

🧮 Advanced Recipe Matching Logic

Converts ingredients to lowercase

Removes duplicates

Finds intersection between user ingredients & recipe ingredients

Ranks best matches first

♻️ Ingredient Substitution

Suggests alternatives when a required ingredient is unavailable.

👨‍🍳 Detailed Recipe View

Steps

Ingredients

Nutrition facts

Dynamic nutrition recalculation based on serving size

🛠 Tech Stack
Backend : Node.js + Express.js
Multer (image upload)
Clarifai API
CORS
JSON-based storage
Frontend : React.js
Axios
Custom Autocomplete
Responsive UI + smooth animations

🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/basikondajahnavi/smart-recipe-generator.git
cd smart-recipe-generator

⚙️ Backend Setup
2️⃣ Install Dependencies
npm install express multer axios cors dotenv

3️⃣ Create .env File
CLARIFAI_API_KEY=your_api_key_here
PORT=5000

4️⃣ Start Backend
node server.js


Backend will run at:

👉 http://localhost:5000

🎨 Frontend Setup
5️⃣ Install Frontend Dependencies
cd frontend
npm install

6️⃣ Start Frontend
npm start


Frontend runs at:

👉 http://localhost:3000

🔗 API Endpoints
POST /api/identify

Identify ingredients (text/image) + return matching recipes.

POST /api/favorite

Save a recipe to favorites.

POST /api/remove-favorite

Remove a recipe from favorites.

GET /api/favorites

Get user favorite recipes.

GET /api/suggestions

Smart AI-style recommendations.

POST /api/rate

Save a recipe rating.

📸 Image Upload Notes

Uploaded images stored in /uploads

Used only temporarily for ingredient recognition

Clarifai model used: general-image-recognition

📚 Recipe Source

All recipes stored in:

recipes.json


Each recipe contains:

name

ingredients

instructions

nutrition

rating

dietary type

difficulty

cooking time

image URL

default servings

🤝 Contributing

Pull requests are welcome!

🛡 License

This project is open-source under the MIT License.
