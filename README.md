🍲 Smart Recipe Generator
The Smart Recipe Generator is designed to help users discover recipes using the ingredients they already have. The system accepts manual ingredient input and also supports automatic ingredient extraction from uploaded food images using the Clarifai API. Extracted and typed ingredients are cleaned, filtered, and matched against a predefined recipe database of 20+ diverse recipes. A custom recipe-matching algorithm checks for ingredient similarity, cooking time, difficulty, and dietary categories. Each recipe includes detailed steps and nutritional information such as calories and protein.

The application also includes serving size adjustment, favorite recipe saving, rating-based recommendations, and ingredient substitution suggestions. Users can filter recipes by cooking time, difficulty, and dietary preference. The UI is fully mobile-responsive with an intuitive layout, autocomplete ingredient input, loading states, error handling, and smooth transitions to improve user experience.

The project is built using React for the frontend, Node.js and Express for the backend, and Clarifai for AI-based ingredient recognition. It is deployed on Netlify/Vercel using free hosting services. The code follows a clean and modular structure for readability and maintenance.
📌 Features
✅ 1. User Input

Enter ingredients manually (autocomplete support).

Upload food images for automatic ingredient recognition (Clarifai API).

Choose dietary preferences: Vegetarian, Vegan, Gluten-Free, None.
✅ 2. Recipe Generation

Generates multiple recipes based on matching ingredients.

Includes step-by-step instructions.

Shows nutritional details like calories, protein, etc.

View recipe in a full-screen, beautiful UI with background image.
✅ 3. Filters & Customization

Filter recipes by:

Difficulty: Easy / Medium / Hard

Cooking Time: < 20 min / 20–40 min / > 40 min

Adjust serving sizes (+ / – buttons).
✅ 4. Recipe Database

Contains 20+ predefined recipes.

Each recipe includes:

Ingredients list

Instructions

Nutrition facts

Difficulty, cuisine, time

✅ 5. User Feedback

Add recipes to favorites ❤️

Remove from favorites

User-based personalized suggestions

Rating system for better recommendations
✅ 6. UI/UX

Clean and modern design

Fully mobile responsive

Autocomplete dropdown for ingredients

Smooth animations

🧠 Smart Suggestions

Suggests new recipes based on ingredient similarity to favorites
🧠 Technical Features
🔍 Ingredient Recognition

Uses Clarifai Image Recognition API to detect ingredients from uploaded photos.

🧮 Recipe Matching Logic

Converts both user ingredients & recipe ingredients to lowercase.

Matches based on ingredient intersections.

Ensures no duplicates.

Suggests best match first.

♻️ Ingredient Substitution

If an ingredient is missing, the app suggests common substitutes.

👨‍🍳 Detailed Recipe View

Step-by-step instructions

Nutrition calculator (changes with serving size)

Ingredient list with missing items

🛠 Tech Stack
Backend : Node.js+Express.js
Multer (file upload)
Clarifai API (image detection)
CORS
File-based storage (JSON files)
Frontend: React.js
Axios
Custom autocomplete
Dynamic UI with serving size, filtering, and rating

🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/yourusername/smart-recipe-generator.git
cd smart-recipe-generator

⚙️ Backend Setup
2️⃣ Install Dependencies
npm install express multer axios cors dotenv

3️⃣ Add .env File

Create a file named .env:

CLARIFAI_API_KEY=your_api_key_here
PORT=5000

4️⃣ Start Backend
node server.js

Backend runs at:

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

Identify ingredients from text/image and return matching recipes.

POST /api/favorite

Add recipe to favorites.

POST /api/remove-favorite

Remove recipe from favorites.

GET /api/favorites

Get saved favorite recipes.

GET /api/suggestions

Return AI-style suggestions based on similarity.

POST /api/rate

Save a rating for a recipe.

📸 Image Upload Notes

Uploaded images are stored in /uploads

Only used temporarily for recognition

Clarifai model used: general-image-recognition

📚 Recipe Source

All recipes stored in:

recipes.json


Each record contains:

name

ingredients

instructions

nutrition

rating

dietary type

difficulty

time

image URL

default servings

🤝 Contributing

Pull requests are welcome!

🛡 License

This project is open-source under MIT License.
