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
  const [rectangleMode, setrectangleMode] = useState(false);
  //
  const [selectedQuery, setSelectedQuery] = useState(null);

  //
  const [commentDetails, setCommentDetails] = useState({
    design_name: "",
    bug: [],
    improvement: [],
    query: [],
  });
  const username = "Logicknots";

  //function to draw a dot

  const drawDotEventHandler = (x, y) => {
    if (!isDotMode) return;
    window.canvasEngine.drawDot(x, y);
    const now = new Date();
    const date = now.toLocaleDateString("en-GB");
    const time = now.toLocaleTimeString("en-GB");
    const newId = v4();
    const currentTabData = commentDetails[activeTab] || [];
    const newBug = {
      id: newId,
      number: currentTabData.length + 1,
      username,
      date,
      time,
      is_resolved: false,
      points: { x, y: y * -1 },
      rectangle: [],
      description: [],
    };
    console.log(newBug);

    setCommentDetails((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newBug],
    }));
  };

  //function to save drawed rectangle
  const addRectangleToComment = (rectBBox) => {
    if (!rectangleMode) return;
    if (selectedQuery == null) {
      return alert("First add the bug ");
    }
    setCommentDetails((prev) => {
      const updatedTab = prev[activeTab].map((comment) => {
        if (comment.id === selectedQuery.id) {
          return {
            ...comment,
            rectangle: [
              ...comment.rectangle,
              {
                id: v4(),
                bbox: rectBBox,
              },
            ],
          };
        }
        return comment;
      });

      return {
        ...prev,
        [activeTab]: updatedTab,
      };
    });
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
        selectedQuery,
        setSelectedQuery,
        addRectangleToComment,
      }}
    >
      {children}
    </CommentDataContext.Provider>
  );
};
