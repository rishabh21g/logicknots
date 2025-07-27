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
    seeAllDots,
    activeTab,
    addRectangleToComment,
    commentDetails,
  } = useCommentData();

  // Tab color
  let color = "";
  if (activeTab === "bug") color = "red";
  else if (activeTab === "improvement") color = "blue";
  else if (activeTab === "query") color = "green";

  // Initialize engine once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !engineRef.current) {
      engineRef.current = new CanvasEngine(canvas);
      window.canvasEngine = engineRef.current;
    }
  }, []);

  // Update scene data and redraw
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setData({
      commentDetails,
      activeTab,
      selectedQuery,
      seeAllDots,
      color,
      isDotMode,
      rectangleMode,
    });
    engineRef.current.draw();
  }, [
    commentDetails,
    activeTab,
    selectedQuery,
    seeAllDots,
    color,
    isDotMode,
    rectangleMode,
  ]);

  // Dot mode click
  useEffect(() => {
    if (!engineRef.current) return;

    if (!isDotMode) {
      return engineRef.current.setCanvasClickHandler(null);
    }

    engineRef.current.setCanvasClickHandler((x, y, e) => {
      drawDotEventHandler(x, y);
      setisDotMode(false);
    });
  }, [isDotMode]);

  // Rectangle mode drag
  useEffect(() => {
    if (!engineRef.current) return;
    if (!rectangleMode) {
      return engineRef.current.setCanvasRectangleClickHandler(null);
    }
    if (selectedQuery == null) return;

    engineRef.current.setCanvasRectangleClickHandler((bbox) => {
      addRectangleToComment(bbox);
    });
  }, [rectangleMode]);

  return (
    <div className="w-full h-screen bg-black relative">
      <canvas
        ref={canvasRef}
        className={`bg-[#111] w-full h-full block ${
          isDotMode || rectangleMode ? "cursor-crosshair" : "cursor-grab"
        }`}
      />
    </div>
  );
};

export default CanvasBoard;
