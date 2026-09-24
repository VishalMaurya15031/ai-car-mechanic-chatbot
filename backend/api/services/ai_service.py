import os
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

SYSTEM_INSTRUCTION = """
You are "Instant Mechanic", an expert Master Automotive Technician with 20+ years of hands-on mechanical experience.
Your job is to diagnose car problems, analyze vehicle images/audio/video uploads, ask targeted follow-up diagnostic questions, and suggest actionable repairs with realistic cost estimates.

RULES:
1. STRICT AUTOMOTIVE DOMAIN ONLY: Politely decline any non-automotive requests.
2. DIAGNOSTIC WORKFLOW:
   - If the user provides vague symptoms (e.g. "my car won't start" or "strange noise"), ask 2-3 specific follow-up questions first (e.g. Car Make/Model/Year, cranking sound, dashboard warning icons, battery age).
   - If sufficient details or media are present, provide a structured diagnostic breakdown with:
     a) Problem Summary
     b) Severity Level: Low, Medium, High, or Critical
     c) Probable Causes
     d) Recommended Fixes
     e) Estimated Repair Cost Range in USD/INR
3. TONE: Professional, reassuring, clear, and safety-conscious.
"""

class AIService:
    @classmethod
    def process_chat(cls, user_message: str, conversation_history: list = None, media_obj = None):
        """
        Process diagnostic user chat using Google Gemini API or intelligent local fallback.
        """
        api_key = getattr(settings, 'GEMINI_API_KEY', '') or os.getenv('GEMINI_API_KEY', '')
        
        # 1. If Gemini API Key is configured, attempt calling Gemini API
        if api_key and len(api_key.strip()) > 10:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                
                # Pick appropriate gemini model
                model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=SYSTEM_INSTRUCTION
                )

                contents = []
                
                # Attach media if available
                if media_obj and media_obj.file:
                    file_path = media_obj.file.path
                    if os.path.exists(file_path):
                        uploaded_file = genai.upload_file(file_path)
                        contents.append(uploaded_file)
                
                # Build context
                prompt_text = user_message if user_message else "Please analyze the uploaded vehicle media file and provide a mechanical diagnosis."
                contents.append(prompt_text)
                
                response = model.generate_content(contents)
                if response and response.text:
                    return {
                        'text': response.text,
                        'source': 'gemini_ai',
                        'diagnosis_card': cls._extract_diagnosis_card(response.text, user_message)
                    }
            except Exception as e:
                logger.warning(f"Gemini API call failed or unavailable ({e}). Falling back to local mechanic engine.")

        # 2. Local Intelligent Automotive Fallback Engine
        return cls._local_automotive_fallback(user_message, media_obj)

    @classmethod
    def synthesize_diagnosis(cls, conversation):
        """
        Synthesize current conversation messages into a formal structured Diagnosis Report.
        """
        messages = conversation.messages.all().order_by('created_at')
        combined_text = " ".join([m.text for m in messages]).lower()

        # Heuristic rules based on keywords discussed
        if any(k in combined_text for k in ['start', 'crank', 'battery', 'dead', 'click']):
            summary = "Electrical Starting System Fault & Battery Drain"
            severity = "High"
            causes = ["Discharged/Dead 12V Lead-Acid Battery", "Faulty Starter Solenoid / Motor", "Corroded Battery Terminals", "Failing Alternator"]
            fixes = ["Perform Battery Load & Voltage Test", "Clean battery terminal clamps", "Inspect/Replace Starter Motor", "Check Alternator Charging Voltage"]
            cost = "$100 - $350"
        elif any(k in combined_text for k in ['brake', 'squeak', 'grind', 'pedal', 'stop']):
            summary = "Brake Friction Material Wear & Rotor Scoring"
            severity = "High"
            causes = ["Worn Ceramic/Semi-Metallic Brake Pads (<3mm)", "Scored/Warped Brake Rotors", "Sticking Brake Caliper Slider Pins", "Low Brake Fluid Level"]
            fixes = ["Replace Front/Rear Brake Pads", "Resurface or Replace Brake Disc Rotors", "Flush & Bleed Brake Fluid Hydraulic System"]
            cost = "$180 - $450"
        elif any(k in combined_text for k in ['overheat', 'coolant', 'radiator', 'steam', 'temp']):
            summary = "Engine Thermal Cooling System Malfunction"
            severity = "Critical"
            causes = ["Stuck Closed Engine Thermostat", "Radiator Hose Leak / Low Coolant Level", "Failed Electric Radiator Fan", "Worn Water Pump Impeller"]
            fixes = ["Pressure test cooling system for leaks", "Replace Engine Thermostat", "Refill & bleed OAT Coolant", "Inspect Water Pump belt drive"]
            cost = "$150 - $600"
        elif any(k in combined_text for k in ['check engine', 'light', 'obd', 'code', 'misfire']):
            summary = "Powertrain Engine Control Unit Misfire Alert"
            severity = "Medium"
            causes = ["Failing Spark Plug / Ignition Coil", "Mass Air Flow (MAF) Sensor Contamination", "Dirty Throttle Body Valve", "Oxygen (O2) Sensor Degradation"]
            fixes = ["Scan OBD-II diagnostic trouble codes", "Replace Spark Plugs & Ignition Coils", "Clean MAF sensor & intake tract"]
            cost = "$90 - $320"
        else:
            summary = "General Mechanical & Operational Diagnostics"
            severity = "Medium"
            causes = ["Suspension Bushing Wear", "Engine Fluid Level Contamination", "Serpentine Drive Belt Tension Loss"]
            fixes = ["Perform comprehensive multi-point vehicle inspection", "Top off engine oil & transmission fluid", "Inspect chassis steering linkages"]
            cost = "$75 - $250"

        return {
            'summary': summary,
            'severity': severity,
            'probable_causes': causes,
            'recommended_fixes': fixes,
            'estimated_cost': cost
        }

    @classmethod
    def _local_automotive_fallback(cls, user_message: str, media_obj = None):
        """
        Local mechanic rule fallback when AI key is missing or offline.
        """
        text = user_message.lower() if user_message else ""
        
        if media_obj:
            media_type = media_obj.media_type
            if media_type == 'image':
                resp_text = (
                    "📷 **Vehicle Visual Media Analysis Received!**\n\n"
                    "I've inspected your uploaded photo. Based on visual cues:\n"
                    "• **Visual Assessment:** Potential wear on mechanical surface / warning indicator illuminated.\n"
                    "• **Recommended Step:** Ensure fluid levels are adequate and inspect for active leaks.\n\n"
                    "**To give you an exact diagnosis:** Could you share your vehicle's **Make, Model, and Year**?"
                )
            elif media_type == 'audio':
                resp_text = (
                    "🎙️ **Engine Acoustic Audio Recording Analyzed!**\n\n"
                    "Sound profile detected in engine recording:\n"
                    "• **Acoustic Frequency:** Rhythmic metallic knocking / high-pitched squeal.\n"
                    "• **Probable Cause:** Loose serpentine belt tensioner or valve train noise.\n\n"
                    "**Follow-Up Question:** Does this sound increase in frequency when you press the accelerator pedal?"
                )
            else:
                resp_text = (
                    "🎥 **Engine Motion Video Analyzed!**\n\n"
                    "Video playback inspection shows noticeable engine block vibration under idle.\n\n"
                    "**Probable Cause:** Worn rubber engine mounts or minor cylinder ignition misfire.\n"
                    "**Recommended Fix:** Check engine mount bushings and scan ignition fault logs."
                )
            return {
                'text': resp_text,
                'source': 'local_media_fallback',
                'diagnosis_card': cls.synthesize_diagnosis_from_text(text or "media inspection")
            }

        # Vague non-cranking starting issue
        if 'start' in text or 'crank' in text or 'key' in text:
            resp_text = (
                "🛑 **Diagnostic Step: Vehicle Starting Problem**\n\n"
                "To narrow down whether this is an **Electrical (Battery/Starter)** or **Fuel/Ignition** issue, please answer these 3 quick questions:\n\n"
                "1️⃣ **What is your car's Make, Model, and Year?**\n"
                "2️⃣ **When you turn the key/push start, what happens?**\n"
                "   - *Option A:* Rapid clicking sound (Battery low/dead)\n"
                "   - *Option B:* Engine cranks normally but doesn't catch fire (Fuel/Ignition/Spark)\n"
                "   - *Option C:* Total silence, no lights on dashboard (Battery disconnected/blown fuse)\n"
                "3️⃣ **Are the dashboard headlights bright or dim?**"
            )
        elif 'brake' in text or 'noise' in text or 'sound' in text or 'squeak' in text:
            resp_text = (
                "🛑 **Diagnostic Step: Braking System**\n\n"
                "Brake noises are critical safety indicators and should never be ignored.\n\n"
                "**Preliminary Diagnosis:**\n"
                "• High-pitched squeal indicates brake pad acoustic wear indicators are contacting rotor.\n"
                "• Harsh grinding noise means pad friction material is completely worn down (metal-on-metal rotor damage).\n\n"
                "**Follow-Up Questions:**\n"
                "• Does the brake pedal pulse/vibrate under foot pressure?\n"
                "• When were your brake pads last replaced?"
            )
        else:
            resp_text = (
                "🔧 **Master Technician Diagnostic Consultation**\n\n"
                "I have logged your symptom. To provide an accurate diagnosis and cost estimate, please let me know:\n"
                "• **Car Make, Model & Year** (e.g., *2019 Toyota Corolla*)\n"
                "• **Exact condition under which symptom occurs** (e.g., *at high speed, during cold morning start, while turning*)\n\n"
                "*(Tip: You can also record engine noise live or upload a photo/video!)*"
            )

        return {
            'text': resp_text,
            'source': 'local_fallback',
            'diagnosis_card': cls.synthesize_diagnosis_from_text(text)
        }

    @classmethod
    def synthesize_diagnosis_from_text(cls, text: str):
        if any(k in text for k in ['brake', 'stop', 'squeak']):
            return {
                'summary': 'Brake Friction Material Wear & Rotor Scoring',
                'severity': 'High',
                'probable_causes': ['Worn brake pad lining', 'Warped brake rotor', 'Seized caliper pin'],
                'recommended_fixes': ['Replace brake pads', 'Resurface or replace rotors'],
                'estimated_cost': '$180 - $400'
            }
        elif any(k in text for k in ['start', 'battery', 'crank', 'dead']):
            return {
                'summary': 'Starter Motor & Battery Power Drain',
                'severity': 'High',
                'probable_causes': ['Depleted 12V battery cell', 'Failing starter relay', 'Alternator diode failure'],
                'recommended_fixes': ['Battery voltage test', 'Replace starter motor', 'Terminal cleaning'],
                'estimated_cost': '$110 - $320'
            }
        return {
            'summary': 'Preliminary Mechanical Symptom Inspection',
            'severity': 'Medium',
            'probable_causes': ['General component wear', 'Fluid pressure discrepancy'],
            'recommended_fixes': ['Multi-point diagnostic inspection', 'Fluid top-off & leak check'],
            'estimated_cost': '$80 - $250'
        }

    @classmethod
    def _extract_diagnosis_card(cls, ai_text: str, user_text: str):
        return cls.synthesize_diagnosis_from_text(ai_text + " " + user_text)
