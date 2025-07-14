// src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import CanvasBoard from "./components/CanvasBoard";
import ReportBugandImprovement from "./components/ReportBugandImprovement/ReportBugandImprovement";

function App() {
  const [layoutStarted, setLayoutStarted] = useState(false);
  const [dots, setDots] = useState({
    bugs: [],
    improvement: [],
    query: [],
  });
  const tabs = useState("bug");
  const [currentTab] = tabs;
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

  const [coOrdinates, setCoOrdiantes] = useState({});

  const setOpenCommentBox = () => {};
  const onClickEvent = (x, y, e) => {
    setCoOrdiantes({ x: x, y: y });
    setOpenCommentBox();
  };

  // when clicked on canvas , comment box will open -> you have co-ordinates and currentTab, 
  // when user comments -> append the coOrdiantes in respective tab.
  // 

  return (
    <div className="flex flex-col h-screen w-full relative">
      <CanvasBoard ref={canvasRef} onClickEvent={onClickEvent} />
      <ReportBugandImprovement tabs={tabs} />
    </div>
  );
}

export default App;
