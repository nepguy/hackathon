import React, { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  padding?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  title, 
  padding = true 
}) => {
  return (
    <div className="pt-4 pb-20 min-h-screen bg-gray-50">
      {title && (
        <div className="px-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      )}
      <div className={padding ? 'px-4' : ''}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;