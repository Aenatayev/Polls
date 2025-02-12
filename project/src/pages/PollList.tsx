import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileDown, FileText, Printer, Trash2, Edit, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePollData } from '../hooks/usePollData';

interface Poll {
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
  pollId?: string;
}

export default function PollList() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const { polls, loading, error, refresh, isRetrying, retryCount } = usePollData();

  useEffect(() => {
    // Check for success message in navigation state
    const state = location.state as LocationState;
    if (state?.success && state?.message) {
      setSuccessMessage(state.message);
      // Clear the state but keep the URL clean
      navigate(location.pathname, { 
        replace: true,
        state: undefined
      });
      
      // Refresh the poll list to show the new poll
      refresh();
    }
  }, [location.state, navigate, refresh]);

  // Show loading state with retry information
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">My Polls</h2>
              <div className="flex items-center">
                {isRetrying && (
                  <span className="text-sm text-gray-500 mr-2">
                    Retry attempt {retryCount}...
                  </span>
                )}
                <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
              </div>
            </div>
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const exportToWord = (poll: Poll) => {
    const content = `
      # ${poll.title}
      
      Category: ${poll.category}
      Subcategory: ${poll.subcategory}
      Created: ${new Date(poll.created_at).toLocaleDateString()}
      
      ${poll.description}
    `;

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${poll.title}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = (poll: Poll) => {
    const printContent = `
      <html>
        <head>
          <title>${poll.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .meta { color: #666; margin-bottom: 20px; }
            .description { line-height: 1.6; }
          </style>
        </head>
        <body>
          <h1>${poll.title}</h1>
          <div class="meta">
            <p>Category: ${poll.category}</p>
            <p>Subcategory: ${poll.subcategory}</p>
            <p>Created: ${new Date(poll.created_at).toLocaleDateString()}</p>
          </div>
          <div class="description">
            ${poll.description}
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
              <h2 className="text-xl font-semibold text-gray-800">My Polls</h2>
              <button
                onClick={() => refresh()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`h-5 w-5 ${loading || isRetrying ? 'animate-spin' : ''}`} />
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
          ) : polls.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No polls found. Create your first poll!
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
                  {polls.map((poll) => (
                    <tr key={poll.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {poll.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {poll.description.substring(0, 50)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {poll.category}
                        </div>
                        <div className="text-sm text-gray-500">
                          {poll.subcategory}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(poll.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          poll.is_public
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {poll.is_public ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            onClick={() => navigate(`/poll/${poll.id}/results`)}
                            role="button"
                            className="text-gray-400 hover:text-blue-600"
                            title="View Results"
                          >
                            Results
                          </a>
                          <button
                            onClick={() => exportToWord(poll)}
                            className="text-gray-400 hover:text-blue-600"
                            title="Export to Word"
                          >
                            <FileText className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => exportToPDF(poll)}
                            className="text-gray-400 hover:text-red-600"
                            title="Export to PDF"
                          >
                            <FileDown className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => exportToPDF(poll)}
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