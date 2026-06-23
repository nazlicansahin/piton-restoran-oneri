# Places & geolocation functions

Nearby venues come from the OpenStreetMap Overpass API, proxied through a public
route so the browser never calls Overpass directly.

### `fetchNearbyPlaces`

- **File:** `lib/overpass.ts`
- **Purpose:** Fetch and normalize nearby restaurants, cafes, and fast-food venues around a coordinate.
- **How it works:**
  1. Builds an Overpass QL query for `amenity in (restaurant, cafe, fast_food)` within `radiusM`
  2. POSTs to Overpass with a `User-Agent` (required, else `406`)
  3. Maps elements to `Place`, computes distance, drops entries without coordinates
  4. Sorts ascending by distance
- **Inputs:** `lat`, `lng`, `radiusM`
- **Returns:** `Place[]`
- **Side effects:** Network call to Overpass (25s timeout)

### `buildOverpassQuery`

- **File:** `lib/overpass.ts`
- **Purpose:** Produce the Overpass QL string for a coordinate + radius.
- **Returns:** `string`
- **Side effects:** None (pure)

### `haversineKm`

- **File:** `lib/haversine.ts`
- **Purpose:** Great-circle distance between two coordinates in kilometers.
- **Inputs:** `lat1`, `lng1`, `lat2`, `lng2`
- **Returns:** `number` (km)
- **Side effects:** None (pure)

### `useGeolocation`

- **File:** `hooks/useGeolocation.ts`
- **Purpose:** React hook for the browser Geolocation API with permission states and an Eskişehir fallback.
- **Returns:** `{ lat, lng, status, error, request, fallback }`
- **Side effects:** Requests device location on mount (`enableHighAccuracy: false`)

### `getCachedNearbyPlaces`

- **File:** `lib/places-cache.ts`
- **Purpose:** Cache Overpass responses for 5 minutes with coordinate/radius bucketing via `unstable_cache`.
- **Inputs:** `lat`, `lng`, `radiusM`
- **Returns:** `Place[]`
- **Side effects:** Overpass network call on cache miss
