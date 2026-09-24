import re

class SmartRuleEngine:
    """
    Zero-AI Cost Filter Rule Engine.
    Handles routine greetings, out-of-scope non-automotive questions,
    OBD-II error codes, and emergency safety alerts directly using local regex rules
    to avoid burning unnecessary AI tokens.
    """

    GREETINGS = [
        'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 
        'good evening', 'who are you', 'what can you do', 'namaste', 'kaise ho'
    ]

    OUT_OF_SCOPE_KEYWORDS = [
        'recipe', 'cook', 'biryani', 'pizza', 'python code', 'javascript', 'react',
        'movie', 'actor', 'politics', 'election', 'president', 'modi', 'biden',
        'cricket', 'football', 'weather', 'stock market', 'crypto', 'bitcoin', 'essay'
    ]

    OBD_CODES = {
        'P0300': {
            'summary': 'Engine Random/Multiple Cylinder Misfire Detected',
            'severity': 'High',
            'causes': ['Worn spark plugs', 'Failing ignition coils', 'Low fuel pressure', 'Vacuum leak'],
            'fixes': ['Replace spark plugs & ignition coils', 'Test fuel pressure', 'Check vacuum hoses'],
            'cost': '$120 - $350'
        },
        'P0420': {
            'summary': 'Catalyst System Efficiency Below Threshold (Bank 1)',
            'severity': 'Medium',
            'causes': ['Faulty Catalytic Converter', 'O2 Sensor failure', 'Exhaust leak'],
            'fixes': ['Replace downstream O2 sensor', 'Inspect/replace catalytic converter'],
            'cost': '$250 - $1,200'
        },
        'P0171': {
            'summary': 'System Too Lean (Bank 1)',
            'severity': 'Medium',
            'causes': ['Dirty/Faulty Mass Air Flow (MAF) sensor', 'Vacuum leak', 'Clogged fuel injectors'],
            'fixes': ['Clean MAF sensor with aerosol cleaner', 'Inspect intake boot for cracks'],
            'cost': '$80 - $220'
        },
        'P0700': {
            'summary': 'Transmission Control System Malfunction',
            'severity': 'Critical',
            'causes': ['Failing Transmission Control Module (TCM)', 'Low/dirty transmission fluid', 'Solenoid fault'],
            'fixes': ['Scan TCM sub-codes', 'Check & flush transmission fluid', 'Inspect wiring harness'],
            'cost': '$300 - $1,500'
        },
        'P0455': {
            'summary': 'EVAP Emission Control System Leak Detected (Gross Leak)',
            'severity': 'Low',
            'causes': ['Loose or missing fuel cap', 'EVAP purge valve stuck open', 'Cracked EVAP canister hose'],
            'fixes': ['Tighten or replace gas cap', 'Smoke test EVAP line'],
            'cost': '$20 - $150'
        }
    }

    @classmethod
    def evaluate(cls, user_text: str):
        text_clean = user_text.strip().lower()
        if not text_clean:
            return None

        # 1. Check for Greetings
        if any(re.search(rf'\b{re.escape(g)}\b', text_clean) for g in cls.GREETINGS) and len(text_clean.split()) <= 4:
            return {
                'handled': True,
                'source': 'rule_engine',
                'type': 'greeting',
                'text': "Hello! I'm your **Instant Mechanic** virtual technician. 👨‍🔧\n\nI can help diagnose car engine noises, dashboard warning lights, starting issues, or brake problems.\n\nTo get started, please tell me: **What problem are you experiencing with your vehicle?** (e.g., *'Car won't start'*, *'Squeaking noise when braking'*, or upload a photo/audio recording!)"
            }

        # 2. Check for Out-of-Scope Queries
        if any(re.search(rf'\b{re.escape(word)}\b', text_clean) for word in cls.OUT_OF_SCOPE_KEYWORDS):
            return {
                'handled': True,
                'source': 'rule_engine',
                'type': 'out_of_scope',
                'text': "⚠️ **Notice:** I am specifically trained as an **Automotive & Car Repair Specialist**.\n\nI cannot help with general topics, recipes, coding, or non-automotive queries. Please ask me any questions regarding car troubleshooting, maintenance, dashboard lights, or mechanical diagnostics! 🚗"
            }

        # 3. Check for OBD-II Code Lookup
        obd_match = re.search(r'\b(P[0-9]{4})\b', user_text.upper())
        if obd_match:
            code = obd_match.group(1)
            if code in cls.OBD_CODES:
                info = cls.OBD_CODES[code]
                causes_list = "\n".join([f"• {c}" for c in info['causes']])
                fixes_list = "\n".join([f"• {f}" for f in info['fixes']])
                return {
                    'handled': True,
                    'source': 'rule_engine',
                    'type': 'obd_lookup',
                    'text': f"🔍 **OBD-II Fault Code Detected: {code}**\n\n**Diagnosis Summary:** {info['summary']}\n**Severity:** `{info['severity']}`\n\n**Common Causes:**\n{causes_list}\n\n**Recommended Action Plan:**\n{fixes_list}\n\n**Estimated Repair Cost:** {info['cost']}\n\n*Would you like to book a doorstep certified mechanic to inspect and clear this code?*",
                    'diagnosis_card': {
                        'summary': f"OBD-II {code}: {info['summary']}",
                        'severity': info['severity'],
                        'probable_causes': info['causes'],
                        'recommended_fixes': info['fixes'],
                        'estimated_cost': info['cost']
                    }
                }

        # 4. Critical Safety Alert Filter
        if any(term in text_clean for term in ['smoke from engine', 'fire', 'brakes completely failed', 'gasoline smell strong']):
            return {
                'handled': True,
                'source': 'rule_engine',
                'type': 'emergency',
                'text': "🚨 **CRITICAL SAFETY WARNING** 🚨\n\nFor your safety:\n1. **Pull over immediately to a safe location.**\n2. **Turn OFF the ignition engine.**\n3. Do **NOT** open the hood if heavy smoke or flames are visible.\n4. Ensure all passengers exit the vehicle safely.\n\n*If you require immediate emergency towing or roadside assistance, use the **Book Mechanic** option below immediately.*"
            }

        return None
