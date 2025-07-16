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
  } = useCommentData();
  

  return (
    <div className="flex gap-6 items-center justify-center w-full my-2">
      <button
        onClick={() => setisDotMode(!isDotMode)}
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
      <button>
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
          className="w-[1.3rem] h-[1.3rem] accent-blue-600"
        />
      </button>
    </div>
  );
};

export default Functionality;
