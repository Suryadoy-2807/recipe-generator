import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChefHat, Moon, Sun, Search, Sparkles, Loader2, Heart, History, AlertCircle } from 'lucide-react';
import IngredientInput from './components/IngredientInput';
import RecipeCard from './components/RecipeCard';
import { useLocalStorage } from './hooks/useLocalStorage';

// Use environment variable for API URL or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function App() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('theme-mode', false);
  const [ingredients, setIngredients] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [favorites, setFavorites] = useLocalStorage('recipe-favorites', []);
  const [history, setHistory] = useLocalStorage('search-history', []);

  // Set view tab: 'search' or 'favorites'
  const [activeTab, setActiveTab] = useState('search');

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const toggleFavorite = (recipe) => {
    const exists = favorites.find(f => f.id === recipe.id);
    if (exists) {
      setFavorites(favorites.filter(f => f.id !== recipe.id));
    } else {
      setFavorites([...favorites, recipe]);
    }
  };

  const isFavorite = (recipeId) => {
    return favorites.some(f => f.id === recipeId);
  };

  const saveToHistory = (newIngredients) => {
    if (newIngredients.length === 0) return;
    const query = newIngredients.join(', ');
    // Remove if already exists to move to top
    const filteredHistory = history.filter(h => h !== query);
    setHistory([query, ...filteredHistory].slice(0, 5)); // Keep last 5
  };

  const handleSearch = async () => {
    if (ingredients.length === 0) return;
    setIsLoading(true);
    setError(null);
    setActiveTab('search');
    
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients })
      });
      
      if (!response.ok) throw new Error('Failed to fetch recipes');
      
      const data = await response.json();
      setResults(data.results);
      saveToHistory(ingredients);
      
    } catch (err) {
      setError(err.message || 'An error occurred while matching recipes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandom = async () => {
    setIsLoading(true);
    setError(null);
    setActiveTab('search');
    setIngredients([]); // Clear ingredients for random
    
    try {
      const response = await fetch(`${API_BASE_URL}/random`);
      if (!response.ok) throw new Error('Failed to fetch random recipe');
      
      const data = await response.json();
      setResults(data.results); // Assuming backend returns {"results": [{recipe,...}]}
    } catch (err) {
      setError("Could not fetch a surprise recipe right now.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistoryItem = (queryStr) => {
    setIngredients(queryStr.split(',').map(s => s.trim()));
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-cardBorder transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            <ChefHat size={32} strokeWidth={2.5} />
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Smart<span className="text-primary">Bite</span>
            </h1>
          </div>
          
          <nav className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setActiveTab('search')}
              className={`p-2 font-medium text-sm rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'search' ? 'bg-secondary text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <Search size={18} />
              <span className="hidden sm:inline">Discover</span>
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`p-2 font-medium text-sm rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'favorites' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <Heart size={18} className={activeTab === 'favorites' ? 'fill-current' : ''} />
              <span className="hidden sm:inline">Favorites</span>
            </button>
            <div className="w-px h-6 bg-cardBorder mx-1"></div>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 md:mt-12">
        
        {/* Search View */}
        {activeTab === 'search' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="text-center mb-8 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                What's in your <span className="text-primary z-10 relative">fridge?</span>
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Enter your ingredients and let our AI scout the best recipes for you to minimize waste and maximize taste.
              </p>
            </div>

            <IngredientInput ingredients={ingredients} setIngredients={setIngredients} />

            <div className="flex flex-wrap justify-center gap-4 mt-8 w-full">
              <button
                onClick={handleSearch}
                disabled={ingredients.length === 0 || isLoading}
                className="flex items-center gap-2 px-8 py-4 bg-foreground text-background dark:bg-primary dark:text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-gray-200/50 dark:shadow-orange-900/20"
              >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
                Generate Recipes
              </button>
              
              <button
                onClick={handleRandom}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-gray-800 text-foreground border border-cardBorder rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                <Sparkles size={24} className="text-yellow-500" />
                <span className="hidden sm:inline">Surprise Me</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 max-w-lg w-full">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Search History Chips */}
            {history.length > 0 && ingredients.length === 0 && (
              <div className="mt-12 w-full max-w-2xl">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 ml-2">
                  <History size={16} />
                  <span className="font-medium">Recent searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => loadHistoryItem(h)}
                      className="px-4 py-2 bg-card border border-cardBorder text-gray-600 dark:text-gray-300 rounded-xl text-sm hover:border-primary hover:text-primary transition-colors"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Grid */}
            <AnimatePresence>
              {results.length > 0 && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full mt-16"
                >
                  <div className="flex justify-between items-end mb-6">
                    <h3 className="text-2xl font-bold text-foreground">
                      We found {results.length} recipe{results.length !== 1 ? 's' : ''}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((res, index) => (
                      <RecipeCard 
                        key={res.recipe.id} 
                        result={res} 
                        index={index}
                        isFavorite={isFavorite(res.recipe.id)}
                        toggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {!isLoading && results.length === 0 && ingredients.length > 0 && (
              <div className="mt-16 text-center text-gray-500 max-w-md">
                <p>No recipes generated yet. Hit the 'Generate' button to find matches for your ingredients!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Favorites View */}
        {activeTab === 'favorites' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-foreground mb-2">Your Favorites</h2>
              <p className="text-gray-500">Recipes you've loved and saved.</p>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-20 bg-card border border-cardBorder rounded-3xl border-dashed">
                <Heart size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No favorites yet</h3>
                <p className="text-gray-500 mb-6">Start generating recipes and click the heart icon to save them here.</p>
                <button 
                  onClick={() => setActiveTab('search')}
                  className="px-6 py-3 bg-secondary text-primary font-medium rounded-xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                >
                  Discover Recipes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((recipe, index) => (
                  <RecipeCard 
                    key={recipe.id} 
                    result={{ recipe, matchPercentage: 0 }} // Mock result wrapper
                    index={index}
                    isFavorite={true}
                    toggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

      </main>
    </div>
  );
}

export default App;
