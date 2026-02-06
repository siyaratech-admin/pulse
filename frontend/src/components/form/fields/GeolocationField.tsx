import React, { useEffect, useRef, useState } from 'react';
import type { FormFieldProps } from '../../../types/form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

declare global {
    interface Window {
        L: any;
    }
}

export const GeolocationField: React.FC<FormFieldProps> = ({ field, value, onChange, error, disabled, className }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markerInstance = useRef<any>(null);
    const [status, setStatus] = useState<string>('');

    // Load Leaflet CSS and JS if not present
    useEffect(() => {
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
            script.onload = () => {
                initMap();
            };
            document.head.appendChild(script);
        } else if (window.L) {
            initMap();
        }
    }, []);

    const initMap = () => {
        if (!mapRef.current || mapInstance.current) return;

        mapInstance.current = window.L.map(mapRef.current).setView([0, 0], 2);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapInstance.current);

        if (!disabled) {
            mapInstance.current.on('click', (e: any) => {
                updateMarker(e.latlng.lat, e.latlng.lng);
            });
        }

        // Set initial marker if value exists
        if (value) {
            try {
                let lat, lng;
                if (typeof value === 'string' && value.startsWith('{')) {
                    const json = JSON.parse(value);
                    if (json.features && json.features[0] && json.features[0].geometry) {
                        const coords = json.features[0].geometry.coordinates;
                        lng = coords[0];
                        lat = coords[1];
                    } else if (json.type === 'Feature') {
                        const coords = json.geometry.coordinates;
                        lng = coords[0];
                        lat = coords[1];
                    }
                } else if (typeof value === 'string') {
                    [lat, lng] = value.split(',').map(parseFloat);
                }

                if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
                    updateMarker(lat, lng, false);
                    mapInstance.current.setView([lat, lng], 13);
                }
            } catch (e) {
                console.error("Failed to parse geolocation", e);
            }
        }
    };

    const updateMarker = (lat: number, lng: number, triggerChange = true) => {
        if (!mapInstance.current || !window.L) return;

        if (markerInstance.current) {
            markerInstance.current.setLatLng([lat, lng]);
        } else {
            markerInstance.current = window.L.marker([lat, lng]).addTo(mapInstance.current);
        }

        if (triggerChange && onChange) {
            const geoJSON = {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lng, lat]
                    }
                }]
            };
            onChange(JSON.stringify(geoJSON));
        }
    };

    const handleGetCurrentLocation = () => {
        setStatus('Locating...');
        if (!navigator.geolocation) {
            setStatus('Geolocation not supported');
            return;
        }
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            updateMarker(latitude, longitude);
            mapInstance.current.setView([latitude, longitude], 15);
            setStatus('');
        }, (err) => {
            setStatus('Location access denied');
        });
    };

    return (
        <div className={className}>
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                    {field.label}
                    {!!field.reqd && <span className="text-red-500 ml-1">*</span>}
                </label>
            </div>

            <Card className="overflow-hidden border border-input">
                <div ref={mapRef} className="w-full h-[300px] z-0" style={{ minHeight: '300px' }} />
                {!disabled && (
                    <div className="p-2 bg-muted/20 flex justify-between items-center border-t bg-slate-50">
                        <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={handleGetCurrentLocation}
                            className="bg-white"
                        >
                            <MapPin className="mr-2 h-4 w-4" />
                            Use Current Location
                        </Button>
                        <span className="text-xs text-muted-foreground">{status}</span>
                    </div>
                )}
            </Card>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};
