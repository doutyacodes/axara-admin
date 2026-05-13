// components/MapLocationPicker.jsx
//
// Drop-in replacement for the Google Maps version.
// Same props interface:
//   latitude, longitude, onLocationChange, className
//
// Replaces:
//   GoogleMap + LoadScript + Marker + Autocomplete  →  Leaflet + OpenStreetMap tiles
//   Google Places Autocomplete                      →  Nominatim autocomplete (free, no key)
//   google.maps.Geocoder                            →  Nominatim reverse/forward geocode
//
// No API key required.
//
// Requirements (already installed from the CommunityView migration):
//   npm install leaflet
//   globals.css: @import 'leaflet/dist/leaflet.css';

"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { MapPin, Search, Crosshair, X, Loader2 } from "lucide-react";

// ─── Leaflet lazy-load (SSR-safe) ────────────────────────────────────────────
let L = null;

async function loadLeaflet() {
  if (L) return;
  L = (await import("leaflet")).default;

  // Fix Webpack-mangled default icon paths
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// ─── Nominatim helpers (replaces Google Geocoder + Places Autocomplete) ───────
const NOMINATIM = "https://nominatim.openstreetmap.org";

async function nominatimSearch(query) {
  const url = `${NOMINATIM}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) throw new Error("Nominatim search failed");
  return res.json(); // array of { lat, lon, display_name, … }
}

async function nominatimReverseGeocode(lat, lng) {
  const url = `${NOMINATIM}/reverse?format=json&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.display_name ?? null;
}

// ─── Component ────────────────────────────────────────────────────────────────
const MapLocationPicker = ({
  latitude,
  longitude,
  onLocationChange,
  className = "",
}) => {
  const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 }; // Delhi fallback

  const [mapCenter, setMapCenter] = useState({
    lat: latitude  ? parseFloat(latitude)  : DEFAULT_CENTER.lat,
    lng: longitude ? parseFloat(longitude) : DEFAULT_CENTER.lng,
  });

  const [markerPosition, setMarkerPosition] = useState(
    latitude && longitude
      ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
      : null
  );

  // Search state
  const [searchQuery, setSearchQuery]       = useState("");
  const [suggestions, setSuggestions]       = useState([]);
  const [isSearching, setIsSearching]       = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeolocating, setIsGeolocating]   = useState(false);
  const debounceRef   = useRef(null);
  const searchBoxRef  = useRef(null);

  // Leaflet refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef  = useRef(null);
  const markerRef       = useRef(null);
  const [mapReady, setMapReady]             = useState(false);

  // ── 1. Boot Leaflet map once ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      await loadLeaflet();
      if (cancelled || !mapContainerRef.current || mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center:             [mapCenter.lat, mapCenter.lng],
        zoom:               markerPosition ? 15 : 10,
        zoomControl:        true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom:     19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Click to place / move marker
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        placeMarker(map, { lat, lng });
        onLocationChange(lat.toString(), lng.toString());
      });

      // If we already have a position, drop a marker immediately
      if (markerPosition) {
        const m = L.marker([markerPosition.lat, markerPosition.lng], { draggable: true }).addTo(map);
        m.on("dragend", (e) => {
          const { lat, lng } = e.target.getLatLng();
          setMarkerPosition({ lat, lng });
          onLocationChange(lat.toString(), lng.toString());
        });
        markerRef.current = m;
      }

      mapInstanceRef.current = map;
      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Sync external lat/lng prop changes ────────────────────────────────────
  useEffect(() => {
    if (!latitude || !longitude) return;
    const pos = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
    setMarkerPosition(pos);
    setMapCenter(pos);
    if (mapReady && mapInstanceRef.current) {
      placeMarker(mapInstanceRef.current, pos);
      mapInstanceRef.current.setView([pos.lat, pos.lng], 15);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, mapReady]);

  // ── Helper: place / move the draggable marker ────────────────────────────────
  const placeMarker = useCallback((map, pos) => {
    setMarkerPosition(pos);

    if (markerRef.current) {
      markerRef.current.setLatLng([pos.lat, pos.lng]);
    } else {
      const m = L.marker([pos.lat, pos.lng], { draggable: true }).addTo(map);
      m.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        setMarkerPosition({ lat, lng });
        onLocationChange(lat.toString(), lng.toString());
      });
      markerRef.current = m;
    }

    map.panTo([pos.lat, pos.lng]);
  }, [onLocationChange]);

  // ── 3. Debounced autocomplete (Nominatim) ────────────────────────────────────
  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await nominatimSearch(val);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch {
        // silently ignore network errors in autocomplete
      }
    }, 350); // 350 ms debounce — respects Nominatim usage policy
  };

  const handleSuggestionClick = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const label = suggestion.display_name;

    setSearchQuery(label);
    setSuggestions([]);
    setShowSuggestions(false);

    if (mapReady && mapInstanceRef.current) {
      placeMarker(mapInstanceRef.current, { lat, lng });
      mapInstanceRef.current.setView([lat, lng], 15);
    }
    onLocationChange(lat.toString(), lng.toString());
  };

  // ── 4. Manual search (Enter / button) ───────────────────────────────────────
  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await nominatimSearch(searchQuery);
      if (!results.length) {
        alert("Location not found. Please try a different search term.");
        return;
      }
      handleSuggestionClick(results[0]);
    } catch {
      alert("Search failed. Please check your connection and try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowSuggestions(false);
      handleManualSearch();
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // ── 5. Current location (unchanged logic) ────────────────────────────────────
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapReady && mapInstanceRef.current) {
          placeMarker(mapInstanceRef.current, { lat, lng });
          mapInstanceRef.current.setView([lat, lng], 15);
        }
        onLocationChange(lat.toString(), lng.toString());
        setIsGeolocating(false);
      },
      (error) => {
        setIsGeolocating(false);
        const messages = {
          [error.PERMISSION_DENIED]:    "Please allow location access and try again.",
          [error.POSITION_UNAVAILABLE]: "Location information is unavailable.",
          [error.TIMEOUT]:              "Location request timed out.",
        };
        alert("Unable to get your current location. " + (messages[error.code] ?? "An unknown error occurred."));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // ── Close suggestion dropdown when clicking outside ──────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Location <MapPin className="h-4 w-4 inline text-red-800 ml-1" />
      </label>

      {/* Search + Current Location */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        {/* Search box with Nominatim autocomplete */}
        <div className="flex-1 relative" ref={searchBoxRef}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInput}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search for a location... (e.g. 'India' or 'New York')"
              className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <button
                type="button"
                onClick={handleManualSearch}
                disabled={isSearching}
                className="text-gray-400 hover:text-red-600 disabled:opacity-50 p-1"
                title="Search"
              >
                {isSearching
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Search className="h-4 w-4" />
                }
              </button>
            </div>
          </div>

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-[9999] w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-56 overflow-y-auto">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onMouseDown={() => handleSuggestionClick(s)} // mousedown fires before blur
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer truncate border-b border-gray-100 last:border-0"
                  title={s.display_name}
                >
                  <MapPin className="h-3 w-3 inline mr-1 text-red-400 flex-shrink-0" />
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Current Location button */}
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isGeolocating}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
        >
          {isGeolocating
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Crosshair className="h-4 w-4" />
          }
          Current Location
        </button>
      </div>

      {/* Map Container */}
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <div
          ref={mapContainerRef}
          style={{ width: "100%", height: "400px", borderRadius: "8px" }}
        />
      </div>

      {/* Coordinates Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="display-latitude" className="block text-xs text-gray-500 mb-1">
            Latitude
          </label>
          <input
            type="text"
            id="display-latitude"
            value={markerPosition ? markerPosition.lat.toFixed(6) : ""}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            placeholder="Click on map to set location"
          />
        </div>
        <div>
          <label htmlFor="display-longitude" className="block text-xs text-gray-500 mb-1">
            Longitude
          </label>
          <input
            type="text"
            id="display-longitude"
            value={markerPosition ? markerPosition.lng.toFixed(6) : ""}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            placeholder="Click on map to set location"
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
        <p className="font-medium mb-1">How to use:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Type in the search box to see location suggestions</li>
          <li>Click anywhere on the map to place a marker</li>
          <li>Drag the marker to fine-tune the location</li>
          <li>Use &quot;Current Location&quot; to auto-detect your position</li>
        </ul>
      </div>
    </div>
  );
};

export default MapLocationPicker;