import { Add, Delete, Edit, Rectangle } from "@mui/icons-material";
import { useCommentData } from "../../context/CommentDataContext";
import Download from "./Download";
import Upload from "./Upload";

const Functionality = () => {
  const {
    setisDotMode,
    isDotMode,
    rectangleMode,
    setrectangleMode,
    editable,
    setEditable,
    commentDetails,
    setCommentDetails,
    activeTab,
    selectedQuery,
    setSelectedQuery,
  } = useCommentData();

  // function to delete the selectedQuery
  const handleDelete = () => {
    if (!selectedQuery) {
      alert("No query selected to delete");
      return;
    }

    const filtered = commentDetails[activeTab].filter(
      (entry) => entry.id !== selectedQuery.id
    );
    const reNumbered = filtered.map((item, idx) => ({
      ...item,
      number: idx + 1,
    }));

    setCommentDetails((prev) => ({
      ...prev,
      [activeTab]: reNumbered,
    }));

    setSelectedQuery(null);
  };

  //Function to toggle the resolved or not selected query

  const markAsResolved = () => {
    if (!selectedQuery) return;

    setCommentDetails((prev) => {
      const updatedTab = prev[activeTab].map((item) =>
        item.id === selectedQuery.id
          ? { ...item, is_resolved: !item.is_resolved }
          : item
      );
      return {
        ...prev,
        [activeTab]: updatedTab,
      };
    });

    setSelectedQuery((prev) => ({
      ...prev,
      is_resolved: !prev?.is_resolved,
    }));
  };

  return (
    <div className="flex gap-6 items-center justify-center w-full my-2 ">
      <button
        onClick={() => {
          setisDotMode((prev)=>!prev);
          setrectangleMode(false);
          setEditable(false)
        }}
        className="hover:brightness-150"
      >
        <Add
          className={` size-8 ${isDotMode ? "text-blue-500" : "text-gray-300"}`}
        />
      </button>
      <button
        className="hover:brightness-150"
        onClick={() => {
          setEditable((prev) => !prev);
          setrectangleMode(false);
          setisDotMode(false);
        }}
      >
        <Edit
          className={` size-8 ${editable ? "text-blue-500" : "text-gray-300"}`}
        />
      </button>
      <button onClick={handleDelete}>
        <Delete className="text-gray-300 size-8" />
      </button>
      <button
        className="hover:brightness-150"
        onClick={() => setrectangleMode((prev) => !prev)}
      >
        <Rectangle
          className={` size-8 ${
            rectangleMode ? "text-blue-500" : "text-gray-300"
          }`}
        />
      </button>
      <button className="hover:brightness-150 justify-center flex">
        <label className="relative w-6 h-6">
          <input
            type="checkbox"
            checked={selectedQuery?.is_resolved || false}
            onChange={markAsResolved}
            className="peer appearance-none w-full h-full rounded-full border-2 border-blue-500 cursor-pointer checked:bg-blue-500"
          />
          <svg
            className="pointer-events-none absolute left-1 top-1 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </label>
      </button>
      <Download/>
      <Upload/>
    </div>
  );
};

export default Functionality;
