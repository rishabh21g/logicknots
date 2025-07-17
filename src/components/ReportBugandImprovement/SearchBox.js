import React, { useState } from "react";
import { useCommentData } from "../../context/CommentDataContext";

const SearchBox = () => {
  const [searchID, setSearchID] = useState("");
  const { commentDetails, activeTab, setSelectedQuery } = useCommentData();

  const searchQuery = () => {
    const found = commentDetails[activeTab]?.find(
      (entry) => entry.number === Number(searchID)
    );
    if (found) {
      setSelectedQuery(found);
      setSearchID("");
    } else {
      setSearchID("");
      alert("No query found with this number");
      
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-2">
      <input
        type="number"
        value={searchID}
        onChange={(e) => setSearchID(e.target.value)}
        placeholder="Search your query no."
        className="w-64 px-3 py-1 text-sm text-gray-300 bg-black border border-gray-300 rounded-sm focus:outline-none"
        onKeyDown={(e) => e.key === "Enter" && searchQuery()}
      />
    </div>
  );
};

export default SearchBox;
