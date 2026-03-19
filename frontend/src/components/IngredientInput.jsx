import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';

export default function IngredientInput({ ingredients, setIngredients }) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    const newIngredients = inputValue
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '' && !ingredients.includes(item.toLowerCase()));
      
    if (newIngredients.length > 0) {
      setIngredients([...ingredients, ...newIngredients.map(i => i.toLowerCase())]);
      setInputValue('');
    }
  };

  const removeIngredient = (indexToRemove) => {
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
  };

  const clearAll = () => {
    setIngredients([]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleAdd} className="relative">
        <div className="flex bg-card border border-cardBorder rounded-2xl overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
          <input
            type="text"
            className="flex-1 px-4 py-3 bg-transparent outline-none text-foreground placeholder-gray-400"
            placeholder="Type ingredients (e.g. chicken, rice, tomato) and press Enter..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-4 py-3 bg-primary text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </form>

      {ingredients.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm px-1">
            <span className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">
              Your pantry ({ingredients.length})
            </span>
            <button
              onClick={clearAll}
              className="text-gray-500 hover:text-error transition-colors flex items-center gap-1 group"
            >
              <Trash2 size={14} className="group-hover:animate-pulse" />
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {ingredients.map((ingredient, index) => (
                <motion.div
                  key={`${ingredient}-${index}`}
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                  layout
                  className="group flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-primary dark:text-orange-300 rounded-full text-sm font-medium border border-orange-200 dark:border-orange-900/50 shadow-sm"
                >
                  <span className="capitalize">{ingredient}</span>
                  <button
                    onClick={() => removeIngredient(index)}
                    className="p-0.5 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors focus:outline-none"
                    aria-label={`Remove ${ingredient}`}
                  >
                    <X size={14} className="opacity-70 group-hover:opacity-100" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
