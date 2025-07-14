import React, { useState } from "react";
import TabHeader from "./TabHeader";
import TabPanel from "./TabPanel";

const ReportBugandImprovement = ({ tabs }) => {
  const Tabs = [
    {
      key: "bug",
      lable: "Bug",
      color: "red",
    },
    {
      key: "improvement",
      lable: "Improvement",
      color: "yellow",
    },
    {
      key: "query",
      lable: "Query",
      color: "blue",
    },
  ];
  const [currentTab, setCurrentTab] = tabs;

  return (
    <div className="md:max-w-[30rem] md:h-1/2 h-1/4 max-w-[20rem] bg-neutral-900 absolute w-full p-4 m-10 rounded-md shadow-sm cursor-pointer">
      <TabHeader
        tabs={Tabs}
        activeTab={currentTab}
        setactiveTab={setCurrentTab}
      />
      <TabPanel
        tab={currentTab}
        color={Tabs.find((t) => t.key === currentTab).color}
      />
    </div>
  );
};

export default ReportBugandImprovement;
