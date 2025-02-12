import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import CategorySelector from '../components/poll/CategorySelector';
import PollForm from '../components/poll/PollForm';
import CustomizationToolbar from '../components/poll/CustomizationToolbar';
import { PollCategory, PollFormData } from '../types';
import { supabase } from '../lib/supabase';
import { handlePollError, getTranslation } from '../utils/errorHandling';

const BACKGROUND_IMAGE_URL = "https://jgxjfbdrrsrdzpniakla.supabase.co/storage/v1/object/public/light%20blue//background_only.jpg";

export default function CreatePoll() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<PollCategory | null>(null);
  const [formData, setFormData] = useState<PollFormData>({
    title: '',
    description: '',
    questions: [],
    isAnonymous: false,
    isPublic: true,
    expiresAt: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCategorySelect = (category: PollCategory) => {
    setSelectedCategory(category);
  };

  const handleFormSubmit = async (data: PollFormData) => {
    if (!user) {
      setError(t('error.auth.notLoggedIn'));
      navigate('/login', { 
        state: { 
          returnTo: '/create',
          message: t('error.auth.loginRequired')
        } 
      });
      return;
    }

    // Validate required fields
    if (!data.title.trim()) {
      setError(t('error.form.titleRequired'));
      return;
    }

    if (!data.questions.length) {
      setError(t('error.form.questionsRequired'));
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Add timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // Create the poll with proper type casting
      const { data: newPoll, error: pollError } = await supabase
        .from('polls')
        .insert([
          {
            title: data.title,
            description: data.description,
            created_by: user.id,
            is_anonymous: data.isAnonymous,
            is_public: data.isPublic,
            expires_at: data.expiresAt,
            category: selectedCategory?.id,
            subcategory: selectedCategory?.subcategory,
            points_enabled: data.points_enabled || false,
            points_per_completion: data.points_per_completion || 0,
            theme_id: data.theme_id,
            template_id: data.template_id,
            conditional_logic: data.conditional_logic,
          },
        ])
        .select()
        .abortSignal(controller.signal)
        .single();

      clearTimeout(timeoutId);

      if (pollError) throw pollError;

      if (!newPoll) {
        throw new Error(t('error.poll.creation'));
      }

      // Then, create all questions
      const questionsToInsert = data.questions.map((q) => ({
        poll_id: newPoll.id,
        text: q.text,
        type: q.type,
        options: q.options,
        required: q.required,
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert)
        .abortSignal(controller.signal);

      if (questionsError) throw questionsError;

      // Navigate to polls list with success message
      navigate('/polls', {
        state: { 
          success: true,
          message: t('success.poll.created'),
          pollId: newPoll.id
        }
      });

    } catch (err) {
      console.error('Error creating poll:', err);
      if (err.name === 'AbortError') {
        setError(getTranslation('error.poll.timeout'));
      } else if (err instanceof Error) {
        setError(handlePollError(err));
      } else {
        setError(getTranslation('error.poll.creation'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url("${BACKGROUND_IMAGE_URL}")`,
      }}
    >
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Create New Poll</h1>
            <p className="mt-2 text-white/80">Create a custom poll with multiple questions and options.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-md p-4 text-white">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <div className="backdrop-blur-sm bg-black/20 rounded-lg border border-white/10">
                {!selectedCategory ? (
                  <CategorySelector onSelect={handleCategorySelect} />
                ) : (
                  <PollForm
                    category={selectedCategory}
                    onSubmit={handleFormSubmit}
                    onBack={() => setSelectedCategory(null)}
                    loading={loading}
                  />
                )}
              </div>
            </div>

            {/* Customization Toolbar */}
            <div className="lg:col-span-4">
              <CustomizationToolbar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}