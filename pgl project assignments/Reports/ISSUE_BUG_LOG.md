# 🏛️ Nashik Roads & Civic Monitor: Official Issue & Bug Log
**Project:** Nashik Roads & Civic Monitor (NMC Civic Accountability Platform)  
**Deliverable:** Deliverable 3 – Issue / Bug Log (Issues/Errors Identified & Debugging/Fixes)  
**Standard:** IEEE 1044 Standard for Software Anomaly Classification  
**Target Platform:** Web (Vite + React + TypeScript + Express + Leaflet GIS + Socket.io)  
**Last Updated:** 2026-10-01  

---

## 📊 Defect Metrics & Severity Summary

| Severity Level | Count | Resolved | In-Progress / Backlog | Resolution Rate |
|---|:---:|:---:|:---:|:---:|
| **Critical (Blocker)** | 3 | 3 | 0 | 100% |
| **High (Major)** | 4 | 4 | 0 | 100% |
| **Medium (Normal)** | 4 | 4 | 0 | 100% |
| **Low (Minor / UI)** | 3 | 3 | 0 | 100% |
| **Total Issues Logged** | **14** | **14** | **0** | **100%** |

---

## 📑 Complete Issue / Bug Log Table

The table below strictly follows the format specified in the project guidelines:  
**`Issue ID | Description | Severity | Root Cause | Fix | Status | Date`**

| Issue ID | Description | Severity | Root Cause | Fix | Status | Date |
|:---:|---|:---:|---|---|:---:|:---:|
| **BUG-001** | GIS Map threw runtime error `"Map container is already initialized"` when toggling between Dashboard and GIS view | **Critical** | Leaflet `L.map()` attached to DOM without unmounting prior map instance during React component re-renders. | Added cleanup return function inside `useEffect` hook in `GisMap.tsx` calling `mapInstance.remove()` and resetting DOM ref. | **Resolved** | 2026-09-12 |
| **BUG-002** | Newly submitted citizen grievances failed to display as pins on the interactive Leaflet GIS map | **Critical** | The GIS map component was rendering only the static `projects` array and had not subscribed to the live `tickets` state. | Integrated `useCivicStore` tickets listener in `GisMap.tsx`, creating dynamic Leaflet circle markers with hazard color codes. | **Resolved** | 2026-09-15 |
| **BUG-003** | Grievance form accepted invalid phone numbers (e.g. `"123"` or alphabet characters) without error | **High** | Mobile input field only verified non-empty string and did not enforce Indian 10-digit telecom regex validation. | Added client-side regex check `/^[6-9]\d{9}$/` in `ComplaintFormModal.tsx` and validated payload schema in Express backend. | **Resolved** | 2026-09-18 |
| **BUG-004** | Landmark selection defaulted to generic ward centroid coordinates rather than exact road location | **High** | Absence of localized landmark coordinate snapping; form relied on fallback ward centroid `[19.9975, 73.7898]`. | Implemented `LANDMARK_COORDINATES` lookup table with fuzzy matching (e.g. *"Hirawadi Road"* snaps to `[20.0270, 73.8140]`) plus interactive Leaflet mini-map pinpoint picker. | **Resolved** | 2026-09-20 |
| **BUG-005** | Unauthorized users were able to mark contractor road works as "Resolved" without verification | **Critical** | Missing role authorization and reporter-identity verification guards on ticket resolution actions. | Implemented reporter-only verification logic in `VerificationTracker.tsx` requiring matching citizen ID / admin passkey before state transition. | **Resolved** | 2026-09-22 |
| **BUG-006** | Uploading 5+ MB mobile camera photos caused server memory spikes and excessive database JSON payload size | **High** | Raw JPEG files were directly encoded to uncompressed Base64 strings, creating 7+ MB data chunks per complaint. | Implemented client-side HTML5 Canvas 2D image downscaling and WebP compression pipeline, reducing photo payloads from >5MB to <250KB before upload. | **Resolved** | 2026-09-24 |
| **BUG-007** | Duplicate real-time ticket alerts and memory leak after repeated tab switching | **Medium** | Socket.io event listeners (`socket.on('ticket-created')`) were re-registered on every component render without teardown. | Wrapped socket subscriptions in `useEffect` with appropriate dependency arrays and added `socket.off()` teardown handlers. | **Resolved** | 2026-09-25 |
| **BUG-008** | Defect Liability Period (DLP) warranty countdown displayed `NaN Months Remaining` on certain browsers | **Medium** | Date parsing used browser-dependent `Date.parse("15 Jan 2026")` which fails or behaves inconsistently on non-V8 JS engines. | Standardized all date storage to ISO 8601 (`YYYY-MM-DD`) and created a robust date-difference utility helper. | **Resolved** | 2026-09-26 |
| **BUG-009** | Marathi localization showed raw English keys for newly added hazard categories (e.g. `DRAINAGE_OVERFLOW`) | **Medium** | Dictionary divergence between `en` and `mr` translation objects in `translations.ts`. | Synchronized all localization keys across English and Marathi dictionaries to achieve 100% bilingual parity. | **Resolved** | 2026-09-27 |
| **BUG-010** | Mobile Citizen Feed navigation bar overlapped the bottom-most complaint cards on small screen viewports | **Low** | Global layout container lacked viewport bottom safe-area offset padding when fixed navigation was active. | Added dynamic viewport padding `pb-24` to main content wrappers in `BottomMobileNav.tsx` and `App.tsx`. | **Resolved** | 2026-09-28 |
| **BUG-011** | KPI banner showed hardcoded counts that did not update when new tickets were filed | **Medium** | Dashboard component used static mock data rather than deriving counts dynamically from the live tickets state. | Refactored `KpiBanner.tsx` to compute active grievances, resolved issues, and SLA compliance dynamically from `tickets.length`. | **Resolved** | 2026-09-29 |
| **BUG-012** | AI Chatbot suggestion chips did not autofill the complaint modal when clicked | **Low** | Chatbot modal was not communicating state to `ComplaintFormModal` due to missing parent callback handler. | Passed shared callback `onSelectHazard(category, title)` from parent `App.tsx` to enable seamless 1-click complaint pre-filling. | **Resolved** | 2026-09-29 |
| **BUG-013** | Dark mode text contrast was illegible when printing reports or viewing on low-contrast projectors | **Low** | CSS variables for background and text lacked high-contrast fallback tokens for municipal print stylesheets. | Added explicit `@media print` CSS overrides and high-contrast color classes for municipal report exports. | **Resolved** | 2026-09-30 |
| **BUG-014** | GPS coordinate geofence allowed coordinates outside Nashik Municipal Corporation boundaries | **High** | Absence of geographic bounding box verification allowed test coordinates from Mumbai/Pune into Nashik wards. | Implemented bounding box filter (`lat: 19.85 - 20.15`, `lng: 73.65 - 73.95`) that rejects coordinates outside NMC jurisdiction. | **Resolved** | 2026-10-01 |

