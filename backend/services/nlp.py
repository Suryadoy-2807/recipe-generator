import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import os

# Set custom nltk data path to avoid downloading to user's home dir directly
nltk_data_dir = os.path.join(os.path.dirname(__file__), '..', 'nltk_data')
os.makedirs(nltk_data_dir, exist_ok=True)
nltk.data.path.append(nltk_data_dir)

# Ensure required NLTK datasets are downloaded
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', download_dir=nltk_data_dir)

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet', download_dir=nltk_data_dir)

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

# Custom common food measurement stopwords
food_stopwords = set([
    'cup', 'cups', 'teaspoon', 'teaspoons', 'tablespoon', 'tablespoons', 'tbsp', 'tsp',
    'ounce', 'ounces', 'oz', 'pound', 'pounds', 'lb', 'lbs', 'gram', 'grams', 'g',
    'kilogram', 'kilograms', 'kg', 'liter', 'liters', 'l', 'milliliter', 'milliliters', 'ml',
    'pinch', 'dash', 'handful', 'slice', 'slices', 'piece', 'pieces', 'clove', 'cloves',
    'can', 'cans', 'package', 'packages', 'bunch', 'bunches', 'sprig', 'sprigs',
    'whole', 'half', 'quarter', 'chopped', 'diced', 'minced', 'sliced', 'peeled', 'grated',
    'fresh', 'dried', 'ground', 'crushed', 'melted', 'cooked', 'raw', 'to taste'
])

all_stopwords = stop_words.union(food_stopwords)

def normalize_ingredient(ingredient_string: str) -> str:
    """
    Normalizes an ingredient string by:
    1. Lowercasing
    2. Removing punctuation and non-alphabetic characters
    3. Removing stopwords and common measurement units
    4. Lemmatizing words (e.g., "tomatoes" -> "tomato")
    """
    # Lowercase
    text = ingredient_string.lower()
    
    # Remove punctuation & non-letters (keep spaces)
    text = re.sub(r'[^a-z\s]', ' ', text)
    
    # Tokenize (simple split by space)
    tokens = text.split()
    
    # Remove stopwords and lemmatize
    normalized_tokens = [
        lemmatizer.lemmatize(word) for word in tokens 
        if word not in all_stopwords and len(word) > 1
    ]
    
    return ' '.join(normalized_tokens).strip()

def get_ingredient_tokens(ingredient_string: str) -> set:
    """
    Returns a set of normalized important words from an ingredient string.
    Useful for flexible matching.
    """
    normalized = normalize_ingredient(ingredient_string)
    return set(normalized.split())
