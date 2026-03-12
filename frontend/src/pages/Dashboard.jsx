import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, User, AlertCircle, MapPin, Users, FileText, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SimpleMap from '../components/SimpleMap';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sosLoading, setSosLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    contacts: 0,
    reports: 0,
    alerts: 0
  });

  // AUTO-DETECT LOCATION ON LOAD
  useEffect(() => {
    detectLocation();
    fetchStats();
  }, []);

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          console.log('📍 Location detected:', position.coords);
        },
        (error) => {
          console.log('Location detection failed, using default');
          // Use default location if detection fails
          setUserLocation({ latitude: 6.5244, longitude: 3.3792 });
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    } else {
      setUserLocation({ latitude: 6.5244, longitude: 3.3792 });
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      try {
        const contactsRes = await fetch('http://localhost:5001/api/contacts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (contactsRes.ok) {
          const data = await contactsRes.json();
          setStats(prev => ({ ...prev, contacts: data.data?.contacts?.length || 0 }));
        }
      } catch (err) {
        console.log('Contacts not loaded yet');
      }

      try {
        const reportsRes = await fetch('http://localhost:5001/api/reports', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (reportsRes.ok) {
          const data = await reportsRes.json();
          setStats(prev => ({ ...prev, reports: data.data?.reports?.length || 0 }));
        }
      } catch (err) {
        console.log('Reports not loaded yet');
      }

      try {
        const alertsRes = await fetch('http://localhost:5001/api/sos/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setStats(prev => ({ ...prev, alerts: data.alerts?.length || 0 }));
        }
      } catch (err) {
        console.log('Alerts not loaded yet');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleSOSClick = async () => {
    setSosLoading(true);
    addNotification('🔵 Getting your location...', 'info');

    if (!navigator.geolocation) {
      addNotification('❌ Geolocation not supported', 'error');
      setSosLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setUserLocation({ latitude, longitude });
        addNotification('✅ Location captured', 'success');

        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5001/api/sos/trigger', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ latitude, longitude })
          });

          const data = await response.json();

          if (response.ok) {
            addNotification('✅ SOS Alert sent to emergency contacts!', 'success');
            fetchStats();
          } else {
            addNotification(`❌ ${data.message}`, 'error');
          }
        } catch (error) {
          addNotification('❌ Failed to send SOS', 'error');
        } finally {
          setSosLoading(false);
        }
      },
      (error) => {
        addNotification('❌ Location access denied', 'error');
        setSosLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Lumina Guard</h1>
                <p className="text-xs text-gray-500">Your Circle of Light</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-purple-600">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">Protected 24/7</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`px-6 py-3 rounded-xl shadow-lg backdrop-blur-sm max-w-md ${
              notif.type === 'success' ? 'bg-green-50 border-2 border-green-200 text-green-800' :
              notif.type === 'error' ? 'bg-red-50 border-2 border-red-200 text-red-800' :
              'bg-blue-50 border-2 border-blue-200 text-blue-800'
            }`}
          >
            {notif.message}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}! 👋
          </h2>
          <p className="text-gray-600">Your safety dashboard - Protected 24/7</p>
        </div>

        {/* Stats Cards - ALL CLICKABLE */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {/* SOS Status */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-gray-600 font-medium">SOS Ready</h3>
            <p className="text-sm text-gray-500 mt-1">Always Active</p>
          </div>

          {/* Safe Zones - CLICKABLE */}
          <div 
            onClick={() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border-2 border-blue-200 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">8</span>
            </div>
            <h3 className="text-gray-600 font-medium">Safe Zones</h3>
            <p className="text-sm text-gray-500 mt-1">View on map</p>
          </div>

          {/* Contacts - CLICKABLE */}
          <div 
            onClick={() => navigate('/profile')}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border-2 border-purple-200 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.contacts}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Contacts</h3>
            <p className="text-sm text-gray-500 mt-1">Emergency list</p>
          </div>

          {/* Reports - CLICKABLE */}
          <div 
            onClick={() => navigate('/reports')}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border-2 border-orange-200 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.reports}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Reports</h3>
            <p className="text-sm text-gray-500 mt-1">Incidents filed</p>
          </div>

          {/* Alerts History - CLICKABLE */}
          <div 
            onClick={() => navigate('/alerts')}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border-2 border-red-200 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.alerts}</span>
            </div>
            <h3 className="text-gray-600 font-medium">SOS Alerts</h3>
            <p className="text-sm text-gray-500 mt-1">History</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate('/report')}
            className="bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-center space-x-3 mb-2">
              <AlertCircle className="h-8 w-8" />
              <span className="text-xl font-bold">Report Suspicious Activity</span>
            </div>
            <p className="text-sm opacity-90">Help make our community safer</p>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="bg-gradient-to-r from-purple-400 to-indigo-400 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-center space-x-3 mb-2">
              <User className="h-8 w-8" />
              <span className="text-xl font-bold">Manage Emergency Contacts</span>
            </div>
            <p className="text-sm opacity-90">Keep your safety circle updated</p>
          </button>
        </div>

        {/* Emergency SOS Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleSOSClick}
            disabled={sosLoading}
            className={`relative w-64 h-64 rounded-full shadow-2xl transform transition-all duration-300 ${
              sosLoading 
                ? 'bg-gray-400 scale-95 cursor-not-allowed' 
                : 'bg-gradient-to-br from-pink-400 to-red-500 hover:scale-105 hover:shadow-3xl active:scale-95'
            }`}
          >
            <div className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-20"></div>
            <div className="relative flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-12 w-12 text-white" />
              </div>
              <span className="text-white text-3xl font-bold tracking-wider">
                {sosLoading ? 'SENDING...' : 'EMERGENCY'}
              </span>
              <span className="text-white text-5xl font-black">SOS</span>
              <span className="text-white/90 text-sm mt-2">Tap to alert contacts</span>
            </div>
          </button>
        </div>

        {/* Map Section - DYNAMIC LOCATION */}
        <div id="map" className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-6 w-6 mr-2 text-purple-600" />
            Safety Map - Your Current Area
          </h3>
          <div style={{ height: '500px' }}>
            <SimpleMap userLocation={userLocation} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;