import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { 
  Shield, MapPin, Bell, Users, Star, ArrowRight, 
  Plane, Camera, Compass, Menu, X, Sun, Moon,
  Globe, Heart, Zap
} from 'lucide-react'
import { useStatistics } from '../lib/userDataService'

const LandingPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [animatedStats, setAnimatedStats] = useState({ travelers: 0, countries: 0, rating: 0 })
  
  // Get real-time statistics
  const { stats, setStatistics } = useStatistics()
  
  // Use refs to track animation state and prevent loops
  const animationInProgress = useRef(false)
  const initializedStats = useRef(false)
  const lastAnimatedStats = useRef({ travelers: 0, countries: 0, rating: 0 })

  // Memoized animation function to prevent recreation
  const animateNumber = useCallback((target: number, key: string, duration: number = 2000) => {
    if (animationInProgress.current) return
    
    const start = Date.now()
    const startValue = lastAnimatedStats.current[key as keyof typeof lastAnimatedStats.current] || 0
    
    if (startValue === target) return // No need to animate if values are the same
    
    animationInProgress.current = true
    
    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - start) / duration, 1)
      const current = Math.floor(startValue + (target - startValue) * progress)
      
      setAnimatedStats(prev => ({ ...prev, [key]: current }))
      lastAnimatedStats.current = { ...lastAnimatedStats.current, [key]: current }
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        animationInProgress.current = false
      }
    }
    animate()
  }, [])

  // Initialize statistics ONCE on mount - separate from animation
  useEffect(() => {
    if (!initializedStats.current && stats.safeTravelers === 0) {
      setStatistics({
        safeTravelers: 127500,
        countriesCovered: 195,
        safetyRating: 4.8,
        incidentsPrevented: 28947,
        activeUsers: 4832
      })
      initializedStats.current = true
    }
  }, [setStatistics]) // Only depend on setStatistics, not stats

  // Animate when real stats change - separate effect
  useEffect(() => {
    if (initializedStats.current && stats.safeTravelers > 0) {
      animateNumber(stats.safeTravelers, 'travelers')
      animateNumber(stats.countriesCovered, 'countries')
      animateNumber(Math.round(stats.safetyRating * 10), 'rating')
    }
  }, [stats.safeTravelers, stats.countriesCovered, stats.safetyRating, animateNumber])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const features = [
    {
      icon: Shield,
      title: 'Real-time Safety Intelligence',
      description: 'AI-powered safety monitoring with instant alerts about scams, dangers, and local incidents.',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      icon: Globe,
      title: 'Global Travel Community',
      description: `Connect with ${Math.floor(stats.safeTravelers / 1000)}K+ travelers sharing real experiences, tips, and safety insights.`,
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: MapPin,
      title: 'Smart Location Services',
      description: 'Intelligent maps with weather alerts, local events, and crowd-sourced safety data.',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Bell,
      title: 'Personalized Travel Assistant',
      description: 'Custom alerts based on your destinations, preferences, and real-time conditions.',
      gradient: 'from-purple-500 to-pink-500'
    }
  ]

  const travelStories = [
    {
      author: 'Sarah Chen',
      location: 'Tokyo, Japan',
      story: 'As a solo female traveler, Guard Nomand was a lifesaver in Tokyo! The app warned me about a phone scam targeting tourists near Shibuya Station just 30 minutes before I arrived there. The local safety tips helped me avoid crowded areas during rush hour, and the emergency contact feature gave my family peace of mind. I felt confident exploring even the quieter neighborhoods knowing I had real-time safety support.',
      rating: 5,
      avatar: '👩‍💼',
      category: 'Solo Travel',
      date: '2 weeks ago',
      verified: true
    },
    {
      author: 'Mike Rodriguez',
      location: 'Santorini, Greece',
      story: 'Our honeymoon could have been ruined by the unexpected storm that hit Santorini, but Guard Nomand sent us weather alerts 6 hours before it arrived. We were able to reschedule our sunset dinner and move to indoor activities. The app also recommended safe transportation during the storm and helped us find alternative romantic spots. The local event notifications led us to a traditional Greek music night we never would have found otherwise!',
      rating: 5,
      avatar: '👨‍💻',
      category: 'Couple Travel',
      date: '1 month ago',
      verified: true
    },
    {
      author: 'Emma Thompson',
      location: 'Banff, Canada',
      story: 'Planning a family trip with two kids (ages 8 and 12) to Banff was stressful until I found Guard Nomand. The app provided detailed safety information for hiking trails, warned us about wildlife activity areas, and even sent notifications about family-friendly events happening during our stay. When our youngest got separated at Lake Louise, the emergency features helped park rangers locate him quickly. This app made our family adventure both safe and memorable.',
      rating: 5,
      avatar: '👩‍🏫',
      category: 'Family Travel',
      date: '3 weeks ago',
      verified: true
    },
    {
      author: 'James Wilson',
      location: 'Bangkok, Thailand',
      story: 'First time in Southeast Asia and Guard Nomad was essential! The app alerted me to a taxi scam at the airport, recommended legitimate transportation options, and provided real-time updates about street food safety. The cultural tips helped me navigate local customs respectfully, and the health alerts about water quality probably saved me from getting sick. The community feature connected me with other travelers who shared amazing local recommendations.',
      rating: 5,
      avatar: '🧑‍💼',
      category: 'Backpacking',
      date: '1 week ago',
      verified: true
    },
    {
      author: 'Lisa Martinez',
      location: 'Rome, Italy',
      story: 'Guard Nomand turned our business trip into a safe and enjoyable experience. The app warned us about pickpocket hotspots near the Colosseum and Vatican, provided real-time updates about transport strikes, and recommended secure restaurants for our client dinners. The professional traveler features helped us stay connected with our team while navigating the city safely. Even found time for some sightseeing thanks to the safety confidence the app provided!',
      rating: 4,
      avatar: '👩‍💻',
      category: 'Business Travel',
      date: '5 days ago',
      verified: true
    },
    {
      author: 'Alex Chen',
      location: 'Reykjavik, Iceland',
      story: 'The Northern Lights tour I booked through a local operator seemed sketchy, but Guard Nomand had reviews and safety ratings for tour companies. It helped me choose a reputable guide instead. The weather alerts were crucial for planning our glacier hiking - we avoided dangerous conditions twice. The app even connected me with other solo travelers for group activities, making the trip both safer and more social. Absolutely essential for adventure travel!',
      rating: 5,
      avatar: '🧑‍🎓',
      category: 'Adventure Travel',
      date: '2 months ago',
      verified: true
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Guard Nomand
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Features</a>
              <a href="#stories" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Stories</a>
              <a href="#community" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Community</a>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <Link
                to="/auth"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="px-4 py-4 space-y-4">
                <a href="#features" className="block text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Features</a>
                <a href="#stories" className="block text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Stories</a>
                <a href="#community" className="block text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Community</a>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                  >
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>
                  <Link
                    to="/auth"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/20"></div>
        
        {/* Floating Travel Icons */}
        <div className="absolute top-20 left-10 opacity-30 animate-float">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Plane className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="absolute top-40 right-20 opacity-30 animate-float-delay-1">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Compass className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="absolute bottom-20 left-20 opacity-30 animate-float-delay-2">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Camera className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* Kody-style Character */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
                  <span className="text-6xl">🧳</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Helping travelers make the world
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                safer through smart technology.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Guard Nomand is your personal travel-safety ally. Whether you're hopping between cities or exploring off-the-beaten-path, our app delivers real-time alerts, reliable local insights, and one-tap emergency support—so you can focus on the adventure and leave the worry behind. Ready to travel with confidence? Try Guard Nomand today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/auth"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Start Your Safe Journey</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Animated Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/20 dark:border-gray-700/20">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {animatedStats.travelers.toLocaleString()}+
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Protected Travelers</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {stats.activeUsers.toLocaleString()} active this month
                </div>
              </div>
              <div className="text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/20 dark:border-gray-700/20">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  {animatedStats.countries}
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Countries & Territories</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Real-time coverage
                </div>
              </div>
              <div className="text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/20 dark:border-gray-700/20">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  {(animatedStats.rating / 10).toFixed(1)}★
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">User Rating</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Based on {Math.floor(stats.safeTravelers / 100)} reviews
                </div>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* Having a hard time with travel safety? */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Having a hard time staying safe while traveling?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Well, you're in the right place. GuardNomad is your one-stop platform for everything you need to travel safely and confidently.
            </p>
            
            {/* Stats like Kent's blog stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Real-time Safety
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Our <strong>AI-powered safety system</strong> has prevented {stats.incidentsPrevented.toLocaleString()} travel incidents worldwide. 
                  Get real-time protection from scams, weather emergencies, local dangers, and security threats.
                </p>
                <div className="mt-4 text-sm text-blue-600 dark:text-blue-400 font-medium">
                  <strong>98.7%</strong> incident prevention rate
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  Travel Community
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Join <strong>{stats.safeTravelers.toLocaleString()}+ travelers</strong> sharing real experiences and safety tips. 
                  Connect with like-minded explorers who prioritize safe travel.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  Global Coverage
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Covering <strong>{stats.countriesCovered}+ countries</strong> with local insights, weather data, 
                  and safety information updated in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Are you ready to level up? */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Are you ready to level up your travel safety?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Check out some of our safety features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6">
                  <button className="text-blue-600 dark:text-blue-400 font-medium flex items-center space-x-2 group-hover:space-x-3 transition-all duration-200">
                    <span>Learn more</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Stories Section */}
      <section id="stories" className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Trusted by Travelers Worldwide
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Join thousands of travelers who've made their journeys safer with Guard Nomand. Here are real stories from our community about how our app helped them navigate challenges and discover amazing experiences.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>All reviews verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>4.8/5 average rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>50K+ active users</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {travelStories.slice(0, 6).map((story, index) => (
              <div key={index} className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                {/* Story Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                        {story.avatar}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900 dark:text-white">{story.author}</span>
                          {story.verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{story.location}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{story.date}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(story.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">({story.rating}/5)</span>
                  </div>
                </div>
                
                {/* Story Content */}
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-sm">
                    "{story.story.length > 180 ? story.story.substring(0, 180) + '...' : story.story}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                      {story.category}
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline">
                      Read more
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Show More Button */}
          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto">
              <span>View All {travelStories.length} Stories</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Meet like-minded people */}
      <section id="community" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Meet like-minded travelers who face similar challenges.
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Join our community and get better at safe travel together.
            </p>
            <Link
              to="/auth"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              Join the TravelSafe Community
            </Link>
          </div>

          {/* Community Features */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Share Your Travel Stories
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Help fellow travelers by sharing your experiences, safety tips, and hidden gems.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Connect with Travelers
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Find travel buddies, get local recommendations, and build lasting friendships.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Real-time Safety Updates
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Get instant notifications about safety conditions from our global community.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Character illustration like Kent's */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-3xl p-12 text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-6xl">🌍</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Want to travel safely together?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Let me know ✌️
                </p>
                <Link
                  to="/auth"
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  For sure! Let's do it!
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Let me show you what I'm working on...🧑‍💻
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Big travel safety enthusiast */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <div className="inline-block w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🧳</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Big travel safety enthusiast.
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  With a big heart for helping travelers.
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                I'm a travel safety engineer and educator, and I'm active in the travel community. 
                And I'm also a husband, father, and a big extreme sports and sustainability enthusiast.
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white text-center shadow-2xl">
                <div className="text-6xl mb-4">🏔️</div>
                <h3 className="text-2xl font-bold mb-4">Travel Safety Expert</h3>
                <p className="text-blue-100 mb-6">
                  Full-time educator making travel safer for everyone
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Stay up to date
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to the newsletter to stay up to date with safety alerts, travel tips, and much more!
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="space-y-4">
              <input
                type="url"
                placeholder="Your website"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <input
                type="text"
                placeholder="First name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200">
                Sign me up
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-300">
                <div>Email TravelSafe</div>
                <div>Call TravelSafe</div>
                <div>Office hours</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">General</h3>
              <div className="space-y-2 text-gray-300">
                <div>My Mission</div>
                <div>Privacy policy</div>
                <div>Terms of use</div>
                <div>Code of conduct</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Sitemap</h3>
              <div className="space-y-2 text-gray-300">
                <div>Home</div>
                <div>Safety Features</div>
                <div>Community</div>
                <div>Travel Stories</div>
                <div>About</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Stay up to date</h3>
              <p className="text-gray-300 text-sm mb-4">
                Subscribe to the newsletter to stay up to date with safety alerts, travel tips, and much more!
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded text-sm font-medium hover:shadow-lg transition-all duration-200">
                  Sign me up
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Guard Nomand</span>
              <span className="text-gray-400 text-sm">Full time educator making travel safer</span>
            </div>
            <div className="text-gray-400 text-sm">
              All rights reserved © Guard Nomand 2025
            </div>
          </div>
        </div>
      </footer>

      {/* Built with Bolt.new Badge */}
      <div className="fixed bottom-4 right-4 z-50">
        <a 
          href="https://bolt.new" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-2 bg-black text-white px-3 py-2 rounded-full text-xs font-medium shadow-lg hover:bg-gray-800 transition-colors"
        >
          <span>⚡</span>
          <span>Built with Bolt.new</span>
        </a>
      </div>
    </div>
  )
}

export default LandingPage