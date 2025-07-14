// src/App.jsx
import React, { useRef, useState } from 'react';
import CanvasBoard from './components/CanvasBoard';
import ReportBugandImprovement from './components/ReportBugandImprovement/ReportBugandImprovement';

function App() {
  
  const [layoutStarted, setLayoutStarted] = useState(false);
  const canvasRef = useRef(null);

  const handleStartNew = () => {
    setLayoutStarted(true);
  };

  const handleLoadJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setLayoutStarted(true);
        setTimeout(() => {
          // Delay to ensure canvas is ready
          if (window.canvasEngine) {
            window.canvasEngine.loadFromJSON(data);
          }
        }, 100);
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className='flex flex-col h-screen w-full relative'>
      <CanvasBoard ref={canvasRef} />
      <ReportBugandImprovement />

    </div>
  );

}

export default App;
