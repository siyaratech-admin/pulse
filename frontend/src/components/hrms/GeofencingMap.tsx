import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface GeofencingMapProps {
    latitude?: number;
    longitude?: number;
    radius?: number;
    onLocationChange: (lat: number, lng: number) => void;
    onRadiusChange: (radius: number) => void;
    readOnly?: boolean;
}

export const GeofencingMap: React.FC<GeofencingMapProps> = ({
    latitude,
    longitude,
    radius = 100,
    onLocationChange,
    onRadiusChange,
    readOnly
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markerInstance = useRef<any>(null);
    const circleInstance = useRef<any>(null);
    const [status, setStatus] = useState<string>('');

    // Load Leaflet
    useEffect(() => {
        const loadLeaflet = () => {
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            if (!document.getElementById('leaflet-js')) {
                const script = document.createElement('script');
                script.id = 'leaflet-js';
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = () => initMap();
                document.head.appendChild(script);
            } else if ((window as any).L) {
                initMap();
            }
        };
        loadLeaflet();
    }, []);

    // Update map objects when props change
    useEffect(() => {
        if (!mapInstance.current || !(window as any).L) return;
        updateMapObjects(latitude, longitude, radius);
    }, [latitude, longitude, radius]);

    const initMap = () => {
        if (!mapRef.current || mapInstance.current) return;
        const L = (window as any).L;

        const initialLat = latitude || 0;
        const initialLng = longitude || 0;
        const zoom = latitude && longitude ? 15 : 2;

        mapInstance.current = L.map(mapRef.current).setView([initialLat, initialLng], zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(mapInstance.current);

        // Click handler
        if (!readOnly) {
            mapInstance.current.on('click', (e: any) => {
                onLocationChange(e.latlng.lat, e.latlng.lng);
            });
        }

        // Initial draw
        updateMapObjects(latitude, longitude, radius);
    };

    const updateMapObjects = (lat?: number, lng?: number, r: number = 100) => {
        const L = (window as any).L;
        if (!L || !mapInstance.current) return;

        // Clear existing if coords invalid
        if (lat === undefined || lng === undefined || lat === 0) return;

        const latLng = [lat, lng];

        // Update/Create Marker
        if (markerInstance.current) {
            markerInstance.current.setLatLng(latLng);
        } else {
            markerInstance.current = L.marker(latLng).addTo(mapInstance.current);
        }

        // Update/Create Circle
        if (circleInstance.current) {
            circleInstance.current.setLatLng(latLng);
            circleInstance.current.setRadius(r);
        } else {
            circleInstance.current = L.circle(latLng, {
                color: 'blue',
                fillColor: '#30f',
                fillOpacity: 0.2,
                radius: r
            }).addTo(mapInstance.current);
        }

        // Recenter if far away? Maybe not always to prevent jumping while dragging slider
        // But initially yes.
        // We'll let user pan manually mostly.
    };

    const handleGetCurrentLocation = () => {
        setStatus('Locating...');
        if (!navigator.geolocation) {
            setStatus('Geolocation not supported');
            return;
        }
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude: lat, longitude: lng } = position.coords;
            onLocationChange(lat, lng);
            if (mapInstance.current) {
                mapInstance.current.setView([lat, lng], 16);
            }
            setStatus('');
        }, (err) => {
            setStatus('Denied/Error');
        });
    };

    return (
        <div className="space-y-4">
            <Card className="p-4 bg-white space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm text-slate-700">Geofence Configuration</h3>
                    {!readOnly && (
                        <Button variant="outline" size="sm" onClick={handleGetCurrentLocation}>
                            <MapPin className="w-4 h-4 mr-2" />
                            Current Location
                        </Button>
                    )}
                </div>

                <div
                    ref={mapRef}
                    className="w-full h-[400px] rounded-md border border-slate-200 z-0 relative"
                />

                {!readOnly && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Geofence Radius (meters)</Label>
                                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                    {radius}m
                                </span>
                            </div>
                            <Slider
                                value={[radius]}
                                min={10}
                                max={2000}
                                step={10}
                                onValueChange={(val) => onRadiusChange(val[0])}
                                className="py-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Coordinates</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={latitude || ''}
                                    disabled
                                    placeholder="Lat"
                                    className="bg-slate-50 font-mono text-xs"
                                />
                                <Input
                                    value={longitude || ''}
                                    disabled
                                    placeholder="Lng"
                                    className="bg-slate-50 font-mono text-xs"
                                />
                            </div>
                        </div>
                    </div>
                )}
                {status && <p className="text-xs text-muted-foreground">{status}</p>}
            </Card>
        </div>
    );
};
