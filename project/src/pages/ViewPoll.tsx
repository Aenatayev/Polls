import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface PollData {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  is_anonymous: boolean;
  created_at: string;
  questions: Array<{
    id: string;
    text: string;
    type: string;
    options: string[];
    required: boolean;
  }>;
}

export default function ViewPoll() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [poll, setPoll] = useState<PollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for success message in sessionStorage
    const successData = sessionStorage.getItem('pollSuccess');
    if (successData) {
      const { state } = JSON.parse(successData);
      if (state.success && state.message) {
        setSuccessMessage(state.message);
        // Clear the storage
        sessionStorage.removeItem('pollSuccess');
      }
    }
  }, [location]);

  useEffect(() => {
    loadPoll();
  }, [id]);

  const loadPoll = async () => {
    try {
      setLoading(true);
      setError('');

      // Load poll data
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', id)
        .single();

      if (pollError) throw pollError;

      // Load questions
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('poll_id', id)
        .order('created_at', { ascending: true });

      if (questionsError) throw questionsError;

      setPoll({
        ...pollData,
        questions: questions || [],
      });
    } catch (err) {
      console.error('Error loading poll:', err);
      setError('Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Poll not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 rounded-lg p-4">
            {successMessage}
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{poll.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{poll.description}</p>
          </div>

          {/* Questions */}
          <div className="px-6 py-4 space-y-6">
            {poll.questions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex items-start">
                  <span className="flex-shrink-0 bg-accent-100 text-accent-700 font-medium rounded-full w-6 h-6 flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="ml-3 flex-1">
                    <p className="text-lg font-medium text-gray-900">
                      {question.text}
                      {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </p>

                    {question.type === 'multiple_choice' && (
                      <div className="mt-4 space-y-2">
                        {question.options?.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className="flex items-center space-x-3"
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'text' && (
                      <div className="mt-4">
                        <textarea
                          rows={3}
                          className="shadow-sm block w-full focus:ring-accent-500 focus:border-accent-500 sm:text-sm border border-gray-300 rounded-md"
                          placeholder="Enter your answer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="px-6 py-4 bg-gray-50">
            <button
              type="button"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
            >
              Submit Response
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}