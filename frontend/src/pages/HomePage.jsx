import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, Users, AlertCircle, Bell, ArrowRight } from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-10 w-10 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Lumina Guard
                </h1>
                <p className="text-sm text-gray-600">Your Circle of Light</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-purple-600 hover:text-purple-700 font-semibold"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-semibold shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Safety, <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Our Priority</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A global women's safety platform with instant emergency alerts, real-time location tracking, and a trusted safety network.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all flex items-center space-x-2 mx-auto"
          >
            <span>Start Protecting Yourself</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">One-Touch SOS</h3>
            <p className="text-gray-600">
              Instant emergency alerts with a single tap. Your precise location is immediately shared with your trusted emergency contacts, no matter where you are globally.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Location Tracking</h3>
            <p className="text-gray-600">
              Advanced real-time tracking during emergencies with route history. Your guardians see your exact location with battery-optimized precision technology.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Instant Multi-Channel Alerts</h3>
            <p className="text-gray-600">
              Simultaneous email, SMS, and in-app notifications to your safety circle with real-time tracking links. Global delivery infrastructure ensures instant reach.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Safety Circle Network</h3>
            <p className="text-gray-600">
              Build your trusted network of guardians. Unlimited emergency contacts with intelligent notification prioritization based on availability and proximity.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Global Safe Zones</h3>
            <p className="text-gray-600">
              Interactive worldwide map showing police stations, hospitals, embassies, and verified safe locations. Community-driven safety ratings by region.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Community Safety Hub</h3>
            <p className="text-gray-600">
              Anonymous incident reporting, safety tips, and collective awareness. Help create safer communities worldwide through shared knowledge and support.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h3 className="text-3xl font-bold mb-4">Ready to Feel Safer?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of women worldwide who trust Lumina Guard for their safety.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white text-purple-600 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
          >
            Create Free Account
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/90 backdrop-blur-md border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Lumina Guard. Your Circle of Light. 💜</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;