import { Add, Delete, Edit, Rectangle } from "@mui/icons-material";
import { useCommentData } from "../../context/CommentDataContext";

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
          setisDotMode(!isDotMode)
          window.canvasEngine.clearCanvas()
          setrectangleMode(false)
        }}
        className="hover:brightness-150"
      >
        <Add
          className={` size-8 ${isDotMode ? "text-blue-500" : "text-gray-300"}`}
        />
      </button>
      <button
        className="hover:brightness-150"
        onClick={() => setEditable(!editable)}
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
        onClick={() => setrectangleMode(!rectangleMode)}
      >
        <Rectangle
          className={` size-8 ${
            rectangleMode ? "text-blue-500" : "text-gray-300"
          }`}
        />
      </button>
      <button className="hover:brightness-150 justify-center flex">
        <input
          type="checkbox"
          checked={selectedQuery?.is_resolved || false}
          className="w-[1.3rem] h-[1.3rem] accent-blue-600"
          onChange={markAsResolved}
        />
      </button>
    </div>
  );
};

export default Functionality;
