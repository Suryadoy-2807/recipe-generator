import json
import os
import difflib
from services.nlp import get_ingredient_tokens, normalize_ingredient

# Load recipes at startup
data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'recipes.json')
with open(data_path, 'r', encoding='utf-8') as f:
    RECIPES = json.load(f)

def find_best_recipes(user_ingredients: list[str], top_n: int = 5):
    """
    Finds the best matching recipes based on user ingredients using fuzzy search and partial matching.
    """
    # Normalize user ingredients
    # We keep both tokens and the full string for robust matching
    normalized_user = [normalize_ingredient(item) for item in user_ingredients]
    normalized_user = [u for u in normalized_user if u] # Remove empty
    
    results = []
    
    for recipe in RECIPES:
        matched_ingredients = []
        missing_ingredients = []
        
        for recipe_ingredient in recipe["ingredients"]:
            norm_recipe_ingr = normalize_ingredient(recipe_ingredient)
            
            if not norm_recipe_ingr:
                # If ingredient normalizes to nothing (e.g., just "salt to taste"),
                # we can assume we either have it or it's negligible. Let's put it in matched.
                matched_ingredients.append(recipe_ingredient)
                continue
                
            is_match = False
            for user_ingr in normalized_user:
                # Calculate similarity score using difflib
                score = difflib.SequenceMatcher(None, user_ingr, norm_recipe_ingr).ratio()
                
                # We consider it a match if:
                # 1. Similarity is high enough (>= 0.70)
                # 2. Or the user ingredient is a direct substring of the recipe ingredient (partial match)
                #    e.g. user: "chicken", recipe: "chicken breast"
                # 3. Or recipe ingredient is a substring of user ingredient
                #    e.g. user: "red onions", recipe: "onion" (after normalization: "red onion" vs "onion")
                if score >= 0.7 or user_ingr in norm_recipe_ingr or norm_recipe_ingr in user_ingr:
                    is_match = True
                    break
                    
            if is_match:
                matched_ingredients.append(recipe_ingredient)
            else:
                missing_ingredients.append(recipe_ingredient)
                
        # Match percentage = (matched ingredients / total recipe ingredients) * 100
        total_ingredients = len(matched_ingredients) + len(missing_ingredients)
        match_percentage = (len(matched_ingredients) / total_ingredients * 100) if total_ingredients > 0 else 0
        match_percentage_int = round(match_percentage)
        
        # Only return recipes with at least 40% match
        if match_percentage >= 15:
            results.append({
                "recipe": recipe,
                "matchPercentage": match_percentage_int,
                "matchedIngredients": matched_ingredients,
                "missingIngredients": missing_ingredients
            })
    
    # Sort results: Highest match percentage first
    results.sort(key=lambda x: x["matchPercentage"], reverse=True)
    
    return results[:top_n]

def get_random_recipe():
    import random
    if not RECIPES:
        return None
    # Wrap it similarly to search results so frontend gets a uniform structure
    recipe = random.choice(RECIPES)
    return {
        "recipe": recipe,
        "matchPercentage": 0, # Since it's random, we don't calculate a match
        "matchedIngredients": [],
        "missingIngredients": recipe["ingredients"]
    }
