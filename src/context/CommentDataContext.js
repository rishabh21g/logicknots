import React, { createContext, useContext, useState } from "react";
import { v4 } from "uuid";

const CommentDataContext = createContext();

export const useCommentData = () => useContext(CommentDataContext);

export const CommentDataProvider = ({ children }) => {
  //
  const tabs = ["bug", "improvement", "query"];
  //
  const [activeTab, setActiveTab] = useState(tabs[0]);
  //
  const [editable, setEditable] = useState(false);
  //
  const [isDotMode, setisDotMode] = useState(false);
  //
  const [pendingDotCoords, setPendingDotCoords] = useState([]);

  const [rectangleMode, setrectangleMode] = useState(false);

  //
  const [commentDetails, setCommentDetails] = useState({
    design_name: "",
    bug: [{}],
    improvement: [{}],
    query: [{}],
  });
  const username = "Logicknots";

  //
  const drawDotEventHandler = (x, y, e) => {
    window.canvasEngine.drawDot(x, y);
    const newId = v4();
    const now = new Date();
    const date = now.toLocaleDateString("en-GB");
    const time = now.toLocaleTimeString("en-GB");

    const currentTabData = commentDetails[activeTab] || [];

    const newBug = {
      id: newId,
      number: currentTabData.length + 1,
      username: username || "Anonymous",
      date,
      time,
      is_resolved: false,
      points: { x, y },
      rectangle: [],
      description: [
        {
          username: username || "Anonymous",
          comment: "",
          reply: [],
        },
      ],
    };

    setCommentDetails((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newBug],
    }));
  };

  return (
    <CommentDataContext.Provider
      value={{
        commentDetails,
        setCommentDetails,
        isDotMode,
        setisDotMode,
        tabs,
        activeTab,
        setActiveTab,
        setrectangleMode,
        rectangleMode,
        username,
        editable,
        setEditable,
        drawDotEventHandler,
        pendingDotCoords,
        setPendingDotCoords,
      }}
    >
      {children}
    </CommentDataContext.Provider>
  );
};
