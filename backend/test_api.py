import os
import sys
import django

# Setup Django test environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mechanic_backend.settings')
django.setup()

# Ensure stdout encodes safely on Windows
sys.stdout.reconfigure(encoding='utf-8')

from rest_framework.test import APIClient
from api.models import Conversation, MechanicBooking

def run_tests():
    print("=" * 60)
    print("🚀 RUNNING AUTOMATED API TEST SUITE - INSTANT MECHANIC")
    print("=" * 60)

    client = APIClient()

    # 1. Health Check
    res1 = client.get('/api/health/')
    assert res1.status_code == 200, f"Health check failed: {res1.status_code}"
    print("Testing 1: Health Check GET /api/health/")
    print(f"  -> Passed! {res1.json()}\n")

    # 2. Greeting via Rule Engine (Zero AI call)
    res2 = client.post('/api/chat/', {'text': 'Hello mechanic'}, format='json')
    assert res2.status_code == 200
    assert res2.json()['source'] == 'rule_engine'
    conv_id = res2.json()['conversation_id']
    print("Testing 2: Greeting (Rule Engine - zero AI cost) POST /api/chat/")
    print(f"  -> Passed! Rule engine handled greeting: {res2.json()['assistant_message']['text'][:60]}...\n")

    # 3. Out-of-Scope Query via Rule Engine (Zero AI call)
    res3 = client.post('/api/chat/', {'conversation_id': conv_id, 'text': 'How do I bake a pizza?'}, format='json')
    assert res3.status_code == 200
    assert res3.json()['source'] == 'rule_engine'
    print("Testing 3: Out-of-scope question (Rule Engine polite rejection) POST /api/chat/")
    print(f"  -> Passed! Polite rejection working: {res3.json()['assistant_message']['text'][:60]}...\n")

    # 4. Automotive Troubleshooting Query
    res4 = client.post('/api/chat/', {'conversation_id': conv_id, 'text': 'My car has loud squeaking noises when I press the brake pedal'}, format='json')
    assert res4.status_code == 200
    print("Testing 4: Automotive Troubleshooting Query POST /api/chat/")
    print(f"  -> Passed! Mechanic response: {res4.json()['assistant_message']['text'][:60]}...\n")

    # 5. Generate Formal Diagnosis Report
    res5 = client.post('/api/diagnosis/', {'conversation_id': conv_id}, format='json')
    assert res5.status_code == 200
    diag_id = res5.json()['id']
    print("Testing 5: Generate Diagnosis POST /api/diagnosis/")
    print(f"  -> Passed! Diagnosis generated: {res5.json()['summary']} Severity: {res5.json()['severity']}\n")

    # 6. Book Mechanic
    booking_data = {
        'diagnosis': diag_id,
        'customer_name': 'Vishal Maurya',
        'customer_phone': '+91 98765 43210',
        'car_details': '2020 Honda City i-VTEC',
        'service_type': 'doorstep',
        'location_address': 'Flat 402, Sector 62, Noida, UP',
        'preferred_date': 'Tomorrow at 10:00 AM',
        'notes': 'Please check front brake discs and pads.'
    }
    res6 = client.post('/api/booking/', booking_data, format='json')
    assert res6.status_code == 201
    booking_id = res6.json()['id']
    print("Testing 6: Mechanic Booking POST /api/booking/")
    print(f"  -> Passed! Booking Created: {booking_id}\n")

    # 7. Get Booking Details & Live Status
    res7 = client.get(f'/api/booking/{booking_id}/')
    assert res7.status_code == 200
    print(f"Testing 7: Retrieve Booking Details GET /api/booking/{booking_id}/")
    print(f"  -> Passed! Booking retrieved status: {res7.json()['status']} Customer: {res7.json()['customer_name']}\n")

    print("=" * 60)
    print("🎉 ALL BACKEND API TESTS PASSED 100% PERFECTLY!")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
