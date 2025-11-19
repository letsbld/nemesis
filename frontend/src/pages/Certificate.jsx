import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { certificateAPI } from '../services/api';

const Certificate = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadCertificate();
  }, [resultId]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      const response = await certificateAPI.getCertificate(resultId);
      // Backend returns certificate data directly, not wrapped in { success, certificate }
      if (response && response.employee_name) {
        setCertificate(response);
      } else if (response.error) {
        setError(response.error || 'Failed to load certificate. Please try again.');
      } else {
        setError('Failed to load certificate. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load certificate. Please try again.');
      console.error('Certificate load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const blob = await certificateAPI.downloadPDF(resultId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${certificate?.certificate_number || resultId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download certificate. Please try again.');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleGeneratePDF = async () => {
    // Use download endpoint directly - it generates PDF on the fly without needing R2
    await handleDownloadPDF();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error && !certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return null;
  }

  const completionDate = certificate.completion_date
    ? new Date(certificate.completion_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Certificate of Completion</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Certificate Display */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg border-4 border-blue-200 p-12 mb-6">
          <div className="text-center">
            <div className="mb-6">
              <h2 className="text-4xl font-bold text-blue-900 mb-2">Certificate of Completion</h2>
              <p className="text-lg text-gray-700">This is to certify that</p>
            </div>

            <div className="my-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {certificate.employee_name || user?.first_name || user?.name || 'Employee'}
              </h3>
            </div>

            <div className="mb-8">
              <p className="text-lg text-gray-700 mb-2">
                has successfully completed the
              </p>
              <p className="text-2xl font-semibold text-gray-900 mb-4">
                {certificate.quiz_topic || 'Security Training'}
              </p>
              <p className="text-lg text-gray-700">
                with a score of {certificate.score} out of {certificate.total_questions} ({certificate.percentage}%)
              </p>
            </div>

            <div className="mt-8 pt-8 border-t-2 border-gray-300">
              <p className="text-sm text-gray-600 mb-2">Date: {completionDate}</p>
              {certificate.certificate_number && (
                <p className="text-xs text-gray-500">
                  Certificate Number: {certificate.certificate_number}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-center gap-4">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {downloading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Certificate;