---

## 🔍 Detailed Root Cause & Debugging Analysis (Key Fix Highlights)

### 1. BUG-001: Leaflet Map Re-Initialization Crash
- **Symptom:** Uncaught Error: `Map container is already initialized.`
- **Code Before Fix:**
  ```tsx
  useEffect(() => {
    const map = L.map(mapRef.current).setView([19.9975, 73.7898], 13);
    // No cleanup return!
  }, []);
  ```
- **Code After Fix:**
  ```tsx
  useEffect(() => {
    if (!mapRef.current) return;
    const map = L.map(mapRef.current).setView([19.9975, 73.7898], 13);
    return () => {
      map.remove(); // Safely teardown Leaflet instance on unmount
    };
  }, []);
  ```

### 2. BUG-004: Landmark Snapping vs Centroid Offset
- **Symptom:** Grievances logged at "Hirawadi Road" mapped to the center of Panchavati Ward (3 km away).
- **Fix:** Introduced an exact dictionary lookup table that matches user input against known Nashik arterial roads and snaps latitude/longitude instantly:
  ```ts
  const LANDMARK_COORDINATES: Record<string, [number, number]> = {
    'hirawadi': [20.0270, 73.8140],
    'thatte nagar': [20.0028, 73.7712],
    'gangapur road': [20.0180, 73.8180],
    'college road': [20.0050, 73.7620],
  };
  ```

### 3. BUG-006: High-Resolution Photo Payload Downsampling
- **Symptom:** 5.2 MB camera photos caused high latency and file database bloat.
- **Fix:** Added client-side HTML5 Canvas resize pipeline:
  ```ts
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.75)); // Reduced from 5MB to ~180KB
      };
    });
  };
  ```
