import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileDown, FileText, Printer, Trash2, Edit, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  created_at: string;
  is_public: boolean;
}

interface LocationState {
  success?: boolean;
  message?: string;
  surveyId?: string;
}

export default function SurveyList() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/surveys' } });
      return;
    }

    loadSurveys();
    
    // Check for success message in navigation state
    const state = location.state as LocationState;
    if (state?.success && state?.message) {
      setSuccessMessage(state.message);
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [user]);

  const loadSurveys = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      setError('');

      const { data, error: surveyError } = await supabase
        .from('surveys')
        .select(`
          id,
          title,
          description,
          category,
          subcategory,
          created_at,
          is_public,
          created_by
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (surveyError) throw surveyError;

      console.log('Loaded surveys:', data);
      setSurveys(data || []);
    } catch (err) {
      console.error('Error loading surveys:', err);
      setError('Failed to load surveys. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportToWord = (survey: Survey) => {
    const content = `
      # ${survey.title}
      
      Category: ${survey.category}
      Subcategory: ${survey.subcategory}
      Created: ${new Date(survey.created_at).toLocaleDateString()}
      
      ${survey.description}
    `;

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${survey.title}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = (survey: Survey) => {
    const printContent = `
      <html>
        <head>
          <title>${survey.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .meta { color: #666; margin-bottom: 20px; }
            .description { line-height: 1.6; }
          </style>
        </head>
        <body>
          <h1>${survey.title}</h1>
          <div class="meta">
            <p>Category: ${survey.category}</p>
            <p>Subcategory: ${survey.subcategory}</p>
            <p>Created: ${new Date(survey.created_at).toLocaleDateString()}</p>
          </div>
          <div class="description">
            ${survey.description}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">My Surveys</h2>
              <button
                onClick={() => loadSurveys()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {error && (
              <div className="mt-2 text-sm text-red-600">{error}</div>
            )}
          </div>

          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          ) : surveys.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No surveys found. Create your first survey!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {surveys.map((survey) => (
                    <tr key={survey.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {survey.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {survey.description?.substring(0, 50)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {survey.category}
                        </div>
                        <div className="text-sm text-gray-500">
                          {survey.subcategory}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(survey.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          survey.is_public
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {survey.is_public ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            onClick={() => navigate(`/survey/${survey.id}`)}
                            role="button"
                            className="text-gray-400 hover:text-blue-600"
                            title="View Survey"
                          >
                            View
                          </a>
                          <button
                            onClick={() => exportToWord(survey)}
                            className="text-gray-400 hover:text-blue-600"
                            title="Export to Word"
                          >
                            <FileText className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => exportToPDF(survey)}
                            className="text-gray-400 hover:text-red-600"
                            title="Export to PDF"
                          >
                            <FileDown className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => exportToPDF(survey)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Print"
                          >
                            <Printer className="h-5 w-5" />
                          </button>
                          <button
                            className="text-gray-400 hover:text-indigo-600"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            className="text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}