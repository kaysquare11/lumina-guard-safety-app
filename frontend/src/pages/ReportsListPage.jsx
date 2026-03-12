import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, MapPin, Clock, Plus } from 'lucide-react';

function ReportsListPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setReports(data.data.reports);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    medium: 'bg-orange-100 text-orange-800 border-orange-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  };

  const categoryLabels = {
    harassment: 'Harassment',
    suspicious_activity: 'Suspicious Activity',
    unsafe_area: 'Unsafe Area',
    stalking: 'Stalking',
    other: 'Other'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-purple-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Incident Reports</h1>
              <p className="text-sm text-gray-600">Community safety reports</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/report')}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md transition-all"
          >
            <Plus className="h-5 w-5" />
            <span>New Report</span>
          </button>
        </div>

        {/* Reports */}
        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-md">
            <p className="text-gray-600">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-md">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</p>
            <p className="text-gray-600 mb-4">Be the first to report an incident</p>
            <button
              onClick={() => navigate('/report')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md transition-all"
            >
              File Your First Report
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report._id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 flex-1">{report.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${severityColors[report.severity]}`}>
                    {report.severity.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{report.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Location captured</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {categoryLabels[report.category]}
                  </span>
                  {report.isAnonymous && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      Anonymous
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsListPage;