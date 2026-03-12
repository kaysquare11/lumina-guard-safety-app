import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertCircle } from 'lucide-react';

function ReportPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'suspicious_activity',
    severity: 'medium',
    isAnonymous: false
  });
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleLocationCapture = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setMessage({ type: 'success', text: '📍 Location captured!' });
      },
      (error) => {
        setMessage({ type: 'error', text: 'Failed to get location' });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location) {
      setMessage({ type: 'error', text: 'Please capture location first' });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          latitude: location.latitude,
          longitude: location.longitude
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Report submitted successfully!' });
        setTimeout(() => navigate('/reports'), 2000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit report' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-6 w-6 text-purple-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report Incident</h1>
            <p className="text-sm text-gray-600">Help make our community safer</p>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Brief description of the incident"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="harassment">Harassment</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="unsafe_area">Unsafe Area</option>
                <option value="stalking">Stalking</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity *
              </label>
              <div className="grid grid-cols-3 gap-4">
                {['low', 'medium', 'high'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({...formData, severity: level})}
                    className={`py-3 rounded-lg font-semibold capitalize transition-all ${
                      formData.severity === level
                        ? level === 'low' ? 'bg-yellow-500 text-white' :
                          level === 'medium' ? 'bg-orange-500 text-white' :
                          'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Provide details about what happened..."
                rows={5}
                required
                maxLength={1000}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident Location *
              </label>
              {!location ? (
                <button
                  type="button"
                  onClick={handleLocationCapture}
                  className="w-full py-3 bg-blue-50 text-blue-600 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-blue-100 transition-all"
                >
                  <MapPin className="h-5 w-5" />
                  <span>Tap to Capture Incident Location</span>
                </button>
              ) : (
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Location Captured</p>
                      <p className="text-xs text-green-600 mt-1">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocation(null)}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Anonymous */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({...formData, isAnonymous: e.target.checked})}
                className="w-5 h-5 text-purple-600 rounded"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700">
                Submit anonymously (your identity will be hidden)
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !location}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                loading || !location
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Your report helps everyone</p>
              <p>Reports are reviewed and help identify unsafe areas in our community. Your contribution makes everyone safer.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportPage;