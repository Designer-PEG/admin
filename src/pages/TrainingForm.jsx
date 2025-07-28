import { useEffect, useState } from 'react';

const TrainingForm = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbzIINicPMtjJfimpnnciWj7nYlG34jsu8Hi8rL3XIQ7mr6AOGvaeUH5vK6_r4ZsZilXJQ/exec?sheet=Sheet1'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Validate the response is a 2D array
      if (!Array.isArray(result) || !result.every(Array.isArray)) {
        throw new Error('Invalid data format: Expected 2D array');
      }
      
      setSubmissions(result);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching submissions:', err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading training submissions...</span>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Training Form Submissions
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {submissions.length > 0 
              ? `Showing ${submissions.length - 1} submissions` 
              : 'No submissions available'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={fetchSubmissions}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
                <button
                  onClick={fetchSubmissions}
                  className="ml-2 text-sm font-medium text-red-700 underline hover:text-red-600"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
            {submissions.length > 0 && (
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {submissions[0].map((header, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {submissions.length > 1 ? (
                submissions.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 dark:text-gray-100 sm:pl-6"
                      >
                        {cell || '-'}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan={submissions[0]?.length || 1}
                    className="py-4 text-center text-sm text-gray-500"
                  >
                    No training submissions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TrainingForm;