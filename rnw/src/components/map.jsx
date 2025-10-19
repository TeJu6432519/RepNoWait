import React, { useState, useEffect } from "react";
import axios from "axios";
import "./map.css";

const gymZones = [
  { name: "Treadmills", x: 50, y: 50, width: 120, height: 80 },
  { name: "Ellipticals", x: 200, y: 50, width: 120, height: 80 },
  { name: "Stationary Bikes", x: 350, y: 50, width: 120, height: 80 },
  { name: "Chest Press", x: 50, y: 170, width: 120, height: 80 },
  { name: "Leg Press", x: 200, y: 170, width: 120, height: 80 },
  { name: "Lat Pulldown", x: 350, y: 170, width: 120, height: 80 },
  { name: "Squat Rack", x: 50, y: 290, width: 120, height: 80 },
  { name: "Dumbbell Area", x: 200, y: 290, width: 120, height: 80 },
  { name: "Bicep Curl", x: 350, y: 290, width: 120, height: 80 },
  { name: "Calisthenics Area", x: 50, y: 410, width: 420, height: 80 },
];

// Heatmap gradient yellow -> orange -> red
const getHeatColor = (count, maxCount) => {
  if (!count || maxCount === 0) return "rgba(255,255,255,0.06)";
  const ratio = Math.min(1, count / Math.max(1, maxCount));
  const lerp = (a, b, t) => Math.round(a + (b - a) * t);

  let r, g, bVal;
  if (ratio <= 0.5) {
    const t = ratio / 0.5;
    r = lerp(255, 255, t);
    g = lerp(255, 165, t);
    bVal = 0;
  } else {
    const t = (ratio - 0.5) / 0.5;
    r = lerp(255, 255, t);
    g = lerp(165, 0, t);
    bVal = 0;
  }
  return `rgba(${r},${g},${bVal},0.92)`;
};

const Map = () => {
  const [zoneData, setZoneData] = useState([]);

  // Fetch heatmap data from backend
  useEffect(() => {
    // map.jsx
      const fetchHeatmapData = async () => {
        try {
          const res = await axios.get("http://localhost:5001/api/heatmap-data");
          console.log("Heatmap API response:", res.data);
          setZoneData(res.data);
        } catch (err) {
          console.error("Failed to fetch heatmap data:", err);
        }
      };
    fetchHeatmapData();
  }, []);  

  // Merge zoneData with gymZones layout
  const zones = gymZones.map((zone) => {
    const data = Array.isArray(zoneData) 
                  ? zoneData.find(z => z.zone_name.toLowerCase() === zone.name.toLowerCase())
                  : null;
    return { ...zone, count: data ? data.count : 0 };
  });
  

  const maxCount = Math.max(...zones.map((z) => z.count), 1);

  return (
    <div className="map-page">
      <h2 className="map-title">Gym Layout Heatmap</h2>

      <svg width="550" height="520" className="gym-map" role="img" aria-label="Gym heatmap">
        {zones.map((z) => (
          <g key={z.name}>
            <rect
              x={z.x}
              y={z.y}
              width={z.width}
              height={z.height}
              fill={getHeatColor(z.count, maxCount)}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="2"
              rx="12"
            />
            <text
              x={z.x + z.width / 2}
              y={z.y + z.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize="13"
              fontWeight="600"
            >
              {z.name}
            </text>
            {z.count > 0 && (
              <text
                x={z.x + z.width - 14}
                y={z.y + 18}
                fill="#fff"
                fontWeight="700"
                fontSize="14"
              >
                {z.count}
              </text>
            )}
          </g>
        ))}
      </svg>

      <div className="legend">
        <div className="legend-item"><span className="legend-color red" /> High</div>
        <div className="legend-item"><span className="legend-color orange" /> Medium</div>
        <div className="legend-item"><span className="legend-color yellow" /> Low</div>
        <div className="legend-item"><span className="legend-color empty" /> Empty</div>
      </div>
    </div>
  );
};

export default Map;
