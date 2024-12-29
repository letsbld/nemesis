import React from 'react';

const HomePage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold mb-4">Welcome to the Home Page</h1>
            <p className="text-lg text-center">This is the home page of the DLP Dashboard.</p>
        </div>
    );
};

export default HomePage;