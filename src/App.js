import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const MapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom); 
  }, [center, zoom, map]);

  return null;
};

const App = () => {
  const [stores, setStores] = useState(() => {
    return JSON.parse(localStorage.getItem("stores")) || [];
  });

  const [form, setForm] = useState({
    name: "",
    city: "",
    lat: "",
    lng: "",
    postal: "",
    services: "",
  });

  const [search, setSearch] = useState("");
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [mapZoom, setMapZoom] = useState(13);

  useEffect(() => {
    localStorage.setItem("stores", JSON.stringify(stores));
  }, [stores]);

  const addStore = (e) => {
    e.preventDefault();

    const parsedLat = parseFloat(form.lat);
    const parsedLng = parseFloat(form.lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      alert("Please provide valid latitude and longitude values.");
      return;
    }

    const newStore = {
      ...form,
      lat: parsedLat,
      lng: parsedLng,
    };

    setStores([...stores, newStore]);
    setForm({ name: "", city: "", lat: "", lng: "", postal: "", services: "" });
  };

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(search.toLowerCase()) ||
    store.city.toLowerCase().includes(search.toLowerCase()) ||
    store.postal.includes(search)
  );

  const handleSearch = async () => {
    if (!search) return;

    const geocodeURL = `https://nominatim.openstreetmap.org/search?format=json&q=${search}`;
    try {
      const response = await axios.get(geocodeURL);
      const result = response.data[0]; 
      if (result) {
        const { lat, lon } = result;
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setMapZoom(12); 
      } else {
        alert("Location not found.");
      }
    } catch (error) {
      console.error("Geocoding error: ", error);
      alert("Error retrieving location.");
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Store Locator</h1>

      <form onSubmit={addStore} className="mb-4">
        <div className="form-group">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Latitude"
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Longitude"
            value={form.lng}
            onChange={(e) => setForm({ ...form, lng: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Postal Code"
            value={form.postal}
            onChange={(e) => setForm({ ...form, postal: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Services Offered"
            value={form.services}
            onChange={(e) => setForm({ ...form, services: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Add Store</button>
      </form>

      <input
        type="text"
        className="form-control mb-4"
        placeholder="Search stores..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button className="btn btn-info" onClick={handleSearch}>
        Search Location
      </button>

      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "500px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {filteredStores.map((store, index) => {
          const lat = parseFloat(store.lat);
          const lng = parseFloat(store.lng);
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker key={index} position={[lat, lng]}>
              <Popup>
                <b>{store.name}</b><br />
                {store.city}, {store.postal}<br />
                Services: {store.services}
              </Popup>
            </Marker>
          );
        })}
        
        <MapView center={mapCenter} zoom={mapZoom} />
      </MapContainer>
    </div>
  );
};

export default App;
