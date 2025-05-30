import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Start = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigateToWork = () => {
    setIsLoading(true);
    
    // Simulate loading time before navigation
    setTimeout(() => {
      navigate('/work');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-xl p-12 max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <span className="text-3xl font-bold text-white">S</span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Scout Desktop</h1>
          <p className="text-gray-600">Welcome to your workspace</p>
        </div>

        {/* Navigation Button */}
        <button
          onClick={handleNavigateToWork}
          disabled={isLoading}
          className={`w-full font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isLoading 
              ? 'bg-indigo-400 cursor-not-allowed flex items-center justify-center'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-105'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-white">Loading...</span>
            </>
          ) : (
            "Get Started"
          )}
        </button>
      </div>
    </div>
  );
};

export default Start;