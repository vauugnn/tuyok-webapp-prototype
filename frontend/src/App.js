import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  const [markers, setMarkers] = useState([]);
  const [distance, setDistance] = useState(0);
  const [fare, setFare] = useState(null);
  const [discount, setDiscount] = useState(false);

  const calculateDistance = useCallback((marker1, marker2) => {
    const lat1 = marker1.lat;
    const lon1 = marker1.lng;
    const lat2 = marker2.lat;
    const lon2 = marker2.lng;

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }, []);

  useEffect(() => {
    if (markers.length === 2) {
      const [marker1, marker2] = markers;
      const distance = calculateDistance(marker1, marker2);
      setDistance(distance);
    }
  }, [markers, calculateDistance]);

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  function MapEvents() {
    useMapEvents({
      click: (e) => {
        if (markers.length < 2) {
          setMarkers([...markers, e.latlng]);
        } else {
          setMarkers([markers[1], e.latlng]);
        }
      },
    });
    return null;
  }

  async function calculateFare(e) {
    e.preventDefault();
    try {
      const response = await axios.post('/calculate_fare', { distance: distance, discount: discount });
      console.log("Response data:", response.data);
      setFare(response.data.fare);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <header className="navbar">
        <h1 className="navbar">Tuyok</h1>
        <p className="navbar">Fare Calculator Prototype</p>
      </header>
      <form id="fare-form" onSubmit={calculateFare}>
        <MapContainer center={[7.07, 125.61]} zoom={13} style={{ height: '600px' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEvents />
          {markers.map((marker, index) => (
            <Marker key={index} position={marker} />
          ))}
        </MapContainer>
        <div className="discount">
          <input
            type="checkbox"
            id="discount"
            name="discount"
            checked={discount}
            onChange={() => setDiscount(!discount)}
          />
          <label htmlFor="discount">
            <span></span>Are you a student, PWD, or senior citizen?
          </label>
        </div>
        <button type="submit" className="submit">
          Calculate Fare
        </button>
      </form>
      {fare !== null && (
        <p id="fare-result">Your fare is: ₱{fare}</p>
      )}
    </div>
  );
}

export default App;