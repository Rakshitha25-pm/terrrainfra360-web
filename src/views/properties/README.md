# Properties module — Flutter → React port

This module replicates the `lib/screens/properties/` section of the `tf360`
Flutter app. Both clients read and write the same Firestore collections so
listings, shortlists, and notifications stay in sync.

## Setup

1. `npm install` — pulls in the new `firebase` dependency.
2. Copy `.env.example` to `.env.local` and fill in the `VITE_FIREBASE_*`
   variables from the same Firebase project the Flutter app uses.
3. `npm run dev`.

When `VITE_FIREBASE_*` keys are missing the browse screen shows a
"Firebase is not configured" error state and all Firestore calls are no-ops.

## Layout

```
src/views/properties/
├── PropertiesPage.tsx           ← main browse + orchestrator (default export)
├── propertyTheme.ts             ← PropTheme tokens + formatINR()
├── types.ts                     ← PropertyModel, enums, PropertyFilters
├── README.md
├── services/
│   ├── propertyService.ts       ← stream + uploads + edit + soft-delete
│   ├── shortlistService.ts      ← /users/{uid}/shortlist
│   ├── searchAlertService.ts    ← /users/{uid}/searchAlerts
│   └── aiPropertyService.ts     ← description generator (demo mode by default)
├── components/
│   ├── PropertyHeader.tsx       ← sticky logo/search/categories/actions
│   ├── PropertyCard.tsx         ← grid + list cards
│   ├── PropertyDetailPage.tsx   ← full detail page
│   ├── FeaturedCarousel.tsx     ← auto-scrolling square cards
│   ├── FilterSheet.tsx          ← category-aware filter bottom sheet
│   ├── VoiceSearchSheet.tsx     ← Web Speech API mic sheet
│   ├── SuggestionsOverlay.tsx   ← floating search suggestions
│   └── States.tsx               ← skeleton / empty / error
├── postProperty/
│   ├── PostPropertyFlow.tsx     ← 8-step wizard + submission modal
│   └── AiDescriptionField.tsx   ← textarea + "AI write for me"
├── myListings/
│   └── MyListingsPage.tsx       ← owner view + edit + soft delete
└── notifications/
    └── NotificationsPage.tsx    ← live /users/{uid}/notifications feed
```

`src/lib/firebase.ts` holds the singleton Firebase init.

## Firestore shape (must match Flutter)

```
properties/{id}
  postedByUserId, ownerUid, advertisementPosterName, posterRole,
  posterRoleOtherText, listingPurpose (sale|rent|lease),
  propertyCategory (land|residential|commercial), propertySubType,
  finalPrice, priceUnit (perSqFt|perAcre), currency='INR', imageUrls[],
  description, numberOfOwners, propertyType, geoLocation (GeoPoint),
  pincode, areaName, amenities[],
  approvalStatus (pending|approved|rejected|withheld|deleted),
  createdAt, updatedAt

users/{uid}/shortlist/{propertyId}     { propertyId, shortlistedAt }
users/{uid}/searchAlerts/{alertId}     { uid, query, areaKey, pincode,
                                         category, intent, maxPrice,
                                         active, createdAt, lastNotifiedAt }
users/{uid}/notifications/{notifId}    { title, body, kind?, propertyId?,
                                         createdAt, read }
```

## Known limitations vs. Flutter

- **No Google Maps pin** in step 4 of the wizard yet — only pincode + area.
  Wiring `@react-google-maps/api` would slot in beside `MapPin` in Step4.
- **No phone OTP auth.** Sign-in is required for shortlist / my listings /
  notifications. Wire `signInWithPhoneNumber` from `firebase/auth` to match
  the Flutter OTP flow.
- **`aiPropertyService` is in demo mode.** Flip `_demoMode = false` once the
  production endpoint is reachable.
- **No image compression** before upload — the Flutter side also doesn't,
  so behaviour is identical; consider `browser-image-compression` later.
- **Notification badge counts** all docs; mark-read uses optimistic UI.
- The browse stream pulls every approved property (same as Flutter). Add
  Firestore-side pagination + `orderBy('createdAt','desc').limit(N)` when
  the collection grows beyond a few hundred listings.
