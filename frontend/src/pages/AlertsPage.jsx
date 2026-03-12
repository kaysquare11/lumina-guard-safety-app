import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

function AlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/sos/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-6 w-6 text-purple-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SOS Alert History</h1>
            <p className="text-sm text-gray-600">Your safety timeline</p>
          </div>
        </div>

        {/* Alerts */}
        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-md">
            <p className="text-gray-600">Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-md">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-900 mb-2">No SOS Alerts</p>
            <p className="text-gray-600">You haven't triggered any SOS alerts yet.</p>
            <p className="text-sm text-gray-500 mt-2">That's great! Stay safe. 💜</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert._id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-semibold text-gray-900">Emergency Alert</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(alert.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span>
                        {alert.location.coordinates[1].toFixed(4)}, {alert.location.coordinates[0].toFixed(4)}
                      </span>
                      <a 
                        href={`https://www.google.com/maps?q=${alert.location.coordinates[1]},${alert.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline ml-2"
                      >
                        View on map →
                      </a>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    alert.status === 'resolved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {alert.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AlertsPage;