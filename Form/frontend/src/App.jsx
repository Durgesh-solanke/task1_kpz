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
  const [showChart, setShowChart] = useState(true);

  const [selectedYAxes, setSelectedYAxes] = useState({
    TWX: true,
    TWY: false,
    TWZ: false,
  });

  const handleYAxisChange = (axis) => {
    setSelectedYAxes((prev) => ({
      ...prev,
      [axis]: !prev[axis],
    }));
  };

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

      console.log("Parsed Excel Data:", jsonData);
      setExcelData(jsonData);

      try {
        console.log("Sending data to backend:", jsonData);
        await axios.post("http://localhost:5000/api/userKPZ", {
          data: jsonData,
        });
        alert("✅ Data successfully uploaded to MongoDB.");
      } catch (error) {
        alert("❌ Failed to upload data. See console for details.");
        console.error(error.message);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
  });

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

  // Build datasets dynamically
  const datasets = Object.keys(selectedYAxes)
    .filter((axis) => selectedYAxes[axis])
    .map((axis) => {
      const values = excelData
        .map((row) => Number(row[axis]))
        .filter((v) => !isNaN(v));

      return {
        label: axis,
        data: values,
        borderColor: colorMap[axis]?.borderColor || "gray",
        backgroundColor:
          colorMap[axis]?.backgroundColor || "rgba(128, 128, 128, 0.2)",
        tension: 0, // ➜ STRAIGHT lines
        pointRadius: 0, // ➜ HIDE data points
        // pointHoverRadius: 0, // ➜ No effect on hover
      };
    });

  const allYValues = datasets.flatMap((ds) => ds.data);
  const yMin = Math.min(...allYValues);
  const yMax = Math.max(...allYValues);
  const yPadding = 5;

  const chartData = {
    labels: excelData.map((row) => Number(row.Speed) ?? "Unknown"),
    datasets: datasets,
  };

  const chartOptions = {
    responsive: true,
    animation: false, // 🔧 Disable animation
    scales: {
      y: {
        min: yMin - yPadding,
        max: yMax + yPadding,
        title: {
          display: true,
          text: "Y-Axis Values",
        },
        ticks: {
          stepSize: Math.ceil((yMax - yMin + 2 * yPadding) / 5),
        },
      },
      x: {
        title: {
          display: true,
          text: "Speed (X-Axis)",
        },
        type: "linear",
        min: 30,
        max: 60,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Line Chart for Selected Axes",
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

      {/* Show/Hide Chart Toggle */}
      <div style={{ marginTop: "20px", color: "white" }}>
        <label>
          <input
            type="checkbox"
            checked={showChart}
            onChange={() => setShowChart((prev) => !prev)}
          />
          &nbsp; Show Plot
        </label>
      </div>

      {/* Chart Section */}
      {excelData.length > 0 && showChart ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {/* Y-Axis Checkbox Section */}
          <div style={{ color: "white", minWidth: "180px" }}>
            <p>Select Y-Axes:</p>
            {["TWX", "TWY", "TWZ"].map((axis) => (
              <label
                key={axis}
                style={{ display: "block", marginBottom: "8px" }}
              >
                <input
                  type="checkbox"
                  checked={selectedYAxes[axis]}
                  onChange={() => handleYAxisChange(axis)}
                />
                &nbsp; {axis}
              </label>
            ))}
          </div>

          {/* Chart Display */}
          <div style={{ flex: 1 }}>
            {datasets.length === 0 ? (
              <p style={{ color: "white" }}>
                Please select at least one Y-axis to plot.
              </p>
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </div>
        </div>
      ) : excelData.length === 0 ? (
        <p style={{ marginTop: "20px" }}>No data to display yet.</p>
      ) : null}
    </div>
  );
}
