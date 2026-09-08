import { useState, useMemo, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Droplets, MapPin, Search, Filter } from "lucide-react";
import semarangGeojson from "../assets/kota_semarang.json";

const markerStyle = document.createElement("style");
markerStyle.textContent = `
  .custom-marker-icon {
    background: transparent !important;
    border: none !important;
  }
  .custom-marker-icon div {
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  }
`;
document.head.appendChild(markerStyle);

const SEMARANG_CENTER = [-6.997, 110.44];
const SEMARANG_ZOOM = 12;

const SEMARANG_RING = semarangGeojson.features[0].geometry.coordinates[0];
const SEMARANG_LATLNG = SEMARANG_RING.map(([lng, lat]) => [lat, lng]);

const SEMARANG_BOUNDS = L.latLngBounds(
  SEMARANG_LATLNG.map(([lat, lng]) => [lat, lng])
);

const STATUS_META = {
  selesai: { label: "Selesai", color: "#22c55e", bg: "bg-green-100 text-green-700" },
  dalam_proses: { label: "Dalam Proses", color: "#3b82f6", bg: "bg-blue-100 text-blue-700" },
  dibatalkan: { label: "Dibatalkan", color: "#ef4444", bg: "bg-red-100 text-red-700" },
};

const createDistributionIcon = (status) => {
  const color = STATUS_META[status]?.color || "#0ea5e9";
  const html = `
    <div style="position:relative;width:30px;height:40px;">
      <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.716 23.284 0 15 0z" fill="${color}"/>
        <circle cx="15" cy="14" r="6" fill="white"/>
        <circle cx="15" cy="14" r="3" fill="${color}"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: "custom-marker-icon",
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
  });
};

function InvalidateMapSize() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function RestrictBounds() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(SEMARANG_BOUNDS.pad(0.1));
    map.setMinZoom(11);
    map.setMaxZoom(16);
    map.on("drag", () => {
      map.panInsideBounds(SEMARANG_BOUNDS.pad(0.1), { animate: false });
    });
  }, [map]);
  return null;
}

export default function WaterDistributionMap({ items, onItemClick }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterStatus, setFilterStatus] = useState("dalam_proses");
  const containerRef = useRef(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      return item.status === filterStatus;
    });
  }, [items, filterStatus]);

  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver(() => {
        window.dispatchEvent(new Event("resize"));
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div ref={containerRef} className="flex flex-1 overflow-hidden" style={{ height: "100%", width: "100%" }}>
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarOpen ? "w-72" : "w-12"}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-600" />
                <span className="font-bold text-gray-900 text-sm">Lokasi Distribusi</span>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-gray-100 transition">
              <Filter className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          {sidebarOpen && (
            <div className="mt-3">
              {/* <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none">
                <option value="selesai">Selesai</option>
                <option value="dalam_proses">Dalam Proses</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select> */}
            </div>
          )}
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto">
          {sidebarOpen ? (
            filteredItems.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredItems.map((item) => {
                  const meta = STATUS_META[item.status] || STATUS_META.selesai;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onItemClick?.(item)}
                      className="w-full text-left p-3 rounded-lg hover:bg-cyan-50 transition group"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: meta.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{item.kelurahan}</p>
                          <p className="text-[10px] text-gray-500">{item.kecamatan || "-"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium ${meta.bg}`}>
                              {meta.label}
                            </span>
                            <span className="text-[9px] text-gray-400">{item.amount_liters || "-"}L</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-gray-400">
                <Droplets className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Tidak ada data</p>
              </div>
            )
          ) : (
            <div className="p-2 text-center">
              <Droplets className="w-6 h-6 mx-auto text-cyan-600 opacity-30" />
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative" style={{ height: "100%" }}>
        <MapContainer
          center={SEMARANG_CENTER}
          zoom={SEMARANG_ZOOM}
          className="w-full h-full"
          zoomControl={true}
          style={{ height: "100%", width: "100%" }}
          maxBounds={SEMARANG_BOUNDS.pad(0.1)}
          minZoom={11}
          maxZoom={16}
          worldCopyJump={false}
          maxBoundsViscosity={1.0}
        >
          <InvalidateMapSize />
          <RestrictBounds />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Semarang Boundary */}
          <Polygon
            positions={SEMARANG_LATLNG}
            path={{ color: "#0ea5e9", weight: 2, dashArray: "8, 4", fillColor: "#0ea5e9", fillOpacity: 0.05 }}
          />

          {/* Distribution Markers */}
          {filteredItems.map((item) => (
            <Marker
              key={item.id}
              position={[parseFloat(item.latitude) || SEMARANG_CENTER[0], parseFloat(item.longitude) || SEMARANG_CENTER[1]]}
              icon={createDistributionIcon(item.status)}
              eventHandlers={{ click: () => onItemClick?.(item) }}
            >
              <Popup maxWidth={250} minWidth={180}>
                <div className="text-sm">
                  <div className="font-bold text-gray-900 mb-1">{item.kelurahan}</div>
                  <div className="text-gray-500 text-xs mb-2">{item.kecamatan || "-"}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-3 h-3 text-cyan-600" />
                    <span className="text-xs">{item.amount_liters || "-"} Liter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_META[item.status]?.bg || "bg-gray-100 text-gray-700"}`}>
                      {STATUS_META[item.status]?.label || item.status}
                    </span>
                  </div>
                  {item.location_address && (
                    <p className="text-[10px] text-gray-400 mt-2">{item.location_address}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg border border-gray-100 p-3" style={{ zIndex: 1000 }}>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="font-medium text-gray-600">Status:</span>
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <span key={key} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                <span className="text-gray-600">{meta.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
