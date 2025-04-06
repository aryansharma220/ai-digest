import { Link } from 'react-router-dom';
import { BeakerIcon, LightBulbIcon, BookOpenIcon, SparklesIcon, RocketLaunchIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
  // Handle scroll events for navbar styling and section highlighting
  useEffect(() => {
    const handleScroll = () => {
      // Update navbar style based on scroll position
      setScrolled(window.scrollY > 10);
      
      // Determine which section is currently visible
      const sections = ['features', 'how-it-works'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex items-center space-x-2 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-600 rounded-full blur-md opacity-30 group-hover:opacity-70 transition-opacity"></div>
                  <SparklesIcon className="h-8 w-8 text-indigo-600 relative z-10 animate-pulse" />
                </div>
                <span className="font-bold text-xl text-indigo-800">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                    AI Digest
                  </span>
                </span>
              </div>
            </div>
            
            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-1">
              <a 
                href="#features" 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeSection === 'features' 
                    ? 'text-white bg-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeSection === 'how-it-works' 
                    ? 'text-white bg-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                How It Works
              </a>
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-indigo-50"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
                {isMenuOpen ? (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute w-full bg-white/95 backdrop-blur-md shadow-lg rounded-b-2xl border-t border-gray-100 animate-fadeDown">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#features" className="text-gray-600 hover:text-indigo-600 block px-3 py-2 rounded-full text-base font-medium hover:bg-indigo-50 transition-all">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 block px-3 py-2 rounded-full text-base font-medium hover:bg-indigo-50 transition-all">How It Works</a>
              <Link to="/login" className="text-gray-600 hover:text-indigo-600 block px-3 py-2 rounded-full text-base font-medium hover:bg-indigo-50 transition-all">Sign In</Link>
              <Link to="/signup" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white block px-3 py-2 rounded-full text-base font-medium my-2">Get Started</Link>
            </div>
          </div>
        )}
      </nav>
      
      {/* Hero Section - completely redesigned for a more modern and impressive look */}
      <div className="relative overflow-hidden pt-20">
        {/* Enhanced floating particles background with 3D effect */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm animate-floatingSlow"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 80 + 20}px`,
                height: `${Math.random() * 80 + 20}px`,
                animationDuration: `${Math.random() * 15 + 15}s`,
                animationDelay: `${Math.random() * 5}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            ></div>
          ))}
        </div>
        
        {/* Modern animated background gradients */}
        <div className="absolute top-20 -right-20 w-96 h-96 bg-indigo-400 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 -left-20 w-96 h-96 bg-purple-400 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-40 w-96 h-96 bg-pink-400 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-blue-400 opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-3000"></div>
        
        {/* Mesh gradient overlay for 3D effect */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15]"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 lg:flex lg:items-center lg:gap-12 min-h-[calc(100vh-5rem)] py-12">
            {/* Hero content */}
            <div className="lg:w-1/2 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
              <div className="space-y-8">
                {/* Animated badge */}
                <div className="inline-flex animate-fadeIn">
                  <span className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 backdrop-blur-sm text-indigo-600 font-medium px-4 py-1.5 rounded-full text-sm flex items-center gap-2">
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    AI-Powered Digest Platform
                  </span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight animate-fadeIn">
                  <span className="block text-gray-900">Stay ahead of the</span>
                  <span className="block mt-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 animate-gradient-x">
                    AI revolution
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl animate-fadeIn animation-delay-200">
                  AI Digest automatically collects, summarizes, and categorizes the latest developments in AI from GitHub, Hugging Face, and ArXiv, delivered in a digestible format.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fadeIn animation-delay-400">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span>Get Started</span>
                    <svg className="ml-2 -mr-1 w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </Link>
                  
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium rounded-full text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-transparent shadow-sm hover:shadow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span>Sign In</span>
                  </Link>
                </div>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-16 grid grid-cols-3 gap-4 animate-fadeIn animation-delay-600">
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">500+</div>
                  <div className="text-sm text-gray-500 text-center">Daily Digests</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">50K+</div>
                  <div className="text-sm text-gray-500 text-center">AI Researchers</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">3</div>
                  <div className="text-sm text-gray-500 text-center">Top AI Sources</div>
                </div>
              </div>
            </div>
            
            {/* Creative 3D card showcase */}
            <div className="lg:w-1/2 mt-12 lg:mt-0 px-4 sm:px-6 lg:px-8 perspective-1000">
              <div className="relative w-full max-w-lg mx-auto animate-floatingCard">
                {/* Decorative elements */}
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-1000"></div>
                <div className="absolute -bottom-8 right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-3000"></div>
                
                {/* 3D Card Stack */}
                <div className="relative">
                  {/* Background card 3 */}
                  <div className="absolute top-12 -right-6 transform rotate-6 translate-z-[-120px]">
                    <div className="h-56 w-96 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 blur-sm opacity-60"></div>
                  </div>
                  
                  {/* Background card 2 */}
                  <div className="absolute top-6 -left-6 transform -rotate-6 translate-z-[-60px]">
                    <div className="h-56 w-96 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 blur-sm opacity-60"></div>
                  </div>
                  
                  {/* Main card */}
                  <div className="relative bg-white backdrop-blur-xl backdrop-filter rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                    {/* Card header */}
                    <div className="p-5 bg-gradient-to-r from-indigo-500 to-purple-600">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <SparklesIcon className="h-5 w-5 text-yellow-300 animate-pulse" />
                          Today's AI Digest
                        </h3>
                        <div className="text-xs text-white/80 font-medium">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Card content - showing multiple digest cards */}
                    <div className="divide-y divide-gray-100">
                      {/* Digest Item 1 */}
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">New LLM Achieves State-of-the-Art Results</h4>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                              Researchers introduce an improved architecture with better reasoning capabilities and reduced hallucinations.
                            </p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">ArXiv</span>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">LLM</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Research</span>
                        </div>
                      </div>
                      
                      {/* Digest Item 2 */}
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">Multimodal Architecture for Vision-Language Tasks</h4>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                              A new approach combining transformer-based vision and language models for improved performance.
                            </p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Hugging Face</span>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800">Multimodal</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Vision</span>
                        </div>
                      </div>
                      
                      {/* Card footer */}
                      <div className="p-4 flex justify-between items-center bg-gray-50">
                        <div className="text-sm font-medium text-indigo-600">View all digests</div>
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-pink-400 border-2 border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-blue-400 border-2 border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-green-400 border-2 border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-500 font-medium">+5</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-12 right-20 text-indigo-500 opacity-20 animate-spin-slow">
                  <svg className="w-20 h-20" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 0 L100 50 L50 100 L0 50 Z" />
                  </svg>
                </div>
                <div className="absolute -bottom-14 left-20 text-purple-500 opacity-20 animate-spin-slow animation-direction-reverse animation-delay-2000">
                  <svg className="w-28 h-28" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="50" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section - Enhanced with 3D cards and interactive elements */}
      <div id="features" className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <div className="inline-flex bg-indigo-50 p-1 rounded-full mb-3 animate-fadeIn">
              <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">FEATURES</span>
              <span className="px-4 py-1 text-sm text-indigo-600">What makes us different</span>
            </div>
            <h2 className="text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 animate-fadeIn">
              Everything you need to stay informed
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto animate-fadeIn animation-delay-200">
              Our AI-powered platform keeps you up-to-date with the latest advancements in artificial intelligence.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 - Enhanced 3D Card */}
              <div className="group perspective h-full">
                <div className="relative h-full transform transition-all duration-500 group-hover:rotate-y-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                  <div className="relative h-full px-7 py-8 bg-white ring-1 ring-gray-200 rounded-2xl shadow-xl flex flex-col items-center">
                    <div className="flex-shrink-0 mb-5">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl transition-all">
                        <RocketLaunchIcon className="h-8 w-8 transform transition-transform group-hover:scale-110" />
                      </div>
                    </div>
                    <h3 className="text-xl leading-6 font-bold text-gray-900 text-center mb-3">Multi-Source Aggregation</h3>
                    <p className="text-base text-gray-500 text-center flex-grow">
                      We collect the latest AI developments from GitHub, Hugging Face, and ArXiv, ensuring you never miss important updates.
                    </p>
                    <div className="mt-5 w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Feature 2 - Enhanced 3D Card */}
              <div className="group perspective h-full">
                <div className="relative h-full transform transition-all duration-500 group-hover:rotate-y-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt animation-delay-200"></div>
                  <div className="relative h-full px-7 py-8 bg-white ring-1 ring-gray-200 rounded-2xl shadow-xl flex flex-col items-center">
                    <div className="flex-shrink-0 mb-5">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-600 text-white shadow-lg group-hover:shadow-xl transition-all">
                        <SparklesIcon className="h-8 w-8 transform transition-transform group-hover:scale-110" />
                      </div>
                    </div>
                    <h3 className="text-xl leading-6 font-bold text-gray-900 text-center mb-3">AI-Powered Summaries</h3>
                    <p className="text-base text-gray-500 text-center flex-grow">
                      Advanced AI models generate concise summaries of complex research papers and repositories, saving you hours of reading.
                    </p>
                    <div className="mt-5 w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Feature 3 - Enhanced 3D Card */}
              <div className="group perspective h-full">
                <div className="relative h-full transform transition-all duration-500 group-hover:rotate-y-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt animation-delay-400"></div>
                  <div className="relative h-full px-7 py-8 bg-white ring-1 ring-gray-200 rounded-2xl shadow-xl flex flex-col items-center">
                    <div className="flex-shrink-0 mb-5">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-lg group-hover:shadow-xl transition-all">
                        <LightBulbIcon className="h-8 w-8 transform transition-transform group-hover:scale-110" />
                      </div>
                    </div>
                    <h3 className="text-xl leading-6 font-bold text-gray-900 text-center mb-3">Smart Categorization</h3>
                    <p className="text-base text-gray-500 text-center flex-grow">
                      Automatic tagging and categorization helps you find exactly what you're looking for, whether it's LLMs, computer vision, or reinforcement learning.
                    </p>
                    <div className="mt-5 w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Feature 4 - Enhanced 3D Card */}
              <div className="group perspective h-full">
                <div className="relative h-full transform transition-all duration-500 group-hover:rotate-y-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt animation-delay-600"></div>
                  <div className="relative h-full px-7 py-8 bg-white ring-1 ring-gray-200 rounded-2xl shadow-xl flex flex-col items-center">
                    <div className="flex-shrink-0 mb-5">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-tr from-green-500 to-blue-600 text-white shadow-lg group-hover:shadow-xl transition-all">
                        <BookOpenIcon className="h-8 w-8 transform transition-transform group-hover:scale-110" />
                      </div>
                    </div>
                    <h3 className="text-xl leading-6 font-bold text-gray-900 text-center mb-3">Personalized Digest</h3>
                    <p className="text-base text-gray-500 text-center flex-grow">
                      Set your preferences to receive personalized digests that focus on your areas of interest.
                    </p>
                    <div className="mt-5 w-12 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Section: Data Sources */}
      <div className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Trusted Sources, Analyzed by AI
            </h2>
            <p className="text-xl text-gray-500">
              We aggregate content from the most respected AI sources, processed by advanced language models.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* ArXiv Source */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 shadow-xl rounded-3xl transform group-hover:scale-[1.02] transition-transform"></div>
                <div className="relative bg-white p-6 rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col items-center text-center h-full group-hover:-translate-y-1 transition-transform">
                  <div className="w-20 h-20 flex items-center justify-center bg-red-100 rounded-full mb-4">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">ArXiv Papers</h3>
                  <p className="text-gray-500 mb-4 flex-grow">
                    Cutting-edge research papers in machine learning, deep learning, and artificial intelligence.
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-100 w-full">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Updated daily</span>
                      <span className="text-sm font-medium text-red-600">1,000+ papers</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* HuggingFace Source */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 shadow-xl rounded-3xl transform group-hover:scale-[1.02] transition-transform"></div>
                <div className="relative bg-white p-6 rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col items-center text-center h-full group-hover:-translate-y-1 transition-transform">
                  <div className="w-20 h-20 flex items-center justify-center bg-yellow-100 rounded-full mb-4">
                    <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Hugging Face Models</h3>
                  <p className="text-gray-500 mb-4 flex-grow">
                    Latest models, datasets, and spaces from the leading platform for machine learning.
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-100 w-full">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Real-time updates</span>
                      <span className="text-sm font-medium text-yellow-600">50,000+ models</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* GitHub Source */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 shadow-xl rounded-3xl transform group-hover:scale-[1.02] transition-transform"></div>
                <div className="relative bg-white p-6 rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col items-center text-center h-full group-hover:-translate-y-1 transition-transform">
                  <div className="w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full mb-4">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">GitHub Repositories</h3>
                  <p className="text-gray-500 mb-4 flex-grow">
                    Trending AI repositories with implementations, tools, and libraries from the global developer community.
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-100 w-full">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Daily trending</span>
                      <span className="text-sm font-medium text-blue-600">10,000+ repos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works - Enhanced with animations, better visuals and interactions */}
      <div id="how-it-works" className="py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-3000"></div>
        <div className="absolute bottom-20 -left-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.07]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:text-center">
            <div className="inline-flex items-center bg-indigo-50 p-1 rounded-full mb-3 animate-fadeIn">
              <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">PROCESS</span>
              <span className="px-4 py-1 text-sm text-indigo-600">How it all works</span>
            </div>
            <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 animate-fadeIn">
              How AI Digest works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto animate-fadeIn animation-delay-200">
              Our intelligent pipeline delivers high-quality AI insights through a sophisticated three-step process.
            </p>
          </div>
          
          <div className="mt-20">
            <div className="relative">
              {/* Timeline line with animated pulse effect */}
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-indigo-300 via-purple-300 to-indigo-300 rounded-full opacity-70">
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-indigo-400 via-purple-400 to-indigo-400 animate-pulse rounded-full"></div>
              </div>
              
              {/* Connecting dots with animated ping effect */}
              <div className="hidden lg:block absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative h-4 w-4 rounded-full bg-indigo-400">
                  <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75"></div>
                </div>
              </div>
              <div className="hidden lg:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative h-4 w-4 rounded-full bg-purple-400">
                  <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-75 animation-delay-700"></div>
                </div>
              </div>
              <div className="hidden lg:block absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
                <div className="relative h-4 w-4 rounded-full bg-indigo-400">
                  <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75 animation-delay-1400"></div>
                </div>
              </div>
              
              {/* Steps */}
              <div className="space-y-24 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-12">
                {/* Step 1 - Enhanced with better animations and effects */}
                <div className="relative group lg:mt-16" data-aos="fade-up" data-aos-delay="0">
                  <div className="lg:flex lg:items-start lg:flex-col">
                    <div className="flex-shrink-0 flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xl group-hover:shadow-2xl transition-all duration-300 z-10 mx-auto mb-8 border-4 border-white lg:translate-y-[-1rem]">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold leading-none">01</span>
                        <div className="w-12 h-0.5 bg-white/50 my-1"></div>
                        <span className="text-xs font-medium uppercase tracking-wider">Collect</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-8 shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-indigo-50 border border-gray-100 relative z-20">
                      <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-4 text-center flex flex-col items-center">
                        <span>Data Collection</span>
                        <div className="w-12 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full mt-3"></div>
                      </h3>
                      <p className="text-base text-gray-500 text-center mb-6">
                        Our intelligent crawlers continuously scan GitHub, Hugging Face, and ArXiv to identify and collect the latest AI repositories, models, and research papers as they're published.
                      </p>
                      <div className="flex justify-center">
                        <div className="flex space-x-2 items-center p-3 bg-indigo-50 rounded-lg text-indigo-700 text-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Updated multiple times daily</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 2 - Enhanced with better animations and effects */}
                <div className="relative group" data-aos="fade-up" data-aos-delay="200">
                  <div className="lg:flex lg:items-start lg:flex-col">
                    <div className="flex-shrink-0 flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-xl group-hover:shadow-2xl transition-all duration-300 z-10 mx-auto mb-8 border-4 border-white">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold leading-none">02</span>
                        <div className="w-12 h-0.5 bg-white/50 my-1"></div>
                        <span className="text-xs font-medium uppercase tracking-wider">Process</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-8 shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-purple-50 border border-gray-100 relative z-20">
                      <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-4 text-center flex flex-col items-center">
                        <span>AI Processing</span>
                        <div className="w-12 h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mt-3"></div>
                      </h3>
                      <p className="text-base text-gray-500 text-center mb-6">
                        State-of-the-art language models analyze and process the collected content, generating concise summaries, extracting key insights, and automatically assigning relevant categories and tags.
                      </p>
                      <div className="flex justify-center">
                        <div className="flex space-x-2 items-center p-3 bg-purple-50 rounded-lg text-purple-700 text-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span>Powered by advanced AI models</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 3 - Enhanced with better animations and effects */}
                <div className="relative group lg:mt-32" data-aos="fade-up" data-aos-delay="400">
                  <div className="lg:flex lg:items-start lg:flex-col">
                    <div className="flex-shrink-0 flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 text-white shadow-xl group-hover:shadow-2xl transition-all duration-300 z-10 mx-auto mb-8 border-4 border-white lg:translate-y-[-1rem]">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold leading-none">03</span>
                        <div className="w-12 h-0.5 bg-white/50 my-1"></div>
                        <span className="text-xs font-medium uppercase tracking-wider">Deliver</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-8 shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-indigo-50 border border-gray-100 relative z-20">
                      <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-4 text-center flex flex-col items-center">
                        <span>Personalized Delivery</span>
                        <div className="w-12 h-1 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full mt-3"></div>
                      </h3>
                      <p className="text-base text-gray-500 text-center mb-6">
                        Our intelligent recommendation system delivers a personalized feed of AI digests tailored to your interests, ensuring you only see content that's relevant to your specific areas of focus.
                      </p>
                      <div className="flex justify-center">
                        <div className="flex space-x-2 items-center p-3 bg-indigo-50 rounded-lg text-indigo-700 text-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          <span>Customized to your preferences</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Statistics section */}
            <div className="mt-24 bg-white/50 backdrop-filter backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white animate-fadeIn animation-delay-800">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">24/7</div>
                  <div className="mt-2 text-sm text-gray-500">Continuous collection</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">3.2M+</div>
                  <div className="mt-2 text-sm text-gray-500">Papers processed</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">98%</div>
                  <div className="mt-2 text-sm text-gray-500">Categorization accuracy</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">5 min</div>
                  <div className="mt-2 text-sm text-gray-500">Average processing time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="relative overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900"></div>
        
        {/* Animated background particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white opacity-10"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 40 + 10}px`,
                height: `${Math.random() * 40 + 10}px`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${Math.random() * 20 + 10}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Background decorations */}
        <div className="absolute top-0 left-0 -rotate-12 transform -translate-x-1/4 -translate-y-1/4">
          <div className="w-80 h-80 bg-white opacity-5 rounded-full"></div>
        </div>
        <div className="absolute bottom-0 right-0 rotate-12 transform translate-x-1/4 translate-y-1/4">
          <div className="w-80 h-80 bg-white opacity-5 rounded-full"></div>
        </div>
        
        <div className="relative max-w-2xl mx-auto text-center py-20 px-4 sm:py-28 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl animate-fadeIn">
            <span className="block">Ready to stay ahead in AI?</span>
            <span className="block mt-2">Start using AI Digest today.</span>
          </h2>
          <p className="mt-6 text-lg leading-7 text-indigo-100 animate-fadeIn animation-delay-200">
            Join the community of AI practitioners who rely on our digest to stay informed.
          </p>
          <div className="mt-10 animate-fadeIn animation-delay-400">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-6 w-6 text-indigo-500" />
              <span className="font-bold text-lg text-indigo-700">AI Digest</span>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} AI Digest. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
