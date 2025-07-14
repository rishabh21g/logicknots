import React from "react";
import ItemList from "./ItemList";

const TabPanel = ({ tab, color }) => {
  const items = {
    bug: [
      { id: 1, title: "Login not working", assignedTo: "UserA", comments: [] },
      { id: 2, title: "UI glitch", assignedTo: "UserB", comments: [] },
    ],
    improvement: [
      { id: 3, title: "Add dark mode", assignedTo: "UserC", comments: [] },
    ],
    query: [
      {
        id: 4,
        title: "How to reset password?",
        assignedTo: "UserD",
        comments: [],
      },
    ],
  };
  return (
    <div>
      <ItemList items={items[tab]} activeTab={tab}/>
    </div>
  );
};

export default TabPanel;
