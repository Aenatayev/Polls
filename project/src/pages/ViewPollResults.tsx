import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { BarChart2, PieChart, Users, RefreshCw } from 'lucide-react';

import { PollResult } from '../types';

export default function ViewPollResults() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<PollResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { 
          returnTo: `/poll/${id}/results`,
          message: t('error.auth.loginRequired')
        } 
      });
      return;
    }

    if (!id) {
      setError(t('error.poll.missingId'));
      return;
    }

    loadPollResults();
  }, [id, user, navigate, t]);

  const loadPollResults = async () => {
    try {
      setLoading(true);
      setError('');

      // Add timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // Load poll data
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select(`
          id,
          title,
          description,
          category,
          subcategory,
          created_at,
          created_by
        `)
        .eq('id', id)
        .single()
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (pollError) throw pollError;

      // Verify ownership
      if (pollData.created_by !== user?.id) {
        throw new Error(t('error.auth.unauthorized'));
      }

      // Load questions with responses
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select(`
          id,
          text,
          type,
          options,
          responses (
            answer
          )
        `)
        .eq('poll_id', id);

      if (questionsError) throw questionsError;

      // Process responses
      const processedQuestions = questions.map((question) => {
        const responseCounts = question.responses.reduce((acc: Record<string, number>, response: any) => {
          const answer = response.answer;
          acc[answer] = (acc[answer] || 0) + 1;
          return acc;
        }, {});

        return {
          ...question,
          responses: Object.entries(responseCounts).map(([option, count]) => ({
            option,
            count
          }))
        };
      });

      setPoll({
        ...pollData,
        questions: processedQuestions,
        total_responses: questions[0]?.responses.length || 0
      });
      
    } catch (err) {
      console.error('Error loading poll results:', err);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError(t('error.poll.timeout'));
        } else {
          setError(t('error.poll.loadFailed'));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Poll not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{poll.title}</h1>
                <p className="mt-1 text-sm text-gray-500">{poll.description}</p>
              </div>
              <button
                onClick={loadPollResults}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh Results"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>

            {/* Stats Overview */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Responses
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {poll.total_responses}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Results */}
        <div className="space-y-6">
          {poll.questions.map((question) => (
            <div key={question.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">{question.text}</h3>
                
                {question.type === 'multiple_choice' && (
                  <div className="mt-4">
                    {question.responses.map((response, index) => (
                      <div key={index} className="mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{response.option}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {response.count} ({Math.round((response.count / poll.total_responses) * 100)}%)
                          </span>
                        </div>
                        <div className="mt-1">
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                              <div
                                style={{ width: `${(response.count / poll.total_responses) * 100}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent-500"
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'text' && (
                  <div className="mt-4 space-y-2">
                    {question.responses.map((response, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">{response.option}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}