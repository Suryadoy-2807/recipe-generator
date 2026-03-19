import json
import os
from services.nlp import get_ingredient_tokens

# Load recipes at startup
data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'recipes.json')
with open(data_path, 'r', encoding='utf-8') as f:
    RECIPES = json.load(f)

def find_best_recipes(user_ingredients: list[str], top_n: int = 5):
    """
    Finds the best matching recipes based on user ingredients using a greedy search approach.
    """
    # Create a master set of all significant words from the user's ingredients
    user_words = set()
    for item in user_ingredients:
        user_words.update(get_ingredient_tokens(item))
    
    results = []
    
    for recipe in RECIPES:
        matched_ingredients = []
        missing_ingredients = []
        
        for recipe_ingredient in recipe["ingredients"]:
            ingredient_words = get_ingredient_tokens(recipe_ingredient)
            
            if not ingredient_words:
                # If ingredient normalizes to nothing (e.g., just "salt to taste"),
                # we can assume we either have it or it's negligible. Let's put it in matched.
                matched_ingredients.append(recipe_ingredient)
                continue
                
            # Greedy Match: If we share at least one significant word, consider it a match
            # E.g. User has "chicken", Recipe needs "chicken breast" -> Match
            intersection = ingredient_words.intersection(user_words)
            if len(intersection) > 0:
                matched_ingredients.append(recipe_ingredient)
            else:
                missing_ingredients.append(recipe_ingredient)
                
        total_ingredients = len(matched_ingredients) + len(missing_ingredients)
        match_percentage = len(matched_ingredients) / total_ingredients if total_ingredients > 0 else 0
        
        results.append({
            "recipe": recipe,
            "matchPercentage": round(match_percentage * 100),
            "matchedIngredients": matched_ingredients,
            "missingIngredients": missing_ingredients
        })
    
    # Sort by match percentage descending. If tied, prioritize recipes with fewer total missing ingredients
    results.sort(key=lambda x: (x["matchPercentage"], -len(x["missingIngredients"])), reverse=True)
    
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
