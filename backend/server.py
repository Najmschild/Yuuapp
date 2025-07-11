from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Cycle Tracking Models
class Cycle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    startDate: str
    endDate: Optional[str] = None
    flow: str = "medium"  # light, medium, heavy
    length: int = 28
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class CycleCreate(BaseModel):
    startDate: str
    endDate: Optional[str] = None
    flow: str = "medium"
    length: Optional[int] = 28

class CycleUpdate(BaseModel):
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    flow: Optional[str] = None
    length: Optional[int] = None

# Symptom Tracking Models
class Symptom(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    symptoms: List[str] = []
    intensity: str = "mild"  # mild, moderate, severe
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class SymptomCreate(BaseModel):
    date: str
    symptoms: List[str] = []
    intensity: str = "mild"

# Notes Models
class Note(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    content: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class NoteCreate(BaseModel):
    date: str
    content: str

# User Preferences Models
class UserPreferences(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    theme: str = "neutral"
    language: str = "en"
    notifications: dict = {
        "periodReminders": True,
        "ovulationReminders": True,
        "fertileWindow": False,
        "dailyCheck": False
    }
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class UserPreferencesUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    notifications: Optional[dict] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# === CYCLE ENDPOINTS ===
@api_router.post("/cycles", response_model=Cycle)
async def create_cycle(cycle_data: CycleCreate):
    try:
        cycle_dict = cycle_data.dict()
        cycle_obj = Cycle(**cycle_dict)
        result = await db.cycles.insert_one(cycle_obj.dict())
        logger.info(f"Created cycle with ID: {cycle_obj.id}")
        return cycle_obj
    except Exception as e:
        logger.error(f"Error creating cycle: {e}")
        raise HTTPException(status_code=500, detail="Failed to create cycle")

@api_router.get("/cycles", response_model=List[Cycle])
async def get_cycles():
    try:
        cycles = await db.cycles.find().sort("createdAt", -1).to_list(1000)
        return [Cycle(**cycle) for cycle in cycles]
    except Exception as e:
        logger.error(f"Error fetching cycles: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch cycles")

@api_router.get("/cycles/{cycle_id}", response_model=Cycle)
async def get_cycle(cycle_id: str):
    try:
        cycle = await db.cycles.find_one({"id": cycle_id})
        if not cycle:
            raise HTTPException(status_code=404, detail="Cycle not found")
        return Cycle(**cycle)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching cycle: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch cycle")

@api_router.put("/cycles/{cycle_id}", response_model=Cycle)
async def update_cycle(cycle_id: str, cycle_data: CycleUpdate):
    try:
        update_data = {k: v for k, v in cycle_data.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No data provided for update")
        
        result = await db.cycles.update_one(
            {"id": cycle_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Cycle not found")
        
        updated_cycle = await db.cycles.find_one({"id": cycle_id})
        return Cycle(**updated_cycle)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating cycle: {e}")
        raise HTTPException(status_code=500, detail="Failed to update cycle")

@api_router.delete("/cycles/{cycle_id}")
async def delete_cycle(cycle_id: str):
    try:
        result = await db.cycles.delete_one({"id": cycle_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Cycle not found")
        return {"message": "Cycle deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting cycle: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete cycle")

# === SYMPTOM ENDPOINTS ===
@api_router.post("/symptoms", response_model=Symptom)
async def create_symptom(symptom_data: SymptomCreate):
    try:
        symptom_dict = symptom_data.dict()
        symptom_obj = Symptom(**symptom_dict)
        result = await db.symptoms.insert_one(symptom_obj.dict())
        logger.info(f"Created symptom with ID: {symptom_obj.id}")
        return symptom_obj
    except Exception as e:
        logger.error(f"Error creating symptom: {e}")
        raise HTTPException(status_code=500, detail="Failed to create symptom")

@api_router.get("/symptoms", response_model=List[Symptom])
async def get_symptoms():
    try:
        symptoms = await db.symptoms.find().sort("createdAt", -1).to_list(1000)
        return [Symptom(**symptom) for symptom in symptoms]
    except Exception as e:
        logger.error(f"Error fetching symptoms: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch symptoms")

@api_router.get("/symptoms/{symptom_id}", response_model=Symptom)
async def get_symptom(symptom_id: str):
    try:
        symptom = await db.symptoms.find_one({"id": symptom_id})
        if not symptom:
            raise HTTPException(status_code=404, detail="Symptom not found")
        return Symptom(**symptom)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching symptom: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch symptom")

@api_router.delete("/symptoms/{symptom_id}")
async def delete_symptom(symptom_id: str):
    try:
        result = await db.symptoms.delete_one({"id": symptom_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Symptom not found")
        return {"message": "Symptom deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting symptom: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete symptom")

# === NOTES ENDPOINTS ===
@api_router.post("/notes", response_model=Note)
async def create_note(note_data: NoteCreate):
    try:
        note_dict = note_data.dict()
        note_obj = Note(**note_dict)
        result = await db.notes.insert_one(note_obj.dict())
        logger.info(f"Created note with ID: {note_obj.id}")
        return note_obj
    except Exception as e:
        logger.error(f"Error creating note: {e}")
        raise HTTPException(status_code=500, detail="Failed to create note")

@api_router.get("/notes", response_model=List[Note])
async def get_notes():
    try:
        notes = await db.notes.find().sort("createdAt", -1).to_list(1000)
        return [Note(**note) for note in notes]
    except Exception as e:
        logger.error(f"Error fetching notes: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch notes")

@api_router.get("/notes/{note_id}", response_model=Note)
async def get_note(note_id: str):
    try:
        note = await db.notes.find_one({"id": note_id})
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        return Note(**note)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching note: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch note")

@api_router.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    try:
        result = await db.notes.delete_one({"id": note_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Note not found")
        return {"message": "Note deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting note: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete note")

# === USER PREFERENCES ENDPOINTS ===
@api_router.get("/preferences", response_model=UserPreferences)
async def get_user_preferences():
    try:
        preferences = await db.preferences.find_one()
        if not preferences:
            # Create default preferences if none exist
            default_prefs = UserPreferences()
            await db.preferences.insert_one(default_prefs.dict())
            return default_prefs
        return UserPreferences(**preferences)
    except Exception as e:
        logger.error(f"Error fetching preferences: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch preferences")

@api_router.put("/preferences", response_model=UserPreferences)
async def update_user_preferences(prefs_data: UserPreferencesUpdate):
    try:
        update_data = {k: v for k, v in prefs_data.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No data provided for update")
        
        update_data["updatedAt"] = datetime.utcnow()
        
        # Check if preferences exist
        existing_prefs = await db.preferences.find_one()
        if not existing_prefs:
            # Create new preferences
            new_prefs = UserPreferences(**update_data)
            await db.preferences.insert_one(new_prefs.dict())
            return new_prefs
        else:
            # Update existing preferences
            result = await db.preferences.update_one(
                {"id": existing_prefs["id"]},
                {"$set": update_data}
            )
            updated_prefs = await db.preferences.find_one({"id": existing_prefs["id"]})
            return UserPreferences(**updated_prefs)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating preferences: {e}")
        raise HTTPException(status_code=500, detail="Failed to update preferences")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
