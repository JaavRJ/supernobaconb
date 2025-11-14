import React, { useState } from 'react';
//import logo from './logo.svg';
import './App.css';
import LoadingScreen from './components/LoadingScreen';
import HomePage from './pages/HomePage';


function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleAnimationEnd = () => {
    setIsLoading(false);
  };

  return (
    <div className="App">
      {isLoading ? (
        <LoadingScreen onAnimationEnd={handleAnimationEnd} />
      ) : (
        <HomePage />
      )}
    </div>
  );
}

export default App;
