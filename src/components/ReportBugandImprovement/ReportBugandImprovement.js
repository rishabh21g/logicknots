import TabHeader from "./TabHeader";
import SearchBox from "./SearchBox";
import Functionality from "./Functionality";
import CommentDetails from "./CommentDetails";
import QueryCountDetailComponent from "./QueryCountDetailComponent";

const ReportBugandImprovement = () => {
  return (
    <div
      className="md:max-w-[30rem]  bg-neutral-950 absolute w-full
    rounded-md shadow-sm cursor-pointer left-10 py-6 h-full"
    >
      <TabHeader />
      <Functionality />
      <SearchBox />
      <QueryCountDetailComponent />
      <CommentDetails />
    </div>
  );
};

export default ReportBugandImprovement;
