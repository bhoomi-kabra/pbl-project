# 🏛️ Nashik Roads & Civic Monitor
> **Nashik Civic Grievance & Accountability Platform**  
> *"See it. Report it. Track it. Resolve it."*

---

## 🚀 Executive Summary
**Nashik Roads & Civic Monitor** is a modern, production-ready, GIS-powered municipal accountability platform designed for the **Nashik Municipal Corporation (NMC)** across all 6 administrative wards (*Panchavati, Nashik East, Nashik West, Cidco, Satpur, and Nashik Road*).

The platform bridges the gap between citizens, contractors, and municipal ward engineers by enforcing contractor accountability through **Defect Liability Period (DLP) tracking**, **AI-assisted hazard intent classification**, **bilingual accessibility**, and a citizen-driven **"Closed != Resolved" audit verification engine**.

---

## ✨ Key Features

- 🗺️ **Interactive GIS Infrastructure Map**: Leaflet.js map layer centered on Nashik (`19.9975, 73.7898`) with color-coded project lifecycle states (🔴 *Trenching*, 🟡 *Concreting*, 🔵 *Water Curing*, 🟢 *Completed & Verified*), contractor DLP dates, and geotagged progress evidence.
- 🤖 **AI-Assisted Smart Complaint Chatbot**: Conversational AI hazard classification widget with automated intent detection (e.g. `ELECTRICAL_HAZARD (98% Confidence)`) and deep-linking to auto-filled complaint forms.
- 🔍 **"Closed != Resolved" Citizen Verification Tracker**: Hold contractors accountable! 5-step resolution timeline requiring citizens to verify side-by-side **"Before Repair" vs. "After Repair"** geotagged evidence before official ticket closure.
- ⚡ **Real-Time WebSockets & Database Sync**: Powered by **Supabase Cloud PostgreSQL** and Socket.io for instant live complaint streaming.
- 🌐 **Full Bilingual i18n Engine**: Instant 1-click toggle between **English** and **मराठी**.
- ☀️/🌙 **Dual Theme Engine**: Crisp municipal Light Mode and dark glassmorphic Dark Mode with adaptive tile layers.
- 🛡️ **Civic Safety Rules & 24x7 Helplines**: Tabbed guidelines for traffic safety, waste segregation norms (₹5,000 drain dumping penalty), and emergency numbers (MSEDCL 1912, NMC 7030300300, Fire 101, Disaster Cell).

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, TypeScript 5 |
| **Styling** | Tailwind CSS 3.4, PostCSS, Lucide Icons |
| **GIS & Mapping** | Leaflet.js 1.9, CartoDB Voyager / OpenStreetMap Tiles, Overpass API |
| **Backend & Database** | Node.js Express, Supabase Cloud PostgreSQL, PostGIS, Socket.io WebSockets |
| **Simulation** | Python Event Streamer Script (`seed_live_data.py`) |

---

## 🚦 Quick Start Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/bhoomi-kabra/pbl-project.git
cd pbl-project
npm install
```

### 2. Configure Supabase Cloud PostgreSQL
Create your database tables on Supabase using `server/schema.sql`, then add your password to `server/.env`:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.qgxstuoaygrdpcnotswz.supabase.co:5432/postgres
PORT=5000
```

### 3. Start Backend API Server
```bash
node server/index.js
```

### 4. Run Frontend Development Server
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser.
