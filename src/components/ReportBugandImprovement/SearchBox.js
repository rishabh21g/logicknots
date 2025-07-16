import React, { useState } from "react";

const SearchBox = () => {
   const [searchID, setSearchID] = useState();
  return (
    <div className="w-full flex items-center justify-center py-2">
      <input
        type="number"
        value={searchID}
        onChange={(e) => setSearchID(e.target.value)}
        placeholder="Search your query no."
        className="w-64 px-3 py-1 text-sm text-gray-300 bg-black border border-gray-300 rounded-sm focus:outline-none"
      />
    </div>
  );
};

export default SearchBox;
