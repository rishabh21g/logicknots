import React, { useEffect, useRef } from "react";
import CanvasEngine from "../canvas/CanvasEngine";
import { useCommentData } from "../context/CommentDataContext";

const CanvasBoard = () => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const { isDotMode, setisDotMode, drawDotEventHandler, selectedQuery } =
    useCommentData();

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
      setisDotMode(false);
    });
  }, [isDotMode]);

  useEffect(() => {
    if (!engineRef.current) return;

    engineRef.current.clearCanvas();
    if (selectedQuery?.points) {
      let { x, y } = selectedQuery.points;
      engineRef.current.drawDot(x, (y = y * -1));
    }
  }, [selectedQuery]);

  return (
    <div className=" w-full h-screen bg-black relative">
      <canvas
        ref={canvasRef}
        className={`bg-[#111] w-full h-full block  ${
          isDotMode ? "cursor-crosshair" : "cursor-grab"
        } `}
      />
    </div>
  );
};

export default CanvasBoard;
