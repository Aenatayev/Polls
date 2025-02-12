import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { PollCategory, PollFormData, Question } from '../../types';

interface PollFormProps {
  category: PollCategory;
  onSubmit: (data: PollFormData) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function PollForm({ category, onSubmit, onBack, loading }: PollFormProps) {
  const { t } = useLanguage();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<PollFormData>({
    title: '',
    description: '',
    questions: [
      {
        text: '',
        type: 'multiple_choice',
        options: ['', ''],
        required: true,
      },
    ],
    isAnonymous: false,
    isPublic: true,
    expiresAt: null,
  });

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...formData.questions];
    const options = [...(newQuestions[questionIndex].options || [])];
    options[optionIndex] = value;
    newQuestions[questionIndex] = { ...newQuestions[questionIndex], options };
    setFormData({ ...formData, questions: newQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          text: '',
          type: 'multiple_choice',
          options: ['', ''],
          required: true,
        },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...formData.questions];
    const options = [...(newQuestions[questionIndex].options || []), ''];
    newQuestions[questionIndex] = { ...newQuestions[questionIndex], options };
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...formData.questions];
    const options = (newQuestions[questionIndex].options || []).filter(
      (_, i) => i !== optionIndex
    );
    newQuestions[questionIndex] = { ...newQuestions[questionIndex], options };
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate title
    if (!formData.title.trim()) {
      setError(t('error.form.titleRequired'));
      return;
    }

    // Validate questions
    if (formData.questions.length === 0) {
      setError(t('error.form.questionsRequired'));
      return;
    }

    // Validate each question
    for (const question of formData.questions) {
      if (!question.text.trim()) {
        setError(t('error.form.questionTextRequired'));
        return;
      }

      if (question.type === 'multiple_choice') {
        if (!question.options || question.options.length < 2) {
          setError(t('error.form.optionsRequired'));
          return;
        }

        // Check for empty options
        if (question.options.some(option => !option.trim())) {
          setError(t('error.form.optionTextRequired'));
          return;
        }
      }
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      {error && (
        <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-md p-4 text-white">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={onBack}
          className="mr-4 text-white/80 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-white">
            {category.id.charAt(0).toUpperCase() + category.id.slice(1)} - {' '}
            {category.subcategory.charAt(0).toUpperCase() + category.subcategory.slice(1)}
          </h2>
          <p className="text-sm text-white/80 mt-1">
            Create your poll based on the selected category
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white">
            Poll Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-accent-400 focus:ring-accent-400 sm:text-sm"
            placeholder="Enter poll title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white">
            Poll Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-accent-400 focus:ring-accent-400 sm:text-sm"
            placeholder="Enter poll description"
          />
        </div>

        {/* Questions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Questions</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-400"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </button>
          </div>

          {formData.questions.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className="p-4 bg-white/10 border border-white/20 rounded-lg space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-4">
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) =>
                      handleQuestionChange(questionIndex, 'text', e.target.value)
                    }
                    placeholder="Enter your question"
                    className="block w-full rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-accent-400 focus:ring-accent-400 sm:text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="text-white/60 hover:text-red-400"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={question.type}
                  onChange={(e) =>
                    handleQuestionChange(questionIndex, 'type', e.target.value)
                  }
                  className="rounded-md bg-white/10 border border-white/20 text-white shadow-sm focus:border-accent-400 focus:ring-accent-400 sm:text-sm"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="text">Text Response</option>
                </select>

                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) =>
                      handleQuestionChange(questionIndex, 'required', e.target.checked)
                    }
                    className="rounded border-white/20 bg-white/10 text-accent-500 focus:ring-accent-400"
                  />
                  <span className="ml-2 text-sm text-white">Required</span>
                </label>
              </div>

              {question.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {question.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(
                            questionIndex,
                            optionIndex,
                            e.target.value
                          )
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        className="block w-full rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-accent-400 focus:ring-accent-400 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        className="text-white/60 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(questionIndex)}
                    className="inline-flex items-center px-3 py-1 border border-white/20 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Poll Settings */}
        <div className="border-t border-white/20 pt-6">
          <h3 className="text-lg font-medium text-white mb-4">Poll Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) =>
                    setFormData({ ...formData, isAnonymous: e.target.checked })
                  }
                  className="rounded border-white/20 bg-white/10 text-accent-500 focus:ring-accent-400"
                />
                <span className="ml-2 text-sm text-white">Allow Anonymous Responses</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="rounded border-white/20 bg-white/10 text-accent-500 focus:ring-accent-400"
                />
                <span className="ml-2 text-sm text-white">Make Poll Public</span>
              </label>
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-white">
                Poll Expiration Date
              </label>
              <input
                type="datetime-local"
                id="expiresAt"
                value={formData.expiresAt || ''}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
                className="mt-1 block w-full rounded-md bg-white/10 border border-white/20 text-white shadow-sm focus:border-accent-400 focus:ring-accent-400 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-400 disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Poll'}
          </button>
        </div>
      </div>
    </form>
  );
}