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
const apiaryIcon = createCustomIcon('#fbbf24'); // Yellow for apiaries

// Sample local producers in Northwest Arkansas (matching database data)
const producers = [
  {
    id: 1,
    name: "Green Acres Farm",
    type: "Organic Vegetables & Herbs",
    position: [36.1627, -94.1574] as [number, number], // Fayetteville area
    description: "Certified organic farm specializing in seasonal vegetables and herbs",
    icon: farmIcon
  },
  {
    id: 2,
    name: "Sweet Life Bakery",
    type: "Artisan Baked Goods",
    position: [36.1867, -94.1288] as [number, number], // Springdale area
    description: "Artisan bakery creating fresh bread, pastries, and custom cakes",
    icon: bakeryIcon
  },
  {
    id: 3,
    name: "Hillside Dairy",
    type: "Fresh Dairy Products",
    position: [36.3321, -94.1185] as [number, number], // Rogers area
    description: "Small family dairy producing fresh milk, cheese, and yogurt",
    icon: dairyIcon
  },
  {
    id: 4,
    name: "Heritage Meats",
    type: "Grass-Fed Meat & Poultry",
    position: [36.3729, -94.2088] as [number, number], // Bentonville
    description: "Pasture-raised livestock providing grass-fed beef and free-range chicken",
    icon: meatIcon
  },
  {
    id: 5,
    name: "Orchard Valley",
    type: "Seasonal Fruits",
    position: [36.2298, -94.1178] as [number, number], // Elkins area
    description: "Family orchard growing heirloom apples, peaches, and seasonal stone fruits",
    icon: farmIcon
  },
  {
    id: 6,
    name: "Happy Hen Farm",
    type: "Free-Range Eggs",
    position: [36.0420, -94.2474] as [number, number], // Farmington
    description: "Free-range chicken farm producing fresh eggs and seasonal poultry",
    icon: farmIcon
  },
  {
    id: 7,
    name: "Busy Bee Apiary",
    type: "Raw Honey & Bee Products",
    position: [35.9645, -94.3171] as [number, number], // Prairie Grove
    description: "Local beekeepers producing raw honey, beeswax products, and seasonal honey varieties",
    icon: apiaryIcon
  },
  {
    id: 8,
    name: "Urban Greens",
    type: "Microgreens & Herbs",
    position: [36.0822, -94.1719] as [number, number], // Fayetteville
    description: "Indoor vertical farm specializing in microgreens, herbs, and leafy greens",
    icon: farmIcon
  },
  {
    id: 9,
    name: "Ozark Mushrooms",
    type: "Specialty Mushrooms",
    position: [35.8012, -94.1341] as [number, number], // Winslow
    description: "Specialty mushroom farm growing shiitake, oyster, and seasonal wild mushrooms",
    icon: farmIcon
  },
  {
    id: 10,
    name: "Sunset Gardens",
    type: "Flowers & Herbs",
    position: [36.1573, -94.2341] as [number, number], // Tontitown
    description: "Flower and herb farm offering fresh cut flowers, culinary herbs, and medicinal plants",
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
            <span className="text-xs text-subtext-color">Bakeries & Apiaries</span>
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