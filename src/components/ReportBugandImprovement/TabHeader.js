import React from "react";

const TabHeader = ({ tabs, activeTab, setactiveTab }) => {
  console.log(tabs);
  return (
    <div className="flex gap-2 mb-1">
      {tabs.map((tab) => {
        return (
          <button
            className={`shadow-md
                       bg-neutral-800  p-3 
                      text-center w-28 text-sm px-4 
                    rounded-lg ${
                      activeTab === tab.key
                        ? "text-gray-300 "
                        : "bg-neutral-700 text-gray-300"
                    }`}
            key={tab.key}
            onClick={() => setactiveTab(tab.key)}
          >
            {tab.lable}
          </button>
        );
      })}
    </div>
  );
};

export default TabHeader;
