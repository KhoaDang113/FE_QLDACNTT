import { useState, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    onLocationSelect: (location: {
        lat: number;
        lng: number;
        address?: {
            province?: string;
            city?: string;
            district?: string;
            ward?: string;
            street?: string;
            full_address?: string;
        };
    }) => void;
    initialLocation?: { lat: number; lng: number };
}

function LocationMarker({
    position,
    setPosition,
    onDragEnd,
}: {
    position: L.LatLng;
    setPosition: (pos: L.LatLng) => void;
    onDragEnd: (pos: L.LatLng) => void;
}) {
    const markerRef = useRef<L.Marker>(null);
    const map = useMap();

    useEffect(() => {
        map.flyTo(position, map.getZoom());
    }, [position, map]);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker) {
                    const newPos = marker.getLatLng();
                    setPosition(newPos);
                    onDragEnd(newPos);
                }
            },
        }),
        [onDragEnd, setPosition]
    );

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    );
}

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
    const defaultPosition = new L.LatLng(10.762622, 106.660172);
    const [position, setPosition] = useState<L.LatLng>(
        initialLocation
            ? new L.LatLng(initialLocation.lat, initialLocation.lng)
            : defaultPosition
    );
    const [loading, setLoading] = useState(false);

    const handleReverseGeocode = async (lat: number, lng: number) => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`
            );
            const data = await response.json();

            if (data && data.address) {
                const address = data.address;
                // Nominatim mapping for Vietnam:
                // state -> Province / Thành phố trực thuộc trung ương (Level 1)
                // city, town, county -> District / Quận / Huyện / Thành phố thuộc tỉnh (Level 2)

                const province = address.state;
                const city = address.city || address.town || address.county || address.municipality;
                const district = address.district || address.suburb || address.city_district;

                // Mở rộng fallback cho ward - nhiều vùng nông thôn dùng key khác
                const ward = address.quarter || address.neighbourhood || address.village || address.hamlet || address.residential;

                // Debug log để kiểm tra dữ liệu từ Nominatim
                console.log('[LocationPicker] Nominatim response:', {
                    raw: address,
                    parsed: { province, city, district, ward }
                });

                // Tạo thông tin đường với nhiều fallback options
                let street = '';

                // Ưu tiên: road, pedestrian, cycleway, path, footway
                const roadName = address.road || address.pedestrian || address.cycleway || address.path || address.footway;

                if (roadName) {
                    // Nếu có số nhà, thêm vào
                    street = address.house_number ? `${address.house_number} ${roadName}` : roadName;
                } else {
                    // Fallback: Sử dụng thông tin khác nếu không có tên đường
                    // Ưu tiên: hamlet, suburb, neighbourhood nếu chưa dùng cho ward/district
                    const fallbackLocation = (!ward) ? (address.hamlet || address.suburb || address.neighbourhood) : undefined;

                    if (fallbackLocation) {
                        street = fallbackLocation;
                    } else if (data.display_name) {
                        // Nếu vẫn không có, sử dụng phần đầu của display_name
                        const parts = data.display_name.split(',');
                        street = parts[0] || '';
                    }
                }

                onLocationSelect({
                    lat,
                    lng,
                    address: {
                        province,
                        city,
                        district,
                        ward,
                        street: street.trim(),
                        full_address: data.display_name,
                    },
                });
            } else {
                onLocationSelect({ lat, lng });
            }
        } catch (error) {
            console.error("Error reverse geocoding:", error);
            onLocationSelect({ lat, lng });
        } finally {
            setLoading(false);
        }
    };

    const handleGetCurrentLocation = () => {
        if ("geolocation" in navigator) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const newPos = new L.LatLng(latitude, longitude);
                    setPosition(newPos);
                    handleReverseGeocode(latitude, longitude);
                    setLoading(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLoading(false);
                    alert("Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí.");
                }
            );
        } else {
            alert("Trình duyệt của bạn không hỗ trợ định vị.");
        }
    };

    return (
        <div className="flex flex-col h-full gap-2">
            <div className="flex justify-between items-center">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetCurrentLocation}
                    disabled={loading}
                    className="flex items-center gap-2 text-xs"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                    ) : (
                        <Navigation className="w-3 h-3" />
                    )}
                    Vị trí hiện tại
                </Button>
            </div>

            <div className="flex-1 min-h-[300px] w-full rounded-md overflow-hidden border border-gray-300 relative z-0">
                <MapContainer
                    center={position}
                    zoom={15}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                        position={position}
                        setPosition={setPosition}
                        onDragEnd={(pos) => handleReverseGeocode(pos.lat, pos.lng)}
                    />
                </MapContainer>
            </div>
        </div>
    );
}
