import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 } from "uuid";

const CommentDataContext = createContext();

export const useCommentData = () => useContext(CommentDataContext);

export const CommentDataProvider = ({ children }) => {
  // tabs
  const tabs = ["bug", "improvement", "query"];
  // active tabs
  const [activeTab, setActiveTab] = useState(tabs[0]);
  //edit mode on off
  const [editable, setEditable] = useState(false);
  // draw dot mode
  const [isDotMode, setisDotMode] = useState(false);
  // rectangle mode
  const [rectangleMode, setrectangleMode] = useState(false);
  //selected bug / improvement / query
  const [selectedQuery, setSelectedQuery] = useState(null);
  //see  all bugs / impr / query
  const [seeAllDots, setseeAllDots] = useState(false);
  // Global data structure to hold all meta data
  const [commentDetails, setCommentDetails] = useState({
    design_name: null || "Logicknots",
    bug: [],
    improvement: [],
    query: [],
  });
  const username = "Logicknots";

  //function to draw a dot
  const drawDotEventHandler = (x, y) => {
    if (!isDotMode) return;
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

    setCommentDetails((prev) => {
      const updatedTab = [...prev[activeTab], newBug];
      setSelectedQuery(updatedTab.at(-1));
      return {
        ...prev,
        [activeTab]: updatedTab,
      };
    });
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
          const updatedComment = {
            ...comment,
            rectangle: [
              ...comment.rectangle,
              {
                id: v4(),
                bbox: rectBBox,
              },
            ],
          };

          //Update selectedQuery to new modified version
          setSelectedQuery(updatedComment);

          return updatedComment;
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
        seeAllDots,
        setseeAllDots,
      }}
    >
      {children}
    </CommentDataContext.Provider>
  );
};
