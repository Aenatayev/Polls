import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { PollCategory, PollFormData, Question } from '../../types';

interface SurveyFormProps {
  category: PollCategory;
  onSubmit: (data: PollFormData) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function SurveyForm({ category, onSubmit, onBack, loading }: SurveyFormProps) {
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
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {category.id.charAt(0).toUpperCase() + category.id.slice(1)} - {' '}
            {category.subcategory.charAt(0).toUpperCase() + category.subcategory.slice(1)}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Create your survey based on the selected category
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Survey Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter survey title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Survey Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter survey description"
          />
        </div>

        {/* Questions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Questions</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </button>
          </div>

          {formData.questions.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className="p-4 border border-gray-200 rounded-lg space-y-4"
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="text-gray-400 hover:text-red-500"
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
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="text">Text</option>
                </select>

                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) =>
                      handleQuestionChange(questionIndex, 'required', e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Required</span>
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
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(questionIndex)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Survey Settings */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Survey Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) =>
                    setFormData({ ...formData, isAnonymous: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Allow Anonymous Responses</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Make Survey Public</span>
              </label>
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">
                Survey Expiration Date
              </label>
              <input
                type="datetime-local"
                id="expiresAt"
                value={formData.expiresAt || ''}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Survey'}
          </button>
        </div>
      </div>
    </form>
  );
}