from fastapi import FastAPI

import Snippet

app = FastAPI()

@app.get("/calculate")
async def calculate():
    values = Snippet.calculate()
    return values