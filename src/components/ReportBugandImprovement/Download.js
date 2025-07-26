import { FileDownload } from "@mui/icons-material";
import { useCommentData } from "../../context/CommentDataContext";

const Download = () => {
  const { commentDetails, username } = useCommentData();

  const handleDownloadJSON = () => {
    if (
      commentDetails.bug.length === 0 &&
      commentDetails.improvement.length === 0 &&
      commentDetails.query.length === 0
    ) {
      return alert("No details are there");
    }
    const allDetails = JSON.parse(JSON.stringify(commentDetails));
    const dataStr = JSON.stringify(allDetails, null, 4);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename =
      "Report_" + username + (Math.floor(Math.random() * 10000)).toString() + ".json";
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      className="hover:brightness-150 items-center justify-center flex"
      onClick={handleDownloadJSON}
    >
      <FileDownload className="size-8 text-gray-300" />
    </button>
  );
};

export default Download;
