import React, { ReactNode, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  padding?: boolean;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  title, 
  subtitle,
  padding = true,
  className = ''
}) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (!title) return;

    // Auto-hide header after 4 seconds
    const timer = setTimeout(() => {
      if (!isHeaderHovered) {
        setIsHeaderVisible(false);
        // Show indicator after header is hidden
        setTimeout(() => setShowIndicator(true), 500);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [title, isHeaderHovered]);

  // Show header when user scrolls to top
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0 && !isHeaderVisible) {
        setIsHeaderVisible(true);
        setShowIndicator(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHeaderVisible]);

  const handleShowHeader = () => {
    setIsHeaderVisible(true);
    setShowIndicator(false);
  };

  const handleHeaderMouseEnter = () => {
    setIsHeaderHovered(true);
  };

  const handleHeaderMouseLeave = () => {
    setIsHeaderHovered(false);
    // Start auto-hide timer again when mouse leaves
    if (isHeaderVisible) {
      setTimeout(() => {
        if (!isHeaderHovered) {
          setIsHeaderVisible(false);
          setTimeout(() => setShowIndicator(true), 500);
        }
      }, 2000);
    }
  };

  return (
    <div className={`min-h-screen mobile-safe-area ${className}`}>
      {title && (
        <>
          {/* Main Header */}
          <div 
            className={`sticky top-0 z-10 glass border-b border-white/10 backdrop-blur-xl transition-all duration-500 ease-in-out ${
              isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
            onMouseEnter={handleHeaderMouseEnter}
            onMouseLeave={handleHeaderMouseLeave}
          >
            <div className="section-padding">
              <div className="animate-fade-in-up">
                <h1 className="mobile-title font-bold gradient-text mb-2">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-slate-600 mobile-text">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Show Header Indicator */}
          {showIndicator && !isHeaderVisible && (
            <div 
              className="fixed top-0 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer group"
              onClick={handleShowHeader}
            >
              <div className="bg-blue-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-b-lg shadow-lg transition-all duration-300 hover:bg-blue-600/90 hover:shadow-xl animate-slide-down">
                <div className="flex items-center space-x-2">
                  <ChevronDown className="w-4 h-4 group-hover:animate-bounce" />
                  <span className="text-sm font-medium">Show Header</span>
                  <ChevronDown className="w-4 h-4 group-hover:animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      <div className={`${padding ? 'section-padding' : ''} page-enter`}>
        <div className="container-max">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageContainer;