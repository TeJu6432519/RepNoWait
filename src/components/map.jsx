import React, { useMemo } from "react";
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

/**
 * Small synonym map: map common booking labels to zone names.
 * Extend this if you have other variant labels in bookings.
 */
const SYNONYMS = {
  "chest press machine": "Chest Press",
  "treadmill": "Treadmills",
  "treadmills": "Treadmills",
  "stationary bike": "Stationary Bikes",
  "stationary bikes": "Stationary Bikes",
  "lat pulldown machine": "Lat Pulldown",
  "leg press machine": "Leg Press",
  "dumbbells": "Dumbbell Area",
  "dumbbell area": "Dumbbell Area",
  "squat rack": "Squat Rack",
};

/** return normalized zone name for a booking equipment string */
const normalizeBookingToZone = (equipment) => {
  if (!equipment) return "";
  const be = equipment.toLowerCase().trim();
  if (SYNONYMS[be]) return SYNONYMS[be];

  // try to match by inclusion (flexible)
  for (const zone of gymZones) {
    const zn = zone.name.toLowerCase();
    if (be.includes(zn) || zn.includes(be)) return zone.name;
    // match base words (e.g., 'treadmill' vs 'treadmills')
    if (be.replace(/s$/, "") === zn.replace(/s$/, "")) return zone.name;
  }

  // fallback: return original equipment (so it won't match any zone)
  return equipment;
};

/** color: smooth gradient from yellow -> orange -> red */
const getHeatColor = (count, maxCount) => {
  if (!count || maxCount === 0) return "rgba(255,255,255,0.06)"; // empty / faint
  const ratio = Math.min(1, count / Math.max(1, maxCount)); // 0..1

  // produce a gradient: 0 -> yellow (255,255,0), 0.5 -> orange (255,165,0), 1 -> red (255,0,0)
  // We'll interpolate between these stops:
  const lerp = (a, b, t) => Math.round(a + (b - a) * t);

  let r, g, b;
  if (ratio <= 0.5) {
    // yellow -> orange
    const t = ratio / 0.5;
    r = lerp(255, 255, t); // stays 255
    g = lerp(255, 165, t);
    b = 0;
  } else {
    // orange -> red
    const t = (ratio - 0.5) / 0.5;
    r = lerp(255, 255, t); // stays 255
    g = lerp(165, 0, t);
    b = 0;
  }

  // ensure visible alpha
  return `rgba(${r}, ${g}, ${b}, 0.92)`;
};

const Map = ({ bookings = [] }) => {
  // build normalized bookings -> zone mapping and counts (memoized)
  const zones = useMemo(() => {
    // count map by zone name
    const countMap = {};
    for (const zone of gymZones) countMap[zone.name] = 0;

    bookings.forEach((b) => {
      if (!b) return;
      // only consider active (not done) bookings
      if (b.done) return;
      const mapped = normalizeBookingToZone(b.equipment);
      if (countMap[mapped] !== undefined) countMap[mapped] += 1;
      // else ignore (not a known zone)
    });

    // return an array with counts baked in
    return gymZones.map((z) => ({ ...z, count: countMap[z.name] || 0 }));
  }, [bookings]);

  const maxCount = Math.max(...zones.map((z) => z.count), 0);

  // debug — open console to inspect counts if something still looks wrong
  // (comment out in production)
  // eslint-disable-next-line no-console
  console.log("Map zones counts:", zones.map((z) => ({ name: z.name, count: z.count })), "max:", maxCount);

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
