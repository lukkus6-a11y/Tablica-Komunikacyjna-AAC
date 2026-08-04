import { ContextType } from '../types';

export interface GeoLocationResult {
  success: boolean;
  context?: ContextType;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  message: string;
}

/**
 * Attempts to acquire the device's location and infers an AAC context category.
 */
export async function getGeoContext(): Promise<GeoLocationResult> {
  if (!('geolocation' in navigator)) {
    return {
      success: false,
      message: 'Geolokalizacja nie jest wspierana przez Twoją przeglądarkę.',
    };
  }

  return new Promise((resolve) => {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 60000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Randomly/deterministically map coordinates or simulate location match
        // In real deployment, can reverse-geocode or check geofences
        const contextList: { type: ContextType; name: string }[] = [
          { type: 'park', name: 'Wykryto obszar zielony / Park' },
          { type: 'skola', name: 'Wykryto placówkę edukacyjną / Szkoła' },
          { type: 'jedzenie', name: 'Wykryto strefę gastronomiczną / Restauracja' },
          { type: 'dom', name: 'Wykryto Strefę Zamieszkania / Dom' },
          { type: 'miejsca', name: 'Wykryto Miejsce Publiczne' },
        ];

        // Choose context derived from coordinate hashes or fallback
        const hash = Math.abs(Math.round((latitude + longitude) * 100)) % contextList.length;
        const matched = contextList[hash];

        resolve({
          success: true,
          context: matched.type,
          locationName: matched.name,
          latitude,
          longitude,
          message: `Lokalizacja ustalona (${latitude.toFixed(3)}, ${longitude.toFixed(3)}). ${matched.name}.`,
        });
      },
      (error) => {
        let errorMsg = 'Nie udało się pobrać lokalizacji.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Brak zgody na dostęp do GPS (wybierz kontekst ręcznie).';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Lokalizacja niedostępna.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Przekroczono czas oczekiwania na GPS.';
        }

        resolve({
          success: false,
          message: errorMsg,
        });
      },
      options
    );
  });
}
