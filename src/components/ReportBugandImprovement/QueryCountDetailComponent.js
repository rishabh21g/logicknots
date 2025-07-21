import React from "react";
import { useCommentData } from "../../context/CommentDataContext";

const QueryCountDetailComponent = () => {
  const { commentDetails, activeTab, selectedQuery, setSelectedQuery } =
    useCommentData();
  const currentTabData = commentDetails?.[activeTab] || [];

  return (
    <div className="w-full mx-auto flex flex-col gap-2 bg-neutral-900 overflow-y-auto max-w-[26rem] my-2 p-2 min-h-16 rounded-md px-4">
      {/* Button List */}
      <div className="w-full flex gap-2 bg-neutral-800 p-2 flex-wrap rounded-md h-auto  my-2 min-h-16 ">
        {currentTabData.map((item) => {
          const resolvedClass = item.is_resolved ? "bg-green-500" : null;
          const selectedResolved =
            selectedQuery?.id === item?.id &&
            item.is_resolved &&
            "border-2 border-blue-900";

          return (
            <button
              key={item.id}
              onClick={() => {
                window.canvasEngine.clearCanvas();
                setSelectedQuery(item);
              }}
              className={`text-xs text-white
                 ${
                   selectedQuery?.id === item.id && "bg-blue-600"
                 } hover:brightness-75 border border-gray-600 rounded px-2 py-1 size-7 
                  ${resolvedClass} ${selectedResolved}
                
                `}
            >
              {item.number}
            </button>
          );
        })}
      </div>

      {/* Detail Section */}
      {selectedQuery ? (
        <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-2">
          <span>
            <strong>User:</strong> {selectedQuery.username}
          </span>
          <span>
            <strong>Coordinates:</strong> {selectedQuery.points.x}px,{" "}
            {selectedQuery.points.y}px
          </span>
          <span>
            <strong>Date:</strong> {selectedQuery.date}
          </span>
          <span>
            <strong>Time:</strong> {selectedQuery.time}
          </span>
        </div>
      ) : (
        <div className="text-xs text-gray-500 italic ">
          Select a comment to view details
        </div>
      )}
    </div>
  );
};

export default QueryCountDetailComponent;
