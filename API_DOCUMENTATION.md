# 📡 Instant Mechanic AI — REST API Documentation

This document provides full request and response specifications for all 5 required API endpoints (plus auxiliary conversation endpoints).

---

## 1. `POST /api/chat/`
Send user prompt or attached media for diagnostic processing. The system passes query through the **Zero-AI Rule Engine** first to eliminate redundant AI calls, falling back to **Gemini Multimodal AI / Local Heuristics**.

### Request Headers
`Content-Type: application/json`

### Request Body
```json
{
  "conversation_id": "79234640-afb1-4b16-8c3d-fdf363fd28fc", // Optional (creates new session if omitted)
  "text": "My car squeaks when applying brakes",
  "media_id": null // Optional UUID from /api/upload/
}
```

### Response (200 OK)
```json
{
  "conversation_id": "79234640-afb1-4b16-8c3d-fdf363fd28fc",
  "user_message": {
    "id": "a1b2c3d4-...",
    "conversation": "79234640-...",
    "sender": "user",
    "text": "My car squeaks when applying brakes",
    "media": null,
    "created_at": "2026-09-24T14:30:00Z"
  },
  "assistant_message": {
    "id": "e5f6g7h8-...",
    "conversation": "79234640-...",
    "sender": "assistant",
    "text": "🛑 **Diagnostic Step: Braking System**\n\nBrake noises are critical safety indicators...",
    "media": null,
    "created_at": "2026-09-24T14:30:02Z"
  },
  "source": "rule_engine", // "rule_engine" | "gemini_ai" | "local_fallback"
  "diagnosis": {
    "id": "diag-1234-...",
    "summary": "Brake Friction Material Wear & Rotor Scoring",
    "severity": "High",
    "probable_causes": ["Worn ceramic brake pads (<3mm)", "Scored/Warped brake rotors"],
    "recommended_fixes": ["Replace front brake pads", "Resurface or replace brake disc rotors"],
    "estimated_cost": "$180 - $450"
  }
}
```

---

## 2. `POST /api/upload/`
Upload Image, Audio, or Video media for vehicle diagnostic inspection.

### Request Headers
`Content-Type: multipart/form-data`

### Form Data Parameters
- `file`: Media File Binary (Image / Audio / Video)
- `media_type`: `"image"` | `"audio"` | `"video"` (Optional, auto-detected from content-type)

### Response (201 Created)
```json
{
  "id": "e9876543-210f-4b16-8c3d-fdf363fd28fc",
  "file": "/media/mechanic_uploads/engine_acoustic_172718890.webm",
  "file_url": "http://localhost:8000/media/mechanic_uploads/engine_acoustic_172718890.webm",
  "media_type": "audio",
  "created_at": "2026-09-24T14:31:00Z"
}
```

---

## 3. `POST /api/diagnosis/`
Synthesize conversation history into a formal structured Diagnosis Report Card.

### Request Body
```json
{
  "conversation_id": "79234640-afb1-4b16-8c3d-fdf363fd28fc"
}
```

### Response (200 OK)
```json
{
  "id": "diag-1234-5678",
  "conversation": "79234640-afb1-4b16-8c3d-fdf363fd28fc",
  "summary": "Brake Friction Material Wear & Rotor Scoring",
  "severity": "High",
  "probable_causes": [
    "Worn Ceramic/Semi-Metallic Brake Pads (<3mm)",
    "Scored/Warped Brake Rotors",
    "Sticking Brake Caliper Slider Pins"
  ],
  "recommended_fixes": [
    "Replace Front/Rear Brake Pads",
    "Resurface or Replace Brake Disc Rotors",
    "Flush & Bleed Brake Fluid Hydraulic System"
  ],
  "estimated_cost": "$180 - $450",
  "created_at": "2026-09-24T14:32:00Z"
}
```

---

## 4. `POST /api/booking/`
Schedule doorstep mechanic visit, workshop drop-off, or emergency towing.

### Request Body
```json
{
  "diagnosis": "diag-1234-5678", // Optional
  "customer_name": "Vishal Maurya",
  "customer_phone": "+91 98765 43210",
  "car_details": "2020 Honda City i-VTEC",
  "service_type": "doorstep", // "doorstep" | "workshop" | "towing"
  "location_address": "Flat 402, Sector 62, Noida, UP",
  "preferred_date": "Tomorrow at 10:00 AM",
  "notes": "Please check front brake discs."
}
```

### Response (201 Created)
```json
{
  "id": "b7890123-4567-89ab-cdef-0123456789ab",
  "diagnosis": "diag-1234-5678",
  "customer_name": "Vishal Maurya",
  "customer_phone": "+91 98765 43210",
  "car_details": "2020 Honda City i-VTEC",
  "service_type": "doorstep",
  "location_address": "Flat 402, Sector 62, Noida, UP",
  "preferred_date": "Tomorrow at 10:00 AM",
  "notes": "Please check front brake discs.",
  "status": "Confirmed",
  "created_at": "2026-09-24T14:33:00Z"
}
```

---

## 5. `GET /api/booking/{id}/`
Retrieve status timeline & booking details.

### Response (200 OK)
```json
{
  "id": "b7890123-4567-89ab-cdef-0123456789ab",
  "customer_name": "Vishal Maurya",
  "customer_phone": "+91 98765 43210",
  "car_details": "2020 Honda City i-VTEC",
  "service_type": "doorstep",
  "location_address": "Flat 402, Sector 62, Noida, UP",
  "preferred_date": "Tomorrow at 10:00 AM",
  "notes": "Please check front brake discs.",
  "status": "Confirmed", // "Confirmed" | "Assigned" | "In Progress" | "Completed"
  "created_at": "2026-09-24T14:33:00Z"
}
```
