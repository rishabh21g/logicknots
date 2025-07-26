import React, { useState } from "react";
import { useCommentData } from "../../context/CommentDataContext";
import { DateRange, Edit, Person, Reply, Timer } from "@mui/icons-material";

const CommentDetails = () => {
  const [commentInput, setCommentInput] = useState("");
  const [editText, setEditText] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const {
    setCommentDetails,
    activeTab,
    username,
    selectedQuery,
    setSelectedQuery,
    editable,
    setEditable,
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

  const handleSaveEditedComment = (index) => {
    const updatedDescription = selectedQuery.description.map((comment, i) => {
      if (i === index) {
        return { ...comment, text: editText };
      }
      return comment;
    });

    // Update both selectedQuery and global state
    setSelectedQuery((prev) => ({
      ...prev,
      description: updatedDescription,
    }));

    setCommentDetails((prev) => {
      const updatedList = prev[activeTab].map((item) => {
        if (item.id === selectedQuery.id) {
          return {
            ...item,
            description: updatedDescription,
          };
        }
        return item;
      });

      return {
        ...prev,
        [activeTab]: updatedList,
      };
    });

    setEditIndex(null);
    setEditText("");
    setEditable(false)
  };

  return (
    <div className="w-full max-w-[26rem] mx-auto mt-6 p-5 rounded-md flex flex-col gap-4 h-auto bg-neutral-800">
      {/* Comments Section */}
      {selectedQuery?.description?.length === 0 ? (
        <p className="text-gray-400">No comments yet.</p>
      ) : (
        selectedQuery?.description.map((comment, index) => (
          <div
            key={index}
            className="bg-neutral-900 p-4 gap-y-1 rounded shadow-md flex flex-col"
          >
            {editIndex === index ? (
              <>
                <textarea
                  className="w-full p-2 text-sm rounded bg-neutral-700 text-white"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    onClick={() => {
                      setEditIndex(null);
                      setEditText("");
                    }}
                    className="text-xs text-gray-400 hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEditedComment(index)}
                    className="text-xs text-green-500 hover:underline"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-gray-100 flex justify-between">
                  <p className="font-semibold text-lg">{comment.text}</p>
                  {editable && comment.username === username && (
                    <button
                      onClick={() => {
                        setEditIndex(index);
                        setEditText(comment.text);
                      }}
                      className="text-xs text-blue-600 hover:underline bg-neutral-800 hover:brightness-75 p-1 rounded-sm"
                    >
                      <Edit fontSize="small" />
                    </button>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-gray-400">
                  <div className="flex gap-2">
                    <span className="font-semibold flex items-center">
                      <Person fontSize="small" className="text-blue-500" />{" "}
                      {comment.username}
                    </span>

                    <span className="flex gap-x-1 items-center">
                      <DateRange fontSize="small" className="text-blue-500" />
                      {comment.date}{" "}
                      <Timer fontSize="small" className="text-blue-500" />
                      {comment.time}
                    </span>
                  </div>
                </div>
              </>
            )}
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
