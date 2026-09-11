# DigiNiwas V1 Home APIs

Base URL: `http://localhost:3000/api/v1`

All endpoints require `Authorization: Bearer <buyer-token>`.

## Location priority
1. If frontend sends `lat` and `lng`, those coordinates are used as current location.
2. If current coordinates are not provided/permission is denied, Buyer.location is used.
3. `city` may also be sent by frontend after reverse-geocoding the current coordinates.

Example:
`GET /api/v1/home/feed?lat=19.1197&lng=72.8464&city=Mumbai`

## Endpoints
- `GET /home/feed` - one-call home aggregator: CMS banners + promoted property banners, recommended properties, boosted properties, new listings, popular areas and verified agents.
- `GET /user/dashboard-header` - greeting + logged-in buyer + resolved location + latest notifications/unread count.
- `GET /properties/categories?tab=Buy` - Buy/Rent/Plot/Commercial tabs with category counts and location-ranked properties.
- `GET /properties/categories?category=Residential` - exact database category filter. Valid values: Residential, Commercial, Rental, Sell, Plot/Land.
- `GET /properties/boosted` - active property boost/featured/locality-top listings, ranked for buyer location.
- `GET /properties/explore-nearby?propertyId=DW-1002&radius=3000` - schools, hospitals/healthcare, cafes/restaurants around a property using OpenStreetMap Overpass.
- `GET /properties/new-listings` - newest Live + Verified listings with `listedAgo`.
- `GET /locations/popular` - popular city/locality groups; buyer city is prioritized.
- `GET /agents/nearby` - approved + verified agents; locality-top, featured and boost agents rank before normal agents.

## Promotion ranking
Property ranking reads `NewProperty.promotions.boost`, `promotions.featured`, and `promotions.localityTop` and respects `expiresAt`.

Partner ranking reads `Partner.promotions.*`. For older partner documents it also checks successful `CreditTransaction` records where `type=PROMOTION_DEBIT`, `direction=DEBIT`, and productCode is one of PARTNER_BOOST, PARTNER_FEATURED, PARTNER_LOCALITY_TOP. Duration comes from GLOBAL_CREDIT_SETTING.

A wallet `PURCHASE` transaction alone does not mean an entity is promoted. It only means credits were bought. A service-specific successful debit/active promotion is required.

## Frontend location permission after login
```js
export const getHomeLocation = (fallbackLocation) =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ source: "saved", ...fallbackLocation });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        source: "current",
        lat: coords.latitude,
        lng: coords.longitude,
      }),
      () => resolve({ source: "saved", ...fallbackLocation }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  });
```

Use the returned `lat/lng` as query parameters for the V1 home APIs. Browser geolocation must be triggered by the frontend; the backend cannot display the browser permission popup.
