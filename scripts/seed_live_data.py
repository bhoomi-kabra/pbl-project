"""
Nashik Roads & Civic Monitor - Live Event Simulator Script
Run this script during jury presentation to simulate real-time citizen reports being pushed to the platform via API/WebSockets.
"""

import time
import random
import requests

NASHIK_COORDINATES = [
    {"ward": "Panchavati", "lat": 20.0080, "lng": 73.7925, "location": "Ramkund Approach Road, Panchavati"},
    {"ward": "Nashik West", "lat": 20.0035, "lng": 73.7668, "location": "College Road, Near Krishi Nagar"},
    {"ward": "Nashik East", "lat": 19.9970, "lng": 73.7780, "location": "Sharanpur Road, Canada Corner"},
    {"ward": "Cidco", "lat": 19.9720, "lng": 73.7650, "location": "Trimurti Chowk Bus Stand Avenue"},
    {"ward": "Satpur", "lat": 19.9980, "lng": 73.7380, "location": "ABB Circle to Garware Industrial Road"},
    {"ward": "Nashik Road", "lat": 19.9650, "lng": 73.8180, "location": "Bitco Chowk Flyover Junction"}
]

HAZARD_CATEGORIES = [
    {"type": "POTHOLE", "title": "Deep Pothole Cave-in", "title_mr": "मोठा रस्ते खड्डा"},
    {"type": "ELECTRICAL_HAZARD", "title": "Sparking Cable on Pole", "title_mr": "विजेच्या खांबावर ठिणग्या"},
    {"type": "WATER_LEAKAGE", "title": "Main Pipeline Leakage", "title_mr": "मुख्य पाणी पाईपलाईन गळती"},
    {"type": "UNAUTHORIZED_EXCAVATION", "title": "Illegal Road Trenching", "title_mr": "बेकायदेशीर रस्ता खणणे"}
]

API_ENDPOINT = "http://localhost:5173/api/complaints"

def generate_random_report():
    coord = random.choice(NASHIK_COORDINATES)
    hazard = random.choice(HAZARD_CATEGORIES)
    
    # Add minor GPS jitter
    lat = coord["lat"] + random.uniform(-0.003, 0.003)
    lng = coord["lng"] + random.uniform(-0.003, 0.003)
    ticket_num = f"NMC-2026-{random.randint(1000, 9999)}"

    payload = {
        "ticketNumber": ticket_num,
        "title": hazard["title"],
        "titleMr": hazard["title_mr"],
        "hazardType": hazard["type"],
        "ward": coord["ward"],
        "location": coord["location"],
        "coordinates": [round(lat, 5), round(lng, 5)],
        "status": "Submitted",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    return payload

def main():
    print("=" * 60)
    print("⚡ NASHIK CIVIC MONITOR - DEMO LIVE DATA STREAMER ACTIVE")
    print("Simulating real-time citizen grievance events every 15-30 seconds...")
    print("=" * 60)

    count = 0
    while True:
        report = generate_random_report()
        count += 1
        print(f"\n[EVENT #{count}] Live Report Dispatched:")
        print(f"  Ticket: {report['ticketNumber']}")
        print(f"  Hazard: {report['hazardType']} ({report['title']})")
        print(f"  Ward:   {report['ward']} @ {report['location']}")
        print(f"  GPS:    {report['coordinates']}")

        try:
            # Post to local endpoint if backend server is attached
            response = requests.post(API_ENDPOINT, json=report, timeout=3)
            print(f"  Status: Dispatched to NMC Grid (HTTP {response.status_code})")
        except Exception as e:
            print(f"  [Simulated Broadcast] Local event generated successfully.")

        interval = random.randint(15, 30)
        print(f"Waiting {interval} seconds for next live event...")
        time.sleep(interval)

if __name__ == "__main__":
    main()
