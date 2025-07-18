import React from "react";
import { useCommentData } from "../../context/CommentDataContext";

const TabHeader = () => {
  const { tabs, activeTab, setActiveTab, commentDetails } = useCommentData();
  return (
    <div className="flex mb-1 flex-col max-w-[22rem] mx-auto">
      <h1 className="text-blue-600 font-bold text-center text-2xl ">
        {commentDetails?.design_name}
      </h1>
      <div className="flex  w-full justify-between mt-1">
        {tabs.map((tab) => {
          return (
            <button
              className={`shadow-md
                         
                      text-center w-28 text-sm px-4 font-semibold capitalize
                    rounded-lg ${
                      activeTab === tab ? "text-blue-600 " : " text-gray-300"
                    }`}
              key={tab}
              onClick={() => {
                setActiveTab(tab);
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabHeader;
