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
            recipe_tokens = set(norm_recipe_ingr.split())
            
            for user_ingr in normalized_user:
                user_tokens = set(user_ingr.split())
                
                # 1. Exact token intersection (e.g., "chicken" in "chicken breast")
                if user_tokens.intersection(recipe_tokens):
                    is_match = True
                    break
                    
                # 2. String similarity for typo leniency on tokens
                for u_tok in user_tokens:
                    for r_tok in recipe_tokens:
                        if len(u_tok) >= 3 and len(r_tok) >= 3:
                            # Use strict > 0.8 to avoid false positives like "apple" vs "maple" (0.8)
                            if difflib.SequenceMatcher(None, u_tok, r_tok).ratio() > 0.8:
                                is_match = True
                                break
                    if is_match:
                        break
                
                if is_match:
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
