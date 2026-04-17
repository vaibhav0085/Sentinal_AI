import os
import sys
import unittest
from io import BytesIO

# Add current directory to path to import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app

class TestSimulationLogic(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_ransomware_sample(self):
        # Simulate uploading 'ransomware_sample.exe'
        data = {
            'file': (BytesIO(b"dummy content"), 'ransomware_sample.exe')
        }
        response = self.app.post('/scan', data=data, content_type='multipart/form-data')
        json_data = response.get_json()
        
        print(f"\nTesting ransomware_sample.exe -> Score: {json_data.get('threat_score')}")
        
        # Ransomware should have score 98 (from SIMULATED_THREATS)
        self.assertEqual(json_data['threat_score'], 98)
        self.assertTrue(json_data['is_malware'])

    def test_safe_sample(self):
        # 'safe_sample.exe' should be low score
        data = {
            'file': (BytesIO(b"dummy content"), 'safe_sample.exe')
        }
        response = self.app.post('/scan', data=data, content_type='multipart/form-data')
        json_data = response.get_json()
        
        print(f"Testing safe_sample.exe -> Score: {json_data.get('threat_score')}")
        
        self.assertEqual(json_data['threat_score'], 10)

    def test_variations(self):
        # Test various filenames that should trigger 'trojan'
        filenames = ['trojan_test.exe', 'my_trojan_sample.dll', 'test_trojan.exe']
        for fname in filenames:
            data = {'file': (BytesIO(b"dummy"), fname)}
            response = self.app.post('/scan', data=data, content_type='multipart/form-data')
            json_data = response.get_json()
            print(f"Testing {fname} -> Score: {json_data.get('threat_score')}")
            self.assertEqual(json_data['threat_score'], 92, f"Failed for {fname}")

    def test_partial_match_priority(self):
        # 'malware_simulator.exe' should match 'malware_simulator' (score 95), not just 'malware' (if it existed)
        # We don't have 'malware' key, but let's test a known one.
        # 'ransomware.exe' -> 98.
        pass


if __name__ == '__main__':
    unittest.main()
