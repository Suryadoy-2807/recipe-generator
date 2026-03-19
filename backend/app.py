from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from services.recipe_matcher import find_best_recipes, get_random_recipe

app = FastAPI(title="Ingredient-Based Recipe Generator API")

# Configure CORS to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "https://*.vercel.app"], # Allow Vercel preview and production domains
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    ingredients: List[str]

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Recipe Generator API is running"}

@app.post("/api/search")
def search_recipes(request: SearchRequest):
    if not request.ingredients:
        return {"results": []}
    limit = 5 # Return top 5
    results = find_best_recipes(request.ingredients, top_n=limit)
    return {"results": results}

@app.get("/api/random")
def random_recipe():
    result = get_random_recipe()
    if result:
        return {"results": [result]} # Wrap in list to match search output format
    return {"error": "No recipes found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
