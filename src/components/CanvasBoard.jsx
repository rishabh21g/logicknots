import React, { useEffect, useRef } from "react";
import CanvasEngine from "../canvas/CanvasEngine";
import { useCommentData } from "../context/CommentDataContext";

const CanvasBoard = () => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const {
    isDotMode,
    setisDotMode,
    drawDotEventHandler,
    selectedQuery,
    rectangleMode,
    setrectangleMode,
    activeTab,
    addRectangleToComment,
  } = useCommentData();

  // change the color on the basis of active tab
  let color = "";
  if (activeTab === "bug") {
    color = "red";
  } else if (activeTab === "improvement") {
    color = "blue";
  } else if (activeTab === "query") {
    color = "green";
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !engineRef.current) {
      engineRef.current = new CanvasEngine(canvas);
      window.canvasEngine = engineRef.current;
    }
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;

    engineRef.current.setCanvasClickHandler((x, y, e) => {
      if (!isDotMode) return;

      drawDotEventHandler(x, y);
      engineRef.current.drawDot(x, y, 4, color);
      setisDotMode(false);
    });
  }, [isDotMode, activeTab]);

  //only show the selected query dots and rectangles
  useEffect(() => {
    if (!engineRef.current) return;

    engineRef.current.clearCanvas();

    // Draw the main dot (if exists)
    if (selectedQuery?.points) {
      const { x, y } = selectedQuery.points;
      engineRef.current.drawDot(x, -y);
    }

    // Draw all rectangles (if any)
    if (selectedQuery?.rectangle?.length) {
      selectedQuery.rectangle.forEach(({ bbox }) => {
        const { xll, yll, xur, yur } = bbox;
        engineRef.current.drawRectangle(xll, yll, xur, yur, color);
      });
    }
  }, [selectedQuery]);

  //draw rectangle
  useEffect(() => {
    if (!engineRef.current) return;

    if (selectedQuery == null) return;

    engineRef.current.setRectangleDrawHandler((bbox) => {
      if (!rectangleMode) return;
      addRectangleToComment(bbox);
    });
  }, [rectangleMode]);

  return (
    <div className=" w-full h-screen bg-black relative">
      <canvas
        ref={canvasRef}
        className={`bg-[#111] w-full h-full block  ${
          isDotMode || rectangleMode ? "cursor-crosshair" : "cursor-grab"
        } `}
      />
    </div>
  );
};

export default CanvasBoard;
