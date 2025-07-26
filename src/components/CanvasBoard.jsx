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
    setSelectedQuery,
    seeAllDots,
    activeTab,
    addRectangleToComment,
    commentDetails,
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
  // Draw a canavs first
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !engineRef.current) {
      engineRef.current = new CanvasEngine(canvas);
      window.canvasEngine = engineRef.current;
    }
  }, []);

  // setting up the comment details in window object
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
  }, [
    commentDetails,
    activeTab,
    selectedQuery,
    seeAllDots,
    color,
    isDotMode,
    rectangleMode,
  ]);

  // for dot
  useEffect(() => {
    if (!engineRef.current) return;

    if (!isDotMode) {
      return engineRef.current.setCanvasClickHandler(null);
    }

    engineRef.current.setCanvasClickHandler((x, y, e) => {
      drawDotEventHandler(x, y);
      engineRef.current.drawDot(x, y, 4, color);
      setisDotMode(false);
    });
  }, [isDotMode]);

  //draw rectangle
  useEffect(() => {
    if (!engineRef.current) {
      return;
    }
    if (!rectangleMode) {
      return engineRef.current.setCanvasRectangleClickHandler(null);
    }
    if (selectedQuery == null) {
      return;
    }
    engineRef.current.setCanvasRectangleClickHandler((bbox) => {
      engineRef.current.drawRectangle(
        bbox.xll,
        bbox.yll,
        bbox.xur,
        bbox.yur,
        color
      );

      addRectangleToComment(bbox);
      // setRectangleDrawHandler
    });
  }, [rectangleMode]);

  //only show the selected query dots and rectangles
  useEffect(() => { 
    if (!engineRef.current) return;

    engineRef.current.clearCanvas();

    // Draw the main dot (if exists)
    if (selectedQuery?.points) {
      const { x, y } = selectedQuery.points;
      engineRef.current.drawDot(x, -y, 4, color);
    }

    // Draw all rectangles (if any)
    if (selectedQuery?.rectangle?.length) {
      selectedQuery.rectangle.forEach(({ bbox }) => {
        const { xll, yll, xur, yur } = bbox;
        engineRef.current.drawRectangle(xll, yll, xur, yur, color);
      });
    }
  }, [selectedQuery ]);

  // to see all dots on toggle
  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    if (seeAllDots) {
      setSelectedQuery(null);
      engine.clearCanvas();

      const queries = commentDetails[activeTab] || [];

      queries.forEach((query) => {
        // draw dot
        if (query.points) {
          const { x, y } = query.points;
          engine.drawDot(x, -y, 4, color);
        }
      });
    } else {
      engine.clearCanvas();
    }
  }, [seeAllDots, activeTab]);



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
