/**
 * QueueLess Bharat — Live Geolocation & Spatial Distance Service
 * Implements HTML5 Geolocation API and Haversine formula calculation.
 */

export interface GeoCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  source: 'gps' | 'preset';
  label: string;
}

export const CITY_PRESETS: { id: string; name: string; state: string; coords: { lat: number; lng: number } }[] = [
  { id: 'delhi-ncr', name: 'Delhi-NCR (Central / Noida)', state: 'Delhi & UP', coords: { lat: 28.5355, lng: 77.3910 } },
  { id: 'mumbai', name: 'Mumbai Metropolitan', state: 'Maharashtra', coords: { lat: 19.0760, lng: 72.8777 } },
  { id: 'bengaluru', name: 'Bengaluru Tech Corridor', state: 'Karnataka', coords: { lat: 12.9716, lng: 77.5946 } },
  { id: 'hyderabad', name: 'Hyderabad Cyberabad', state: 'Telangana', coords: { lat: 17.3850, lng: 78.4867 } },
  { id: 'kolkata', name: 'Kolkata Metropolitan', state: 'West Bengal', coords: { lat: 22.5726, lng: 88.3639 } },
  { id: 'chennai', name: 'Chennai Central', state: 'Tamil Nadu', coords: { lat: 13.0827, lng: 80.2707 } },
  { id: 'pune', name: 'Pune Urban Region', state: 'Maharashtra', coords: { lat: 18.5204, lng: 73.8567 } },
];

export class LocationService {
  /**
   * Calculates geodesic distance between two points on Earth using Haversine formula
   * @returns distance in kilometers rounded to 1 decimal place
   */
  public static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's mean radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Reverse geocodes coordinates to a readable locality using free keyless OpenStreetMap Nominatim API
   */
  public static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
        {
          headers: { 'Accept-Language': 'en' },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const suburb = addr.suburb || addr.neighbourhood || addr.city_district || addr.residential;
        const city = addr.city || addr.town || addr.state_district || addr.county;
        if (suburb && city) return `${suburb}, ${city}`;
        if (city) return city;
        if (data.display_name) return data.display_name.split(',').slice(0, 2).join(', ');
      }
    } catch {}
    return `Live GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`;
  }

  /**
   * Requests real live GPS coordinates from the browser Geolocation API
   */
  public static async getLiveCoordinates(): Promise<GeoCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          let label = `Live GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`;

          try {
            const resolvedName = await LocationService.reverseGeocode(lat, lng);
            if (resolvedName) label = resolvedName;
          } catch {}

          resolve({
            lat,
            lng,
            accuracy: position.coords.accuracy,
            source: 'gps',
            label,
          });
        },
        (error) => {
          let message = 'Unable to retrieve location.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location access was denied. Please allow location access or choose a city preset.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location information is unavailable.';
          } else if (error.code === error.TIMEOUT) {
            message = 'Location request timed out.';
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }
}
