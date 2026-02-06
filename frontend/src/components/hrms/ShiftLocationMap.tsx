import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const ShiftLocationMap: React.FC = () => {
    const { data: shiftLocations } = useFrappeGetDocList('Shift Location', {
        fields: ['name', 'latitude', 'longitude', 'location_name']
    });

    const [locations, setLocations] = useState<any[]>([]);

    useEffect(() => {
        if (shiftLocations) {
            const validLocations = shiftLocations.filter(
                (loc) => loc.latitude && loc.longitude
            );
            setLocations(validLocations);
        }
    }, [shiftLocations]);

    // Default center (can be adjusted or dynamic)
    const defaultCenter: [number, number] = [20.5937, 78.9629]; // India center

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm z-0">
            <MapContainer center={defaultCenter} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locations.map((loc) => (
                    <Marker key={loc.name} position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}>
                        <Popup>
                            <div className="font-semibold">{loc.location_name}</div>
                            <div className="text-xs text-gray-500">{loc.name}</div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default ShiftLocationMap;
