import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";
import "./App.css";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default function ExcelDropzone() {
  const [excelData, setExcelData] = useState([]);
  const [selectedYAxis, setSelectedYAxis] = useState("TWX"); // Y-axis column selection

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) {
      alert("Please upload an Excel file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const [headerRow, ...dataRows] = raw;
      const cleanedHeaders = headerRow.map((h, i) =>
        h ? h.toString().trim() : `Column${i}`
      );

      const jsonData = dataRows.map((row) =>
        Object.fromEntries(row.map((cell, i) => [cleanedHeaders[i], cell]))
      );
      // checking the parsed data
      console.log("Parsed Excel Data:", jsonData);
      setExcelData(jsonData);

      //  send to backend
      try {
        console.log("Sending data to backend:", jsonData);
        await axios.post("http://localhost:5000/api/userKPZ", {
          data: jsonData,
        });
        alert("✅ Data successfully uploaded to MongoDB.");
      } catch (error) {
        alert(
          "❌ Failed to upload data. See console for details.",
          error.message
        );
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // permission of the only xls and xlsx files....
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
  });

  // Safely extract Y-axis values from selected column
  const yValues = excelData
    .map((row) => Number(row[selectedYAxis]))
    .filter((val) => !isNaN(val));

  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const yPadding = 5; // Fixed padding
  // Chart.js data
  const colorMap = {
    TWX: {
      borderColor: "blue",
      backgroundColor: "rgba(0, 0, 255, 0.2)",
    },
    TWY: {
      borderColor: "green",
      backgroundColor: "rgba(234, 223, 187, 0.2)",
    },
    TWZ: {
      borderColor: "purple",
      backgroundColor: "rgba(128, 0, 128, 0.2)",
    },
  };
  const chartData = {
    labels: excelData.map((row) => row.Speed ?? "Unknown"), // X-axis from 'Speed' column
    datasets: [
      {
        label: selectedYAxis,
        data: yValues,
        borderColor: colorMap[selectedYAxis]?.borderColor || "gray",
        backgroundColor:
          colorMap[selectedYAxis]?.backgroundColor ||
          "rgba(128, 128, 128, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        min: yMin - yPadding,
        max: yMax + yPadding,
        title: {
          display: true,
          text: selectedYAxis,
        },
        ticks: {
          stepSize: Math.ceil((yMax - yMin + 2 * yPadding) / 5),
        },
      },
      x: {
        title: {
          display: true,
          text: "Time (s)",
        },
        type: "linear", // 👈 Important: Treat X as numeric
        min: 30,
        max: 60,
        ticks: {
          stepSize: 1, // 👈 Show every 1 second
          // callback: (value) => `${value}`, // Optional: Format with "s"
        },
      },
    },
    grid: {
      color: "#ffffff", // ✅ white grid lines
    },

    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Line Chart for ${selectedYAxis}`,
      },
    },
  };

  return (
    <div className="App">
      <h2>Upload Excel File to Plot Data</h2>

      <div
        {...getRootProps({
          className: `dropzone ${isDragActive ? "drag-active" : ""}`,
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the Excel file here...</p>
        ) : (
          <p>Drag 'n' drop an Excel file here, or click to select</p>
        )}
      </div>

      {/* Dropdown for Y-axis selection */}
      {excelData.length > 0 && (
        <div style={{ marginTop: "20px", color: "White" }}>
          <label htmlFor="yAxisSelect">Select Y-Axis: </label>
          <select
            id="yAxisSelect"
            value={selectedYAxis}
            onChange={(e) => setSelectedYAxis(e.target.value)}
          >
            <option value="TWX">TWX</option>
            <option value="TWY">TWY</option>
            <option value="TWZ">TWZ</option>
          </select>
        </div>
      )}

      {/* Chart rendering */}
      {excelData.length > 0 ? (
        <div style={{ width: "80%", margin: "20px auto", color: "White" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <p style={{ marginTop: "20px" }}>No data to display yet.</p>
      )}
    </div>
  );
}
