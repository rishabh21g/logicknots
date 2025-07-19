import React from "react";
import { useCommentData } from "../../context/CommentDataContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const TabHeader = () => {
  const {
    tabs,
    activeTab,
    setActiveTab,
    commentDetails,
    seeAllDots,
    setseeAllDots,
  } = useCommentData();

  return (
    <div className="flex mb-1 flex-col max-w-[22rem] mx-auto">
      <h1 className="text-blue-600 font-bold text-center text-2xl">
        {commentDetails?.design_name}
      </h1>

      <div className="flex justify-evenly w-full gap-x-2 mt-1 relative">
        {tabs.map((tab) => (
          <div
            key={tab}
            className="relative flex flex-col items-center gap-0.5"
          >
            {/* Tab Name */}
            <button
              className={`shadow-md text-sm px-4 py-1 font-semibold capitalize rounded-lg ${
                activeTab === tab ? "text-blue-600" : "text-gray-400"
              }`}
              onClick={() => {
                setActiveTab(tab);
                window.canvasEngine.clearCanvas();
              }}
            >
              {tab}
            </button>

            {/* Visibility Toggle only for Active Tab */}
            {tab === activeTab && (
              <button
                className={`absolute -top-2 -right-1 ${seeAllDots?"text-blue-600":"text-gray-400"} `}
                onClick={() => setseeAllDots(!seeAllDots)}
              >
                {seeAllDots ? (
                  <Visibility fontSize="small" />
                ) : (
                  <VisibilityOff fontSize="small" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabHeader;
