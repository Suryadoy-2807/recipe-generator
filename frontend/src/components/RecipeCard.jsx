import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Heart, CheckCircle2, Circle, ChevronDown, ChevronUp, ChefHat, Tag } from 'lucide-react';

export default function RecipeCard({ result, isFavorite, toggleFavorite, index }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!result || !result.recipe) return null;
  
  const { recipe, matchPercentage, matchedIngredients, missingIngredients } = result;

  // Determine badge color based on match
  const getBadgeColor = (percentage) => {
    if (percentage >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
    if (percentage >= 50) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="bg-card border border-cardBorder rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={recipe.image || "https://placehold.co/800x600/f3f4f6/a1a1aa?text=Recipe"} 
          alt={recipe.name} 
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loops
            e.target.src = "https://placehold.co/800x600/f3f4f6/a1a1aa?text=Recipe"; // Fallback image
          }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Match Badge */}
        {matchPercentage > 0 && (
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm flex items-center gap-1.5 ${getBadgeColor(matchPercentage)}`}>
            <span>{matchPercentage}% Match</span>
          </div>
        )}

        {/* Favorite Button */}
        <button 
          onClick={() => toggleFavorite(recipe)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm shadow-sm hover:bg-white dark:hover:bg-black transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart 
            size={18} 
            className={`transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-300 hover:text-red-500"}`} 
          />
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex gap-2 flex-wrap mb-3">
          {recipe.tags && recipe.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] uppercase font-bold tracking-wider text-primary flex items-center gap-1">
              <Tag size={10} /> {tag}
            </span>
          ))}
        </div>

        <h3 className="text-xl font-bold mb-2 text-foreground line-clamp-2 leading-tight">{recipe.name}</h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4 mt-auto pt-2">
          <div className="flex items-center gap-1.5">
            <Clock size={16} />
            <span>{parseInt(recipe.prepTime) + parseInt(recipe.cookTime)} mins total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ChefHat size={16} />
            <span>{recipe.ingredients.length} ingredients</span>
          </div>
        </div>

        <div className="mt-4 border-t border-cardBorder pt-4">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-full flex justify-between items-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors"
          >
            <span>{expanded ? 'Hide Recipe Info' : 'View Recipe Details'}</span>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-5">
                {/* Ingredients Section */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-foreground flex items-center gap-2">Ingredients</h4>
                  <ul className="space-y-1.5 text-sm">
                    {/* Show Matched */}
                    {matchedIngredients && matchedIngredients.map((ing, i) => (
                      <li key={`matched-${i}`} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" />
                        <span className="capitalize">{ing}</span>
                      </li>
                    ))}
                    {/* Show Missing */}
                    {missingIngredients && missingIngredients.map((ing, i) => (
                      <li key={`missing-${i}`} className="flex items-start gap-2 text-gray-500 dark:text-gray-500">
                        <Circle size={16} className="text-gray-400 dark:text-gray-600 mt-0.5 shrink-0" />
                        <span className="capitalize line-through decoration-gray-300 dark:decoration-gray-700">{ing}</span>
                        <span className="text-[10px] uppercase bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 font-medium ml-1">Missing</span>
                      </li>
                    ))}
                    {/* Fallback if no match data (e.g. for random recipes) */}
                    {!matchedIngredients && !missingIngredients && recipe.ingredients.map((ing, i) => (
                      <li key={`ing-${i}`} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span className="capitalize">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions Section */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-foreground">Instructions</h4>
                  <ol className="space-y-3 text-sm">
                    {recipe.instructions.map((step, i) => (
                      <li key={`step-${i}`} className="flex gap-3 text-gray-600 dark:text-gray-400">
                        <span className="font-bold text-primary shrink-0">{i + 1}.</span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
