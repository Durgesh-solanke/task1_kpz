import React from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import "./App.css"; // optional styles

export default function ExcelDropzone() {
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) {
      alert("Please upload the excel file...")
      // console.log("Please upload the excel file...")
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // First sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      console.log(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"]
    }
  });

  return (
    <div
      {...getRootProps({
        className: `dropzone ${isDragActive ? "drag-active" : ""}`
      })}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the Excel file here...</p>
      ) : (
        <p>Drag 'n' drop an Excel file here, or click to select</p>
      )}
    </div>
  );
}
