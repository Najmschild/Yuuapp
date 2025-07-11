#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Menstrual Cycle Tracking App
Tests all CRUD operations for cycles, symptoms, notes, and user preferences
"""

import requests
import json
import sys
from datetime import datetime, timedelta
import uuid

# Backend URL from frontend/.env
BACKEND_URL = "https://5d71cbda-6157-445b-a063-6a3a338db727.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = {
            "cycles": {"passed": 0, "failed": 0, "errors": []},
            "symptoms": {"passed": 0, "failed": 0, "errors": []},
            "notes": {"passed": 0, "failed": 0, "errors": []},
            "preferences": {"passed": 0, "failed": 0, "errors": []},
            "models": {"passed": 0, "failed": 0, "errors": []}
        }
        self.created_ids = {
            "cycles": [],
            "symptoms": [],
            "notes": []
        }

    def log_result(self, category, test_name, success, error_msg=None):
        """Log test results"""
        if success:
            self.test_results[category]["passed"] += 1
            print(f"✅ {test_name}")
        else:
            self.test_results[category]["failed"] += 1
            self.test_results[category]["errors"].append(f"{test_name}: {error_msg}")
            print(f"❌ {test_name}: {error_msg}")

    def test_basic_connectivity(self):
        """Test basic API connectivity"""
        print("\n=== Testing Basic Connectivity ===")
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                self.log_result("models", "Basic API connectivity", True)
                return True
            else:
                self.log_result("models", "Basic API connectivity", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("models", "Basic API connectivity", False, str(e))
            return False

    def test_cycles_crud(self):
        """Test Cycles CRUD operations"""
        print("\n=== Testing Cycles CRUD Operations ===")
        
        # Test data
        cycle_data = {
            "startDate": "2024-12-15",
            "endDate": "2024-12-19",
            "flow": "medium",
            "length": 28
        }
        
        # Test POST /api/cycles (Create)
        try:
            response = requests.post(f"{self.base_url}/cycles", json=cycle_data, timeout=10)
            if response.status_code == 200:
                cycle_id = response.json().get("id")
                if cycle_id:
                    self.created_ids["cycles"].append(cycle_id)
                    self.log_result("cycles", "POST /api/cycles (create cycle)", True)
                else:
                    self.log_result("cycles", "POST /api/cycles (create cycle)", False, "No ID returned")
            else:
                self.log_result("cycles", "POST /api/cycles (create cycle)", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("cycles", "POST /api/cycles (create cycle)", False, str(e))

        # Test GET /api/cycles (List all)
        try:
            response = requests.get(f"{self.base_url}/cycles", timeout=10)
            if response.status_code == 200:
                cycles = response.json()
                if isinstance(cycles, list):
                    self.log_result("cycles", "GET /api/cycles (list cycles)", True)
                else:
                    self.log_result("cycles", "GET /api/cycles (list cycles)", False, "Response is not a list")
            else:
                self.log_result("cycles", "GET /api/cycles (list cycles)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("cycles", "GET /api/cycles (list cycles)", False, str(e))

        # Test GET /api/cycles/{id} (Get specific)
        if self.created_ids["cycles"]:
            cycle_id = self.created_ids["cycles"][0]
            try:
                response = requests.get(f"{self.base_url}/cycles/{cycle_id}", timeout=10)
                if response.status_code == 200:
                    cycle = response.json()
                    if cycle.get("id") == cycle_id:
                        self.log_result("cycles", "GET /api/cycles/{id} (get specific cycle)", True)
                    else:
                        self.log_result("cycles", "GET /api/cycles/{id} (get specific cycle)", False, "ID mismatch")
                else:
                    self.log_result("cycles", "GET /api/cycles/{id} (get specific cycle)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("cycles", "GET /api/cycles/{id} (get specific cycle)", False, str(e))

        # Test PUT /api/cycles/{id} (Update)
        if self.created_ids["cycles"]:
            cycle_id = self.created_ids["cycles"][0]
            update_data = {"flow": "heavy", "length": 30}
            try:
                response = requests.put(f"{self.base_url}/cycles/{cycle_id}", json=update_data, timeout=10)
                if response.status_code == 200:
                    updated_cycle = response.json()
                    if updated_cycle.get("flow") == "heavy" and updated_cycle.get("length") == 30:
                        self.log_result("cycles", "PUT /api/cycles/{id} (update cycle)", True)
                    else:
                        self.log_result("cycles", "PUT /api/cycles/{id} (update cycle)", False, "Update not reflected")
                else:
                    self.log_result("cycles", "PUT /api/cycles/{id} (update cycle)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("cycles", "PUT /api/cycles/{id} (update cycle)", False, str(e))

        # Test invalid data
        invalid_data = {"startDate": "invalid-date", "flow": "invalid-flow"}
        try:
            response = requests.post(f"{self.base_url}/cycles", json=invalid_data, timeout=10)
            if response.status_code >= 400:
                self.log_result("cycles", "POST /api/cycles (invalid data handling)", True)
            else:
                self.log_result("cycles", "POST /api/cycles (invalid data handling)", False, "Should reject invalid data")
        except Exception as e:
            self.log_result("cycles", "POST /api/cycles (invalid data handling)", False, str(e))

    def test_symptoms_crud(self):
        """Test Symptoms CRUD operations"""
        print("\n=== Testing Symptoms CRUD Operations ===")
        
        # Test data
        symptom_data = {
            "date": "2024-12-15",
            "symptoms": ["cramps", "fatigue", "headache"],
            "intensity": "moderate"
        }
        
        # Test POST /api/symptoms (Create)
        try:
            response = requests.post(f"{self.base_url}/symptoms", json=symptom_data, timeout=10)
            if response.status_code == 200:
                symptom_id = response.json().get("id")
                if symptom_id:
                    self.created_ids["symptoms"].append(symptom_id)
                    self.log_result("symptoms", "POST /api/symptoms (create symptom)", True)
                else:
                    self.log_result("symptoms", "POST /api/symptoms (create symptom)", False, "No ID returned")
            else:
                self.log_result("symptoms", "POST /api/symptoms (create symptom)", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("symptoms", "POST /api/symptoms (create symptom)", False, str(e))

        # Test GET /api/symptoms (List all)
        try:
            response = requests.get(f"{self.base_url}/symptoms", timeout=10)
            if response.status_code == 200:
                symptoms = response.json()
                if isinstance(symptoms, list):
                    self.log_result("symptoms", "GET /api/symptoms (list symptoms)", True)
                else:
                    self.log_result("symptoms", "GET /api/symptoms (list symptoms)", False, "Response is not a list")
            else:
                self.log_result("symptoms", "GET /api/symptoms (list symptoms)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("symptoms", "GET /api/symptoms (list symptoms)", False, str(e))

        # Test GET /api/symptoms/{id} (Get specific)
        if self.created_ids["symptoms"]:
            symptom_id = self.created_ids["symptoms"][0]
            try:
                response = requests.get(f"{self.base_url}/symptoms/{symptom_id}", timeout=10)
                if response.status_code == 200:
                    symptom = response.json()
                    if symptom.get("id") == symptom_id:
                        self.log_result("symptoms", "GET /api/symptoms/{id} (get specific symptom)", True)
                    else:
                        self.log_result("symptoms", "GET /api/symptoms/{id} (get specific symptom)", False, "ID mismatch")
                else:
                    self.log_result("symptoms", "GET /api/symptoms/{id} (get specific symptom)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("symptoms", "GET /api/symptoms/{id} (get specific symptom)", False, str(e))

        # Test invalid symptom data
        invalid_data = {"date": "invalid-date", "symptoms": "not-a-list"}
        try:
            response = requests.post(f"{self.base_url}/symptoms", json=invalid_data, timeout=10)
            if response.status_code >= 400:
                self.log_result("symptoms", "POST /api/symptoms (invalid data handling)", True)
            else:
                self.log_result("symptoms", "POST /api/symptoms (invalid data handling)", False, "Should reject invalid data")
        except Exception as e:
            self.log_result("symptoms", "POST /api/symptoms (invalid data handling)", False, str(e))

    def test_notes_crud(self):
        """Test Notes CRUD operations"""
        print("\n=== Testing Notes CRUD Operations ===")
        
        # Test data
        note_data = {
            "date": "2024-12-15",
            "content": "Feeling tired today, had some mild cramps in the morning"
        }
        
        # Test POST /api/notes (Create)
        try:
            response = requests.post(f"{self.base_url}/notes", json=note_data, timeout=10)
            if response.status_code == 200:
                note_id = response.json().get("id")
                if note_id:
                    self.created_ids["notes"].append(note_id)
                    self.log_result("notes", "POST /api/notes (create note)", True)
                else:
                    self.log_result("notes", "POST /api/notes (create note)", False, "No ID returned")
            else:
                self.log_result("notes", "POST /api/notes (create note)", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("notes", "POST /api/notes (create note)", False, str(e))

        # Test GET /api/notes (List all)
        try:
            response = requests.get(f"{self.base_url}/notes", timeout=10)
            if response.status_code == 200:
                notes = response.json()
                if isinstance(notes, list):
                    self.log_result("notes", "GET /api/notes (list notes)", True)
                else:
                    self.log_result("notes", "GET /api/notes (list notes)", False, "Response is not a list")
            else:
                self.log_result("notes", "GET /api/notes (list notes)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("notes", "GET /api/notes (list notes)", False, str(e))

        # Test GET /api/notes/{id} (Get specific)
        if self.created_ids["notes"]:
            note_id = self.created_ids["notes"][0]
            try:
                response = requests.get(f"{self.base_url}/notes/{note_id}", timeout=10)
                if response.status_code == 200:
                    note = response.json()
                    if note.get("id") == note_id:
                        self.log_result("notes", "GET /api/notes/{id} (get specific note)", True)
                    else:
                        self.log_result("notes", "GET /api/notes/{id} (get specific note)", False, "ID mismatch")
                else:
                    self.log_result("notes", "GET /api/notes/{id} (get specific note)", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("notes", "GET /api/notes/{id} (get specific note)", False, str(e))

        # Test missing required fields
        invalid_data = {"date": "2024-12-15"}  # Missing content
        try:
            response = requests.post(f"{self.base_url}/notes", json=invalid_data, timeout=10)
            if response.status_code >= 400:
                self.log_result("notes", "POST /api/notes (missing required fields)", True)
            else:
                self.log_result("notes", "POST /api/notes (missing required fields)", False, "Should reject missing required fields")
        except Exception as e:
            self.log_result("notes", "POST /api/notes (missing required fields)", False, str(e))

    def test_preferences_crud(self):
        """Test User Preferences operations"""
        print("\n=== Testing User Preferences Operations ===")
        
        # Test GET /api/preferences (should create default if none exist)
        try:
            response = requests.get(f"{self.base_url}/preferences", timeout=10)
            if response.status_code == 200:
                prefs = response.json()
                if "theme" in prefs and "notifications" in prefs:
                    self.log_result("preferences", "GET /api/preferences (get or create default)", True)
                else:
                    self.log_result("preferences", "GET /api/preferences (get or create default)", False, "Missing required fields")
            else:
                self.log_result("preferences", "GET /api/preferences (get or create default)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("preferences", "GET /api/preferences (get or create default)", False, str(e))

        # Test PUT /api/preferences (Update)
        update_data = {
            "theme": "earthy",
            "notifications": {
                "periodReminders": True,
                "ovulationReminders": False,
                "fertileWindow": True,
                "dailyCheck": False
            }
        }
        try:
            response = requests.put(f"{self.base_url}/preferences", json=update_data, timeout=10)
            if response.status_code == 200:
                updated_prefs = response.json()
                if updated_prefs.get("theme") == "earthy":
                    self.log_result("preferences", "PUT /api/preferences (update preferences)", True)
                else:
                    self.log_result("preferences", "PUT /api/preferences (update preferences)", False, "Update not reflected")
            else:
                self.log_result("preferences", "PUT /api/preferences (update preferences)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("preferences", "PUT /api/preferences (update preferences)", False, str(e))

        # Test partial update
        partial_update = {"theme": "neutral"}
        try:
            response = requests.put(f"{self.base_url}/preferences", json=partial_update, timeout=10)
            if response.status_code == 200:
                updated_prefs = response.json()
                if updated_prefs.get("theme") == "neutral":
                    self.log_result("preferences", "PUT /api/preferences (partial update)", True)
                else:
                    self.log_result("preferences", "PUT /api/preferences (partial update)", False, "Partial update not reflected")
            else:
                self.log_result("preferences", "PUT /api/preferences (partial update)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("preferences", "PUT /api/preferences (partial update)", False, str(e))

    def test_delete_operations(self):
        """Test DELETE operations for created resources"""
        print("\n=== Testing DELETE Operations ===")
        
        # Delete created cycles
        for cycle_id in self.created_ids["cycles"]:
            try:
                response = requests.delete(f"{self.base_url}/cycles/{cycle_id}", timeout=10)
                if response.status_code == 200:
                    self.log_result("cycles", f"DELETE /api/cycles/{cycle_id}", True)
                else:
                    self.log_result("cycles", f"DELETE /api/cycles/{cycle_id}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("cycles", f"DELETE /api/cycles/{cycle_id}", False, str(e))

        # Delete created symptoms
        for symptom_id in self.created_ids["symptoms"]:
            try:
                response = requests.delete(f"{self.base_url}/symptoms/{symptom_id}", timeout=10)
                if response.status_code == 200:
                    self.log_result("symptoms", f"DELETE /api/symptoms/{symptom_id}", True)
                else:
                    self.log_result("symptoms", f"DELETE /api/symptoms/{symptom_id}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("symptoms", f"DELETE /api/symptoms/{symptom_id}", False, str(e))

        # Delete created notes
        for note_id in self.created_ids["notes"]:
            try:
                response = requests.delete(f"{self.base_url}/notes/{note_id}", timeout=10)
                if response.status_code == 200:
                    self.log_result("notes", f"DELETE /api/notes/{note_id}", True)
                else:
                    self.log_result("notes", f"DELETE /api/notes/{note_id}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("notes", f"DELETE /api/notes/{note_id}", False, str(e))

        # Test delete non-existent resource
        fake_id = str(uuid.uuid4())
        try:
            response = requests.delete(f"{self.base_url}/cycles/{fake_id}", timeout=10)
            if response.status_code == 404:
                self.log_result("cycles", "DELETE non-existent cycle (404 handling)", True)
            else:
                self.log_result("cycles", "DELETE non-existent cycle (404 handling)", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_result("cycles", "DELETE non-existent cycle (404 handling)", False, str(e))

    def run_all_tests(self):
        """Run all backend tests"""
        print("🧪 Starting Comprehensive Backend API Testing")
        print(f"Backend URL: {self.base_url}")
        
        # Test basic connectivity first
        if not self.test_basic_connectivity():
            print("❌ Cannot connect to backend. Stopping tests.")
            return False
        
        # Run all CRUD tests
        self.test_cycles_crud()
        self.test_symptoms_crud()
        self.test_notes_crud()
        self.test_preferences_crud()
        self.test_delete_operations()
        
        # Print summary
        self.print_summary()
        return self.get_overall_success()

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        
        total_passed = 0
        total_failed = 0
        
        for category, results in self.test_results.items():
            passed = results["passed"]
            failed = results["failed"]
            total_passed += passed
            total_failed += failed
            
            status = "✅" if failed == 0 else "❌"
            print(f"{status} {category.upper()}: {passed} passed, {failed} failed")
            
            if results["errors"]:
                for error in results["errors"]:
                    print(f"   - {error}")
        
        print("-" * 60)
        print(f"TOTAL: {total_passed} passed, {total_failed} failed")
        
        if total_failed == 0:
            print("🎉 All tests passed!")
        else:
            print(f"⚠️  {total_failed} tests failed")

    def get_overall_success(self):
        """Check if all tests passed"""
        for results in self.test_results.values():
            if results["failed"] > 0:
                return False
        return True

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)