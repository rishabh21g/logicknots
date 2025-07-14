import React, { useEffect, useRef } from 'react';
import CanvasEngine from '../canvas/CanvasEngine';


const CanvasBoard = () => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      engineRef.current = new CanvasEngine(canvas);
      window.canvasEngine = engineRef.current;
    }
  }, []);


 
  
  


  
  

  return (
    
    <div style={{ width: '100%', height: '100vh', background: 'black', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          backgroundColor: '#111',
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'grab',
        }}
      />



       {/* 👁 Right-click menu */}
    {/* <div
      id="customMenu"
      style={{
        position: 'absolute',
        display: 'none',
        backgroundColor: '#222',
        color: 'white',
        border: '1px solid #444',
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '14px',
        cursor: 'pointer',
        zIndex: 9999,
      }}
    >
      👁 Show As Top
    </div> */}
       </div>

       
   
  );
};

export default CanvasBoard;
