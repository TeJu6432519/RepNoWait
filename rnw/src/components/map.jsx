// src/components/map.jsx
import React, { useEffect, useState } from "react";
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

// Gradient color generator: yellow → orange → red
const getHeatColor = (count, maxCount) => {
  if (!count || maxCount === 0) return "rgba(255,255,255,0.05)";
  const ratio = Math.min(1, count / maxCount);
  const r = 255;
  const g = Math.round(255 - 155 * ratio);
  const b = 0;
  return `rgba(${r},${g},${b},0.9)`;
};

const Map = ({ refreshKey }) => {
  const [zoneData, setZoneData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHeatmapData = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/heatmap-data");
      setZoneData(res.data || []);
    } catch (err) {
      console.error("🔥 Error fetching heatmap data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch every 5 seconds for live updates
  useEffect(() => {
    fetchHeatmapData();
    const interval = setInterval(fetchHeatmapData, 5000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const zones = gymZones.map((zone) => {
    const match = Array.isArray(zoneData)
      ? zoneData.find(
          (z) => z.zone_name?.toLowerCase() === zone.name.toLowerCase()
        )
      : null;
    return { ...zone, count: match ? match.count : 0 };
  });

  const maxCount = Math.max(...zones.map((z) => z.count), 1);

  return (
    <div className="map-page">
      <h2 className="map-title">🏋️ Gym Layout Heatmap</h2>
      {loading ? (
        <p style={{ color: "#aaa" }}>Loading heatmap...</p>
      ) : (
        <svg width="550" height="520" className="gym-map">
          {zones.map((z) => (
            <g key={z.name}>
              <rect
                x={z.x}
                y={z.y}
                width={z.width}
                height={z.height}
                rx="12"
                fill={getHeatColor(z.count, maxCount)}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="2"
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
      )}

      <div className="legend">
        <div className="legend-item">
          <span className="legend-color red" /> High
        </div>
        <div className="legend-item">
          <span className="legend-color orange" /> Medium
        </div>
        <div className="legend-item">
          <span className="legend-color yellow" /> Low
        </div>
        <div className="legend-item">
          <span className="legend-color empty" /> Empty
        </div>
      </div>
    </div>
  );
};

export default Map;
