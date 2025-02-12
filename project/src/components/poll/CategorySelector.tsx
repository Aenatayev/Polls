import React, { useState, useEffect } from 'react';
import {
  Brain,
  Users,
  Briefcase,
  Building2,
  Vote,
  GraduationCap,
  Film,
  Heart,
  Laptop,
  Trophy,
  Plane,
  DollarSign,
  Globe,
} from 'lucide-react';
import { PollCategory } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface CategorySelectorProps {
  onSelect: (category: PollCategory) => void;
  initialCategory?: PollCategory | null;
}

const categories = [
  {
    id: 'personal',
    label: 'Personal',
    icon: Brain,
    color: '#FFB5B5', // Light coral pink
    subcategories: [
      { id: 'hobbies', label: 'Hobbies' },
      { id: 'lifestyle', label: 'Lifestyle' },
      { id: 'preferences', label: 'Preferences' }
    ],
  },
  {
    id: 'family',
    label: 'Family',
    icon: Users,
    color: '#B5B5FF', // Light periwinkle
    subcategories: [
      { id: 'parenting', label: 'Parenting' },
      { id: 'relationships', label: 'Relations' },
      { id: 'household', label: 'Household' }
    ],
  },
  {
    id: 'work',
    label: 'Work',
    icon: Briefcase,
    color: '#98FB98', // Light mint green
    subcategories: [
      { id: 'satisfaction', label: 'Satisfaction' },
      { id: 'teamwork', label: 'Teamwork' },
      { id: 'culture', label: 'Culture' }
    ],
  },
  {
    id: 'business',
    label: 'Business',
    icon: Building2,
    color: '#87CEEB', // Sky blue
    subcategories: [
      { id: 'market', label: 'Market' },
      { id: 'investment', label: 'Investment' },
      { id: 'strategy', label: 'Strategy' }
    ],
  },
  {
    id: 'politics',
    label: 'Politics',
    icon: Vote,
    color: '#DDA0DD', // Light plum
    subcategories: [
      { id: 'policies', label: 'Policies' },
      { id: 'elections', label: 'Elections' },
      { id: 'opinions', label: 'Opinions' }
    ],
  },
  {
    id: 'education',
    label: 'Education',
    icon: GraduationCap,
    color: '#F0E68C', // Light khaki
    subcategories: [
      { id: 'learning', label: 'Learning' },
      { id: 'feedback', label: 'Feedback' },
      { id: 'teaching', label: 'Teaching' }
    ],
  },
  {
    id: 'entertainment',
    label: 'Media',
    icon: Film,
    color: '#ADD8E6', // Light blue
    subcategories: [
      { id: 'movies', label: 'Movies' },
      { id: 'music', label: 'Music' },
      { id: 'gaming', label: 'Gaming' }
    ],
  },
  {
    id: 'health',
    label: 'Health',
    icon: Heart,
    color: '#FFB6C1', // Light pink
    subcategories: [
      { id: 'fitness', label: 'Fitness' },
      { id: 'mental', label: 'Mental' },
      { id: 'nutrition', label: 'Nutrition' }
    ],
  },
  {
    id: 'technology',
    label: 'Tech',
    icon: Laptop,
    color: '#B0E0E6', // Powder blue
    subcategories: [
      { id: 'ai', label: 'AI' },
      { id: 'gadgets', label: 'Gadgets' },
      { id: 'security', label: 'Security' }
    ],
  },
  {
    id: 'sports',
    label: 'Sports',
    icon: Trophy,
    color: '#90EE90', // Light green
    subcategories: [
      { id: 'teams', label: 'Teams' },
      { id: 'events', label: 'Events' },
      { id: 'fitness', label: 'Fitness' }
    ],
  },
  {
    id: 'travel',
    label: 'Travel',
    icon: Plane,
    color: '#87CEFA', // Light sky blue
    subcategories: [
      { id: 'places', label: 'Places' },
      { id: 'planning', label: 'Planning' },
      { id: 'activities', label: 'Activities' }
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    color: '#FFDAB9', // Peach
    subcategories: [
      { id: 'budget', label: 'Budget' },
      { id: 'crypto', label: 'Crypto' },
      { id: 'stocks', label: 'Stocks' }
    ],
  },
  {
    id: 'social',
    label: 'Social',
    icon: Globe,
    color: '#98FF98', // Mint green
    subcategories: [
      { id: 'rights', label: 'Rights' },
      { id: 'climate', label: 'Climate' },
      { id: 'equality', label: 'Equality' }
    ],
  },
];

// Ensure categories array exists and has content
if (!categories || categories.length === 0) {
  throw new Error('Categories configuration is missing or empty');
}

export default function CategorySelector({ onSelect, initialCategory }: CategorySelectorProps) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Initialize with any provided category
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory.id);
      setSelectedSubcategory(initialCategory.subcategory);
    }
  }, [initialCategory]);

  const handleCategoryClick = (categoryId: string) => {
    // Only reset subcategory if selecting a different category
    setSelectedCategory(prev => {
      if (prev === categoryId) {
        return null;
      }
      setSelectedSubcategory(null);
      return categoryId;
    });
  };

  const handleSubcategoryClick = (subcategory: string) => {
    if (!selectedCategory) return;
    
    const category = categories.find((c) => c.id === selectedCategory);
    if (!category) return;

    // Only trigger onSelect if the selection actually changed
    if (selectedSubcategory !== subcategory) {
    setSelectedSubcategory(subcategory);
    onSelect({
      id: category.id,
      subcategory,
    });
    }
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
          <p className="text-white/80 text-lg">{t('poll.category.none')}</p>
          <p className="text-white/60 mt-2 text-sm">{t('poll.category.checkConfiguration')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        {t('poll.category.select')}
      </h2>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => handleCategoryClick(id)}
            aria-pressed={selectedCategory === id}
            aria-label={`${label} category`}
            className={`group relative p-6 rounded-xl border transition-all duration-300 transform perspective-1000 hover:scale-105 hover:-translate-y-1 ${
              selectedCategory === id
                ? 'border-accent-400 bg-gradient-to-br from-accent-400/30 to-accent-600/30 text-white shadow-lg shadow-accent-500/20'
                : 'border-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 text-white/80 hover:text-white'
            }`}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="relative flex flex-col items-center text-center transform transition-transform duration-300 group-hover:translate-z-10">
              <div className="relative w-12 h-12 mb-3">
                <div 
                  className="absolute inset-0 rounded-full transform -translate-z-10 group-hover:scale-110 transition-transform duration-300" 
                  style={{ backgroundColor: color }}
                />
                <Icon 
                  className="w-full h-full transform group-hover:scale-110 transition-transform duration-300" 
                  strokeWidth={1.5}
                  style={{ color: selectedCategory === id ? '#fff' : '#1a1a1a' }}
                  aria-hidden="true"
                />
              </div>
              <span className="text-sm font-medium transform group-hover:scale-105 transition-transform duration-300">
                {label}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-z-10" />
          </button>
        ))}
      </div>

      {/* Subcategories */}
      {selectedCategory && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-white mb-4">
            {t('poll.subcategory.select')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories
              .find((c) => c.id === selectedCategory)
              ?.subcategories?.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => handleSubcategoryClick(subcategory.id)}
                  aria-pressed={selectedSubcategory === subcategory.id}
                  aria-label={`${subcategory.label} subcategory`}
                  className={`p-3 rounded-lg border text-sm transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 ${
                    selectedSubcategory === subcategory.id
                      ? 'border-accent-400 bg-gradient-to-br from-accent-400/30 to-accent-600/30 text-white shadow-lg shadow-accent-500/20'
                      : 'border-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 text-white/80 hover:text-white'
                  }`}
                >
                  {subcategory.label}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}