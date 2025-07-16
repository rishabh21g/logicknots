import React, { useState } from "react";
import { useCommentData } from "../../context/CommentDataContext";
import { v4 } from "uuid";

const CommentDetails = () => {
  const [commentInput, setCommentInput] = useState("");
  const {
    commentDetails,
    setCommentDetails,
    pendingDotCoords,
    setPendingDotCoords,
    activeTab,
    username,
  } = useCommentData();
  const handleAddComment = () => {
    if (!commentInput || !pendingDotCoords) return;

    const { x, y } = pendingDotCoords;
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
          comment: commentInput,
          reply: [],
        },
      ],
    };

    setCommentDetails((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newBug],
    }));

    window.canvasEngine.drawDot(x, y, 5, "yellow");

    setCommentInput("");
    setPendingDotCoords(null);
  };
  return (
    <div className="w-full max-w-[26rem] mx-auto mt-6 p-5 border border-gray-300 rounded-md flex flex-col gap-4 h-[20rem] bg-neutral-950">
      {/* Meta Info */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
        <span>
          <strong>User:</strong> Username
        </span>
        <span>
          <strong>Coordinates:</strong> 125x, 258y
        </span>
        <span>
          <strong>Date:</strong> 12/07/2025
        </span>
        <span>
          <strong>Time:</strong> 03:15 AM
        </span>
      </div>

      {/* Input + Button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="Add a comment..."
          aria-label="Comment Input"
          className="flex-1 px-3 py-1 text-sm text-gray-100 bg-black border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-700"
        />
        <button
          className="px-3 py-1 text-xs text-white bg-blue-700 rounded hover:bg-blue-800 transition"
          onClick={handleAddComment}
        >
          Add
        </button>
      </div>

      {/* Comments Section */}
      <div className="flex-1 w-full overflow-y-auto border border-blue-300 rounded p-2 text-sm text-gray-200">
        <p>No comments yet.</p>
      </div>
    </div>
  );
};

export default CommentDetails;
