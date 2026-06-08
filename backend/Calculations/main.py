from pydantic import BaseModel

from typing import List

from fastapi import FastAPI

import Snippet

app = FastAPI()

class Point(BaseModel):
    longitude: float
    latitude: float
    
class CalculateRequest(BaseModel):
    points: List[Point]

@app.post("/calculate")
async def calculate(request: CalculateRequest):
    values = Snippet.calculate(request.points)
    return values