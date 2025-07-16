import React from "react";

const QueryCountBox = () => {
  const queriesId = [];
  return (
    <div className="w-full border border-gray-300 mx-auto flex gap-2 h-28 overflow-y-scroll max-w-[26rem] my-2">
      {queriesId.map((qry) => (
        <button>{qry}</button>
      ))}
    </div>
  );
};

export default QueryCountBox;
