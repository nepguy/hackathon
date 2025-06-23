import React, { ReactNode, useState, useEffect } from 'react';

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

  useEffect(() => {
    if (!title) return;

    // Auto-hide header after 3 seconds
    const timer = setTimeout(() => {
      if (!isHeaderHovered) {
        setIsHeaderVisible(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, isHeaderHovered]);

  // Show header when user scrolls to top
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setIsHeaderVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`min-h-screen mobile-safe-area ${className}`}>
      {title && (
        <div 
          className={`sticky top-0 z-10 glass border-b border-white/10 backdrop-blur-xl transition-transform duration-500 ease-in-out ${
            isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
          onMouseEnter={() => setIsHeaderHovered(true)}
          onMouseLeave={() => setIsHeaderHovered(false)}
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
          
          {/* Show header indicator when hidden */}
          {!isHeaderVisible && (
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-2 cursor-pointer"
              onClick={() => setIsHeaderVisible(true)}
            >
              <div className="w-12 h-1 bg-blue-500 rounded-full opacity-50 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          )}
        </div>
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