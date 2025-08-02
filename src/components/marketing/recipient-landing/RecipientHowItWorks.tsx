import React from 'react';

const RecipientHowItWorks = () => {
  return (
    <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20 bg-sage-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-light text-navy-800 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-navy-600 max-w-3xl mx-auto">
            Getting started is simple and secure. Here's how you can begin connecting with your donor family.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-coral-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              1
            </div>
            <h3 className="text-xl font-semibold text-navy-800 mb-4">Create Your Profile</h3>
            <p className="text-navy-600">
              Sign up and add your donor information. Share only what you're comfortable with.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-coral-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              2
            </div>
            <h3 className="text-xl font-semibold text-navy-800 mb-4">Find Your Matches</h3>
            <p className="text-navy-600">
              Our system will help identify potential family connections based on your donor information.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-coral-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              3
            </div>
            <h3 className="text-xl font-semibold text-navy-800 mb-4">Start Connecting</h3>
            <p className="text-navy-600">
              Reach out to family members, join groups, and build meaningful relationships.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecipientHowItWorks; 