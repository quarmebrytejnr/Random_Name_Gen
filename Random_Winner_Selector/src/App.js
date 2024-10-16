import React from 'react';
import './App.css';
import RandomWinnerSelector from './RandomWinnerSelector';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Random Winner Selector</h1>
      </header>
      <main>
        <RandomWinnerSelector />
      </main>
    </div>
  );
}

export default App;