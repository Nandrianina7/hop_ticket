import React, { useEffect, useRef, useState } from 'react';
import './LocationInput.css';

export default function LocationInput({ onSelectLocation }) {
  const inputRef = useRef(null);
  const mapRef = useRef(null); // Reference for the Map div
  const [mapInstance, setMapInstance] = useState(null);
  const [markerInstance, setMarkerInstance] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const API_KEY = import.meta.env.GOOGLE_CLOUD_API_KEY
  useEffect(() => {
    const loadScript = () => {
      if (window.google && window.google.maps) {
        initMapAndAutocomplete();
        return;
      }

      // REPLACE WITH YOUR REAL API KEY
      const script = document.createElement('script');
      script.src =
        `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMapAndAutocomplete;
      document.body.appendChild(script);
    };

    loadScript();
  }, []);

  const initMapAndAutocomplete = () => {
    // 1. Initialize the Interactive Map
    // We default to Antananarivo (or wherever you prefer)
    const defaultLocation = { lat: -18.8792, lng: 47.5079 };

    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 12,
      disableDefaultUI: true, // Hides the zoom (+/-) buttons for a clean look
      mapId: 'DEMO_MAP_ID', // Optional: required for advanced markers
    });

    setMapInstance(map);

    // Create a marker but keep it hidden initially
    const marker = new window.google.maps.Marker({
      map: map,
      visible: false,
    });
    setMarkerInstance(marker);

    // 2. Initialize Autocomplete
    const options = {
      types: [], // Search all establishments
      fields: ['name', 'geometry', 'formatted_address'],
    };

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, options);

    // Bind the autocomplete results to the map's bounds (optional, helps bias results)
    autocomplete.bindTo('bounds', map);

    // 3. Handle User Selection
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        return;
      }

      // --- THE MAGIC: Move the Map ---
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport); // Best for cities/large areas
      } else {
        map.setCenter(place.geometry.location); // Best for stadiums/buildings
        map.setZoom(17); // Zoom in close
      }

      // Move the marker
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      // Update state
      const locationData = {
        name: place.name,
        // address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lon: place.geometry.location.lng(),
      };

      setInputValue(place.name);
      console.log('Selected location:', locationData);
      if (onSelectLocation) onSelectLocation(locationData);
    });
  };

  return (
    <div className="location-card">
      <div className="card-header">
        <span className="label">Place</span>
      </div>

      <div className="map-wrapper">
        {/* The Real Google Map (Absolute Positioned Background) */}
        <div ref={mapRef} className="google-map-background"></div>

        {/* The UI Overlays (Inputs/Buttons sit on top) */}
        <div className="ui-overlay">
          <div className="toggle-container">
            {/* <button className="toggle-btn active">Ville</button>
            <button className="toggle-btn">Mondial</button> */}
          </div>

          <div className="input-wrapper">
            <span className="icon-location">📍</span>
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="Recherchez (ex: Stade Mahamasina)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
