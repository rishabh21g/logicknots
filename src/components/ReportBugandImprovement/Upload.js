import { FileUpload } from "@mui/icons-material";
import React, { useRef } from "react";
import { useCommentData } from "../../context/CommentDataContext";

const Upload = () => {
  const fileInputRef = useRef(null);
  const { setCommentDetails } = useCommentData();

  // trigger the function on input tag
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // upload json data function
  const handleUploadJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        if (
          importedData.design_name &&
          importedData.bug &&
          importedData.query &&
          importedData.improvement
        ) {
          setCommentDetails(null);
          setTimeout(() => {
            setCommentDetails(importedData);
          }, 0);
        } else {
          alert("Invalid file format");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Invalid JSON file");
      }
    };

    reader.readAsText(file);
  };

  return (
    <button
      className="text-gray-300  items-center flex justify-center"
      onClick={triggerFileInput}
    >
      <FileUpload className="size-8 text-gray-300" />
      <input
        type="file"
        accept=".json"
       onClick={handleUploadJSON}
        className="hidden"
        ref={fileInputRef}
      />
    </button>
  );
};

export default Upload;
