import React, { useEffect, useRef } from "react";
import CanvasEngine from "../canvas/CanvasEngine";

const CanvasBoard = (props) => {
  const { onClickEvent } = props;
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      engineRef.current = new CanvasEngine(canvas);
      window.canvasEngine = engineRef.current;
      engineRef.current.setCanvasClickHandler((x, y, e) => {
        // console.log("Clicked at world coordinates:", x, y, e);
        onClickEvent(x, y, e);
      });
    }
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "black",
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          backgroundColor: "#111",
          width: "100%",
          height: "100%",
          display: "block",
          cursor: "grab",
        }}
      />
    </div>
  );
};

export default CanvasBoard;
