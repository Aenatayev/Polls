import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { handleSurveyError, getTranslation } from '../utils/errorHandling';
import { PollCategory, PollFormData } from '../types';
import { supabase } from '../lib/supabase';
import CategorySelector from '../components/survey/CategorySelector';
import SurveyForm from '../components/survey/SurveyForm';
import CustomizationToolbar from '../components/poll/CustomizationToolbar';

const BACKGROUND_IMAGE_URL = "https://jgxjfbdrrsrdzpniakla.supabase.co/storage/v1/object/public/light%20blue//background_only.jpg";

export default function CreateSurvey() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<PollCategory | null>(null);
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
          returnTo: '/create-survey',
          message: t('error.auth.loginRequired')
        } 
      });
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Add timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // Validate form data
      const errors = validateFormData(data);
      if (errors.length > 0) {
        setError(errors.join(' | '));
        return;
      }

      // First, create the survey
      const { data: newSurvey, error: surveyError } = await supabase
        .from('surveys')
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
          }
        ])
        .select()
        .single();

      if (surveyError) throw surveyError;

      if (!newSurvey) {
        throw new Error(t('error.survey.noData'));
      }

      // Then, create all questions
      const questionsToInsert = data.questions.map((q) => ({
        survey_id: newSurvey.id,
        text: q.text,
        type: q.type,
        options: q.options,
        required: q.required,
        created_at: new Date().toISOString(),
      })).filter(q => q.text.trim());

      const { error: questionsError } = await supabase
        .from('survey_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      // Clear timeout and navigate on success
      clearTimeout(timeoutId);
      navigate('/surveys/', {
        state: { 
          success: true,
          message: t('success.survey.created'),
          surveyId: newSurvey.id
        }
      });

    } catch (err) {
      console.error('Error creating survey:', err);
      if (err.name === 'AbortError') {
        setError(getTranslation('error.survey.timeout'));
      } else if (err instanceof Error) {
        setError(handleSurveyError(err));
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
            <h1 className="text-3xl font-bold text-white">Create New Survey</h1>
            <p className="mt-2 text-white/80">Create a comprehensive survey to gather detailed feedback.</p>
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
                  <SurveyForm
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

function validateFormData(data: PollFormData): string[] {
  const errors: string[] = [];

  // Title validation
  if (!data.title.trim()) {
    errors.push(getTranslation('error.form.titleRequired'));
  }

  // Questions validation
  if (!data.questions.length) {
    errors.push(getTranslation('error.form.questionsRequired'));
    return errors;
  }

  // Validate each question
  data.questions.forEach((question, index) => {
    if (!question.text.trim()) {
      errors.push(t('error.form.questionTextRequired', { index: index + 1 }));
    }

    if (question.type === 'multiple_choice') {
      if (!question.options || question.options.length < 2) {
        errors.push(t('error.form.optionsRequired', { index: index + 1 }));
      } else if (question.options.some(opt => !opt.trim())) {
        errors.push(t('error.form.optionTextRequired', { index: index + 1 }));
      }
    }
  });

  // Expiration date validation
  if (data.expiresAt) {
    const expirationDate = new Date(data.expiresAt);
    if (isNaN(expirationDate.getTime())) {
      errors.push(t('error.form.invalidExpirationDate'));
    } else if (expirationDate < new Date()) {
      errors.push(t('error.form.pastExpirationDate'));
    }
  }

  // Points validation
  if (data.points_enabled) {
    if (!data.points_per_completion || data.points_per_completion < 0) {
      errors.push(t('error.form.invalidPoints'));
    }
  }

  return errors;
}