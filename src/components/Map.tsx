import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for different types of producers
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const farmIcon = createCustomIcon('#70af7d'); // Green for farms
const bakeryIcon = createCustomIcon('#f59e0b'); // Orange for bakeries
const dairyIcon = createCustomIcon('#3b82f6'); // Blue for dairy
const meatIcon = createCustomIcon('#ef4444'); // Red for meat

// Sample local producers in Northwest Arkansas
const producers = [
  {
    id: 1,
    name: "Green Acres Farm",
    type: "Organic Vegetables",
    position: [36.1627, -94.1574] as [number, number], // Fayetteville area
    description: "Certified organic vegetables, herbs, and seasonal produce",
    icon: farmIcon
  },
  {
    id: 2,
    name: "Sweet Life Bakery",
    type: "Artisan Baked Goods",
    position: [36.0822, -94.1719] as [number, number], // Springdale area
    description: "Fresh bread, pastries, and artisan baked goods",
    icon: bakeryIcon
  },
  {
    id: 3,
    name: "Hillside Dairy",
    type: "Fresh Dairy Products",
    position: [36.3729, -94.2088] as [number, number], // Rogers area
    description: "Farm-fresh milk, cheese, and dairy products",
    icon: dairyIcon
  },
  {
    id: 4,
    name: "Heritage Meats",
    type: "Grass-Fed Meat",
    position: [36.1881, -94.1308] as [number, number], // Fayetteville
    description: "Grass-fed beef, free-range chicken, and heritage pork",
    icon: meatIcon
  },
  {
    id: 5,
    name: "Ozark Orchard",
    type: "Seasonal Fruits",
    position: [36.2298, -94.1178] as [number, number], // Elkins area
    description: "Apples, peaches, berries, and seasonal fruit varieties",
    icon: farmIcon
  },
  {
    id: 6,
    name: "Prairie Grove Farm",
    type: "Mixed Produce",
    position: [35.9645, -94.3171] as [number, number], // Prairie Grove
    description: "Seasonal vegetables, herbs, and farm-fresh eggs",
    icon: farmIcon
  },
  {
    id: 7,
    name: "Bentonville Bees",
    type: "Raw Honey",
    position: [36.3729, -94.2088] as [number, number], // Bentonville area
    description: "Raw honey, beeswax products, and seasonal honey varieties",
    icon: farmIcon
  }
];

interface MapProps {
  className?: string;
}

const Map: React.FC<MapProps> = ({ className }) => {
  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={[36.1627, -94.1574]} // Centered on Fayetteville, AR
        zoom={10}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {producers.map((producer) => (
          <Marker
            key={producer.id}
            position={producer.position}
            icon={producer.icon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-default-font">{producer.name}</h3>
                <p className="text-sm text-brand-600 font-medium">{producer.type}</p>
                <p className="text-sm text-subtext-color mt-1">{producer.description}</p>
                <button className="mt-2 px-3 py-1 bg-brand-600 text-white text-sm rounded hover:bg-brand-500 transition-colors">
                  View Products
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md border border-neutral-200 z-[1000]">
        <h4 className="text-sm font-semibold text-default-font mb-2">Local Producers</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-600"></div>
            <span className="text-xs text-subtext-color">Farms & Produce</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-subtext-color">Bakeries</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-subtext-color">Dairy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-subtext-color">Meat & Poultry</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;