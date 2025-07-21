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

  // for dot
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
      engineRef.current.drawDot(x, -y, 4, color);
    }

    // Draw all rectangles (if any)
    if (selectedQuery?.rectangle?.length) {
      selectedQuery.rectangle.forEach(({ bbox }) => {
        const { xll, yll, xur, yur } = bbox;
        console.log("Code is running");
        engineRef.current.drawRectangle(xll, yll, xur, yur, color);
      });
    }
  }, [selectedQuery]);

  //draw rectangle
  useEffect(() => {
    console.log(rectangleMode, "Rectangle mode toggle");
    if (!engineRef.current) {
      return;
    }
    if (!rectangleMode) {
      engineRef.current.setRectangleDrawHandler((bbox) => {
        addRectangleToComment(bbox);

        console.log("second");
      });
    }
    if (selectedQuery == null) {
      return;
    }
    console.log("first");
    engineRef.current.setRectangleDrawHandler((bbox) => {
      addRectangleToComment(bbox);

      console.log("second");
    });
  }, [rectangleMode]);

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

  //handle zoom redraw dots
  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;

    const dots = [];

    if (seeAllDots) {
      const queries = commentDetails[activeTab] || [];
      for (let query of queries) {
        if (query.points) {
          dots.push({
            x: query.points.x,
            y: -query.points.y,
            radius: 4,
            color,
          });

          engine.setExternalDots(dots);
        }
      }
    } else if (selectedQuery?.points) {
      dots.push({
        x: selectedQuery.points.x,
        y: -selectedQuery.points.y,
        radius: 4,
        color,
      });

      engine.setExternalDots(dots);
    }
  }, [seeAllDots, selectedQuery, activeTab]);

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
