// src/App.jsx
import React, { useRef, useState } from "react";
import CanvasBoard from "./components/CanvasBoard";
import ReportBugandImprovement from "./components/ReportBugandImprovement/ReportBugandImprovement";
import { DialpadRounded } from "@mui/icons-material";

function App() {
  const [layoutStarted, setLayoutStarted] = useState(false);
  const [openBox, setOpenBox] = useState(false);
  const canvasRef = useRef(null);

  const handleStartNew = () => {
    setLayoutStarted(true);
  };

  return (
    <div className={`flex flex-col h-screen w-full relative `}>
      <CanvasBoard ref={canvasRef} />
      <div
        className={`absolute bg-black rounded-md size-10 p-2  m-2 hover:bg-black/95 transition-all duration-200 `}
        onClick={() => setOpenBox(!openBox)}
      >
        <DialpadRounded className=" text-neutral-100  " />
      </div>
      {openBox && <ReportBugandImprovement />}
    </div>
  );
}

export default App;

// const handleLoadJSON = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       try {
//         const data = JSON.parse(event.target.result);
//         setLayoutStarted(true);
//         setTimeout(() => {
//           // Delay to ensure canvas is ready
//           if (window.canvasEngine) {
//             window.canvasEngine.loadFromJSON(data);
//           }
//         }, 100);
//       } catch (err) {
//         alert("Invalid JSON file");
//       }
//     };
//     reader.readAsText(file);
//   };
