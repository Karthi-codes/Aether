import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { Box, Typography, Paper } from '@mui/material';

import { COMPANY_LOCATION } from '../../../utils/shippingCalculator';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom store icon
const storeIcon = new L.DivIcon({
    html: `<div style="
    background: #D4AF37;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    font-size: 18px;
  ">🏪</div>`,
    className: 'store-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

// Custom delivery icon
const deliveryIcon = new L.DivIcon({
    html: `<div style="
    background: #4CAF50;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    font-size: 18px;
  ">📍</div>`,
    className: 'delivery-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

interface DeliveryMapProps {
    destinationLat?: number;
    destinationLon?: number;
    destinationAddress?: string;
    distance?: number;
    onLocationSelect?: (lat: number, lon: number) => void;
}

// Component to fit map bounds when destination changes
const FitBounds: React.FC<{
    origin: LatLngExpression;
    destination?: LatLngExpression;
}> = ({ origin, destination }) => {
    const map = useMap();

    useEffect(() => {
        if (destination) {
            const bounds = L.latLngBounds([origin, destination]);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            map.setView(origin, 10);
        }
    }, [map, origin, destination]);

    return null;
};

// Component to handle map click for location selection
const MapClickHandler: React.FC<{ onLocationSelect?: (lat: number, lon: number) => void }> = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            if (onLocationSelect) {
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
};

const DeliveryMap: React.FC<DeliveryMapProps> = ({
    destinationLat,
    destinationLon,
    destinationAddress,
    distance,
    onLocationSelect
}) => {


    const storePosition: LatLngExpression = [
        COMPANY_LOCATION.coordinates.lat,
        COMPANY_LOCATION.coordinates.lng
    ];

    const destinationPosition: LatLngExpression | undefined = useMemo(() => {
        if (destinationLat && destinationLon) {
            return [destinationLat, destinationLon] as LatLngExpression;
        }
        return undefined;
    }, [destinationLat, destinationLon]);

    // Tile layer URLs - use standard OSM tiles
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: '#e0e0e0',
                mb: 3
            }}
        >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: '#e0e0e0' }}>
                <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    🗺️ Delivery Route
                </Typography>
                {distance !== undefined && distance > 0 && (
                    <Typography variant="body2" color="text.secondary">
                        Distance: <strong>{distance} km</strong> from Salem
                    </Typography>
                )}
            </Box>

            <Box sx={{ height: 300, position: 'relative' }}>
                <MapContainer
                    center={storePosition}
                    zoom={10}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        url={tileUrl}
                        attribution={attribution}
                    />

                    <FitBounds origin={storePosition} destination={destinationPosition} />

                    {/* Click handler for location selection */}
                    <MapClickHandler onLocationSelect={onLocationSelect} />

                    {/* Store Marker */}
                    <Marker position={storePosition} icon={storeIcon}>
                        <Popup>
                            <strong>AETHER Store</strong>
                            <br />
                            {COMPANY_LOCATION.address}
                        </Popup>
                    </Marker>

                    {/* Destination Marker */}
                    {destinationPosition && (
                        <Marker position={destinationPosition} icon={deliveryIcon}>
                            <Popup>
                                <strong>Delivery Location</strong>
                                <br />
                                {destinationAddress || 'Your Address'}
                                {distance !== undefined && distance > 0 && (
                                    <>
                                        <br />
                                        <em>{distance} km from store</em>
                                    </>
                                )}
                            </Popup>
                        </Marker>
                    )}

                    {/* Route Line */}
                    {destinationPosition && (
                        <Polyline
                            positions={[storePosition, destinationPosition]}
                            pathOptions={{
                                color: '#2C2C2C',
                                weight: 3,
                                opacity: 0.7,
                                dashArray: '10, 10'
                            }}
                        />
                    )}
                </MapContainer>
            </Box>

            {!destinationPosition && (
                <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                    <Typography variant="body2" color="text.secondary">
                        Enter your address or <strong>click on the map</strong> to set delivery location
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default DeliveryMap;
