// backend/services/mapService.js
// Global Safe Zone Service - Uses OpenStreetMap Nominatim API

const axios = require('axios');

// Find nearby safe zones based on user location (works globally!)
const findNearbySafeZones = async (latitude, longitude, radiusKm = 5) => {
  const safeZones = [];
  
  try {
    // Search for police stations
    const policeQuery = `police near ${latitude},${longitude}`;
    const policeResults = await searchOSM(policeQuery, latitude, longitude);
    safeZones.push(...policeResults.map(r => ({ ...r, type: 'police' })));
    
    // Search for hospitals
    const hospitalQuery = `hospital near ${latitude},${longitude}`;
    const hospitalResults = await searchOSM(hospitalQuery, latitude, longitude);
    safeZones.push(...hospitalResults.map(r => ({ ...r, type: 'hospital' })));
    
    // Search for embassies
    const embassyQuery = `embassy near ${latitude},${longitude}`;
    const embassyResults = await searchOSM(embassyQuery, latitude, longitude);
    safeZones.push(...embassyResults.map(r => ({ ...r, type: 'embassy' })));
    
    return safeZones.slice(0, 20); // Return top 20 nearest
  } catch (error) {
    console.error('Error finding safe zones:', error);
    return [];
  }
};

// Search OpenStreetMap
const searchOSM = async (query, lat, lon) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        limit: 10,
        lat: lat,
        lon: lon
      },
      headers: {
        'User-Agent': 'LuminaGuard/1.0'
      }
    });
    
    return response.data.map(place => ({
      name: place.display_name.split(',')[0],
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
      address: place.display_name
    }));
  } catch (error) {
    console.error('OSM search error:', error);
    return [];
  }
};

module.exports = { findNearbySafeZones };