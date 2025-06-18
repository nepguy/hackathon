import React, { ReactNode } from 'react';

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
  return (
    <div className={`min-h-screen pb-24 ${className}`}>
      {title && (
        <div className="sticky top-0 z-10 glass border-b border-white/10 backdrop-blur-xl">
          <div className="section-padding">
            <div className="animate-fade-in-up">
              <h1 className="text-3xl font-bold gradient-text mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-slate-600 text-lg">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
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