# SmartBite: Ingredient-Based Recipe Generator

SmartBite is a modern, AI-powered web application that allows users to enter ingredients they currently have and generates the best possible recipes using a custom greedy search algorithm.

## Features Let's Cook!
- **Greedy Match Algorithm**: Maximize ingredient utility while minimizing waste.
- **Smart Natural Language Processing**: Uses NLTK to normalize and stem ingredient queries.
- **Modern UI**: Full dark/light mode, smooth Framer Motion animations, interactive tags.
- **Favorites & History**: Local storage integration for saving best recipes and recent searches.
- **"Surprise Me"**: Generates a random recipe for adventurous cooks.

## Project Structure

```text
recipe-generator/
│
├── backend/                  # FastAPI Python Backend
│   ├── app.py                # Main API Endpoints
│   ├── requirements.txt      # Python dependencies
│   ├── data/
│   │   └── recipes.json      # Mock database of detailed recipes
│   └── services/
│       ├── nlp.py            # AI text processor & normalizer
│       └── recipe_matcher.py # Greedy match algorithm implementation
│
└── frontend/                 # React & Vite Frontend
    ├── index.html            # Vite HTML Entrypoint
    ├── package.json          # Node dependencies 
    ├── tailwind.config.js    # Styling & Dark Mode configuration
    ├── src/
    │   ├── main.jsx          # React Entrypoint
    │   ├── App.jsx           # Main Layout & App Logic
    │   ├── index.css         # Global Styles
    │   ├── hooks/
    │   │   └── useLocalStorage.js # Custom hook for Favorites
    │   └── components/
    │       ├── IngredientInput.jsx # Dynamic tag system
    │       └── RecipeCard.jsx      # Card w/ Match % and expanding details
```

## Setup Instructions

### 1. Backend Setup

Prerequisites: Python 3.9+

```bash
# Navigate to backend directory
cd backend

# Create and activate a Virtual Environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start the FastAPI Server
python app.py
```
*Note: The first time the backend runs, it will download necessary NLTK corpora (stopwords, wordnet) automatically.*

The API will be available at `http://localhost:8000`.

### 2. Frontend Setup

Prerequisites: Node.js (v18+)

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## API Endpoints

### 1. Match Recipes 
`POST /api/search`
- **Description**: Returns top 5 matched recipes ranked by ingredient overlap percentage using a greedy search approach.
- **Body**:
  ```json
  {
    "ingredients": ["chicken", "rice", "salt"]
  }
  ```
- **Response**:
  ```json
  {
    "results": [
      {
        "matchPercentage": 85,
        "matchedIngredients": ["chicken breast", "salt"],
        "missingIngredients": ["soy sauce", "garlic"],
        "recipe": {
          "id": "3",
          "name": "Chicken Stir Fry",
          "ingredients": [...],
          "instructions": [...]
        }
      }
    ]
  }
  ```

### 2. Random Recipe
`GET /api/random`
- **Description**: Returns a single random recipe. Ideal for a "Surprise Me" feature.
- **Response**: Similar format to `/api/search` with `matchPercentage` fixed at 0.

### 3. API Healthcheck
`GET /`
- **Description**: Verifies if the backend is running.
- **Response**: `{"status": "ok", "message": "..."}`
