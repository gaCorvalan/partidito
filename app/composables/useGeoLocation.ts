import { computed, onMounted } from 'vue'
import { useSupabaseClient } from '~/composables/useSupabaseClient'
import { useAuth } from '~/composables/useAuth'

type GeoLocation = {
  lat: number
  lng: number
  accuracy: number
  timestamp: number
  placeName?: string
}

const STORAGE_KEY = 'partidito:geo'

export const useGeoLocation = () => {
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  const userId = computed(() => user.value?.id ?? null)
  const location = useState<GeoLocation | null>('geoLocation', () => null)
  const status = useState<'idle' | 'loading' | 'granted' | 'denied' | 'error'>(
    'geoStatus',
    () => 'idle'
  )
  const error = useState<string | null>('geoError', () => null)
  const loaded = useState<boolean>('geoLoaded', () => false)

  const hasLocation = computed(() => Boolean(location.value))

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!process.client) return null
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
      )
      if (!response.ok) return null
      const data = await response.json()
      const address = data.address ?? {}
      const place =
        address.city ||
        address.town ||
        address.village ||
        address.suburb ||
        address.neighbourhood ||
        data.display_name
      return typeof place === 'string' ? place : null
    } catch {
      return null
    }
  }

  const loadStoredLocation = () => {
    if (!process.client || loaded.value) return
    loaded.value = true
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as GeoLocation
      if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        location.value = parsed
        status.value = 'granted'
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const requestLocation = async () => {
    if (!process.client) return null
    if (!navigator.geolocation) {
      status.value = 'error'
      error.value = 'Geolocalizacion no disponible en este dispositivo.'
      return null
    }

    status.value = 'loading'
    error.value = null

    return await new Promise<GeoLocation | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const nextLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            placeName: undefined
          }
          const placeName = await reverseGeocode(nextLocation.lat, nextLocation.lng)
          if (placeName) {
            nextLocation.placeName = placeName
          }
          location.value = nextLocation
          status.value = 'granted'
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLocation))

          if (userId.value) {
            await supabase
              .from('profiles')
              .update({
                location: nextLocation.placeName ?? null,
                lat: nextLocation.lat,
                lng: nextLocation.lng,
                accuracy: nextLocation.accuracy
              })
              .eq('id', userId.value)
          }
          resolve(nextLocation)
        },
        (geoError) => {
          status.value = geoError.code === geoError.PERMISSION_DENIED ? 'denied' : 'error'
          error.value =
            geoError.code === geoError.PERMISSION_DENIED
              ? 'Permiso denegado. Activalo en tu navegador.'
              : 'No pudimos obtener tu ubicacion. Intenta de nuevo.'
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    })
  }

  const clearLocation = () => {
    if (!process.client) return
    localStorage.removeItem(STORAGE_KEY)
    location.value = null
    status.value = 'idle'
    error.value = null
  }

  onMounted(loadStoredLocation)

  return {
    location,
    hasLocation,
    status,
    error,
    requestLocation,
    clearLocation
  }
}
