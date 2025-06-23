import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import AddDestinationForm from '../components/destinations/AddDestinationForm';

const AddDestinationPage: React.FC = () => {
  return (
    <PageContainer
      title="Add Destination"
      subtitle="Plan your next adventure safely"
    >
      <div className="max-w-2xl mx-auto">
        <AddDestinationForm />
      </div>
    </PageContainer>
  );
};

export default AddDestinationPage; 