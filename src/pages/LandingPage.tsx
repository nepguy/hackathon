import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Globe, MapPin, Bell, ArrowRight, Star, Users, Award } from 'lucide-react'

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Real-time Safety Alerts',
      description: 'Stay informed with instant notifications about safety conditions in your destination.',
      color: 'text-danger-500'
    },
    {
      icon: Globe,
      title: 'Global Destination Insights',
      description: 'Explore destinations worldwide with comprehensive safety ratings and local information.',
      color: 'text-primary-500'
    },
    {
      icon: MapPin,
      title: 'Interactive Safety Maps',
      description: 'Visualize safety information, weather alerts, and points of interest on interactive maps.',
      color: 'text-secondary-500'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Receive personalized alerts based on your travel plans and preferences.',
      color: 'text-accent-500'
    }
  ]

  const stats = [
    { number: '50K+', label: 'Active Travelers', icon: Users },
    { number: '200+', label: 'Countries Covered', icon: Globe },
    { number: '99.9%', label: 'Uptime Reliability', icon: Award },
    { number: '4.9', label: 'User Rating', icon: Star }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation */}
      <nav className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">TravelSafe</span>
            </div>
            <Link
              to="/auth"
              className="btn btn-primary flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Travel Safely,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                {' '}Explore Confidently
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your comprehensive travel safety companion. Get real-time alerts, safety insights, 
              and peace of mind wherever your journey takes you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="btn btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2"
              >
                <span>Start Your Journey</span>
                <ArrowRight size={20} />
              </Link>
              <button className="btn btn-outline text-lg px-8 py-4">
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <div className="glass p-4 rounded-2xl animate-pulse-slow">
            <Shield size={24} className="text-primary-500" />
          </div>
        </div>
        <div className="absolute top-40 right-20 opacity-20">
          <div className="glass p-4 rounded-2xl animate-pulse-slow" style={{ animationDelay: '1s' }}>
            <Globe size={24} className="text-secondary-500" />
          </div>
        </div>
        <div className="absolute bottom-20 left-20 opacity-20">
          <div className="glass p-4 rounded-2xl animate-pulse-slow" style={{ animationDelay: '2s' }}>
            <MapPin size={24} className="text-accent-500" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="glass p-6 rounded-2xl mb-4 inline-block">
                  <stat.icon size={32} className="text-primary-600 mx-auto" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Safe Travel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and insights to keep you informed and protected throughout your journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card card-hover p-6 text-center">
                <div className={`inline-flex p-3 rounded-full bg-gray-50 mb-4 ${feature.color}`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Travel with Confidence?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of travelers who trust TravelSafe for their journeys.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <span>Get Started Free</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-primary-400" />
              <span className="text-lg font-semibold">TravelSafe</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 TravelSafe. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage