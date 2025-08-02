import React from 'react';

const RecipientStats = () => {
  return (
    <section className="px-4 sm:px-6 lg:px-12 py-16 bg-sage-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-coral-600 mb-2">15,000+</div>
            <div className="text-navy-600">Families Connected</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-coral-600 mb-2">50,000+</div>
            <div className="text-navy-600">Relationships Mapped</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-coral-600 mb-2">500+</div>
            <div className="text-navy-600">Donor Groups</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecipientStats; 