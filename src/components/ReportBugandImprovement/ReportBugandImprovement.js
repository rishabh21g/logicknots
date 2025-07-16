import TabHeader from "./TabHeader";
import SearchBox from "./SearchBox";
import Functionality from "./Functionality";
import QueryCountBox from "./QueryCountBox";
import CommentDetails from "./CommentDetails";

const ReportBugandImprovement = () => {
  return (
    <div
      className="md:max-w-[30rem] md:h-[40rem] h-1/4 max-w-[20rem] bg-black absolute w-full
     p-4 m-10 rounded-md shadow-sm cursor-pointer top-3 left-6"
    >
      <TabHeader />
      <Functionality />
      <SearchBox />
      <QueryCountBox />
      <CommentDetails />
    </div>
  );
};

export default ReportBugandImprovement;
