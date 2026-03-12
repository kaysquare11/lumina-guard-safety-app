import { useEffect, useRef } from 'react';

function SimpleMap({ userLocation }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    
    script.onload = () => {
      const L = window.L;
      
      // Use user's location or default to Lagos
      const initialLat = userLocation?.latitude || 6.5244;
      const initialLng = userLocation?.longitude || 3.3792;
      
      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      // Safe zones - these will update based on user location in future
      const safeZones = [
        { name: "Local Police Station", type: "Police", lat: initialLat + 0.02, lng: initialLng + 0.01, color: '#3B82F6' },
        { name: "Community Police", type: "Police", lat: initialLat - 0.01, lng: initialLng + 0.02, color: '#3B82F6' },
        { name: "Main Police HQ", type: "Police", lat: initialLat + 0.01, lng: initialLng - 0.02, color: '#3B82F6' },
        { name: "General Hospital", type: "Hospital", lat: initialLat + 0.03, lng: initialLng - 0.01, color: '#EF4444' },
        { name: "Emergency Clinic", type: "Hospital", lat: initialLat - 0.02, lng: initialLng, color: '#EF4444' },
        { name: "Medical Center", type: "Hospital", lat: initialLat, lng: initialLng + 0.03, color: '#EF4444' },
        { name: "Embassy Zone 1", type: "Embassy", lat: initialLat - 0.01, lng: initialLng - 0.01, color: '#10B981' },
        { name: "Embassy Zone 2", type: "Embassy", lat: initialLat + 0.02, lng: initialLng + 0.02, color: '#10B981' }
      ];

      safeZones.forEach(zone => {
        const marker = L.marker([zone.lat, zone.lng]).addTo(map);
        marker.bindPopup(`
          <div style="padding: 8px;">
            <div style="font-weight: bold; color: ${zone.color}; margin-bottom: 5px;">
              ${zone.type}
            </div>
            <div style="font-size: 14px;">${zone.name}</div>
          </div>
        `);
        markersRef.current.push({ marker, type: 'safeZone' });
      });

      mapInstanceRef.current = map;
    };

    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    const oldUserMarker = markersRef.current.find(m => m.type === 'user');
    if (oldUserMarker) {
      map.removeLayer(oldUserMarker.marker);
      markersRef.current = markersRef.current.filter(m => m.type !== 'user');
    }

    const userMarker = L.marker([userLocation.latitude, userLocation.longitude]).addTo(map);
    userMarker.bindPopup(`
      <div style="padding: 8px; text-align: center;">
        <div style="font-weight: bold; color: #8B7BC7; margin-bottom: 5px;">
          📍 Your Location
        </div>
        <div style="font-size: 12px;">
          ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}
        </div>
      </div>
    `).openPopup();

    markersRef.current.push({ marker: userMarker, type: 'user' });
    map.setView([userLocation.latitude, userLocation.longitude], 14);
  }, [userLocation]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: '1rem', zIndex: 1 }} />
      
      <div style={{
        position: 'absolute', bottom: '20px', right: '20px',
        background: 'rgba(255, 255, 255, 0.95)', padding: '12px 15px',
        borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000, fontSize: '13px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🗺️ Map Legend</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#8B7BC7' }}></div>
            <span>Your Location</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#3B82F6' }}></div>
            <span>🚓 Police</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#EF4444' }}></div>
            <span>🏥 Hospital</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#10B981' }}></div>
            <span>🏛️ Embassy</span>
          </div>
        </div>
      </div>

      {userLocation && (
        <div style={{
          position: 'absolute', top: '15px', left: '15px',
          background: 'linear-gradient(135deg, #8B7BC7 0%, #6B5B97 100%)',
          color: 'white', padding: '10px 15px', borderRadius: '10px',
          fontSize: '13px', fontWeight: '600',
          boxShadow: '0 4px 12px rgba(139, 123, 199, 0.4)', zIndex: 1000
        }}>
          📍 {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
        </div>
      )}
    </div>
  );
}

export default SimpleMap;