import React, { useEffect, useState } from "react";
import { useCommentData } from "../../context/CommentDataContext";

import { Reply } from "@mui/icons-material";

const CommentDetails = () => {
  const [commentInput, setCommentInput] = useState("");
  const {
    commentDetails,
    setCommentDetails,
    activeTab,
    username,
    selectedQuery,
    setSelectedQuery,
  } = useCommentData();
  const handleAddComment = () => {
    if (!commentInput.trim() || !selectedQuery) return;

    const now = new Date();
    const date = now.toLocaleDateString("en-GB");
    const time = now.toLocaleTimeString("en-GB");

    const newComment = {
      username,
      text: commentInput.trim(),
      date,
      time,
      reply: [],
    };

    setCommentDetails((prev) => {
      const updatedList = prev[activeTab].map((item) => {
        if (item.id === selectedQuery.id) {
          return {
            ...item,
            description: [...item.description, newComment],
          };
        }
        return item;
      });

      return {
        ...prev,
        [activeTab]: updatedList,
      };
    });

    setSelectedQuery((prev) => ({
      ...prev,
      description: [...prev.description, newComment],
    }));

    setCommentInput("");
  };

  useEffect(() => {
    console.log(commentDetails);
  });
  return (
    <div className="w-full max-w-[26rem] mx-auto mt-6 p-5  rounded-md flex flex-col gap-4 h-auto bg-neutral-800">
      {/* Comments Section */}
      {selectedQuery?.description?.length === 0 ? (
        <p className="text-gray-400">No comments yet.</p>
      ) : (
        selectedQuery?.description.map((comment, index) => (
          <div
            key={index}
            className="bg-neutral-900 p-3 rounded shadow-md flex flex-col "
          >
            <div className="text-sm text-gray-100">{comment.text}</div>

            <div className="flex justify-between items-center text-xs text-gray-400">
              <div className="flex gap-x-1">
                <span className="font-semibold text-blue-400">
                  {comment.username}
                </span>

                <span>
                  {comment.date} | {comment.time}
                </span>
              </div>

              <button
                className=" text-xs text-white bg-blue-700 rounded hover:bg-blue-800 transition shadow-lg"
                // onClick={...} -> add reply functionality here
              >
                <Reply />
              </button>
            </div>
          </div>
        ))
      )}

      {/* Input + Button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="Add a comment..."
          aria-label="Comment Input"
          className="flex-1 px-3 py-1 text-sm text-gray-100 bg-neutral-700 shadow-lg rounded focus:outline-none focus:ring-2 focus:ring-blue-700"
        />
        <button
          className="px-3 py-1 text-xs text-white bg-blue-700 rounded hover:bg-blue-800 transition shadow-lg"
          onClick={handleAddComment}
        >
          <Reply />
        </button>
      </div>
    </div>
  );
};

export default CommentDetails;
