import pytest
import httpx
import asyncio
from typing import Dict, List
import json
import time

# Test data
MOCK_USER = {
    "email": "test@devagent.com",
    "password": "testpass123",
    "full_name": "Test User"
}

MOCK_TICKET = {
    "title": "Implement User Authentication",
    "description": "Add JWT-based authentication with refresh tokens",
    "status": "open",
    "priority": "high",
    "requirements": [
        {
            "description": "Implement JWT token generation",
            "type": "feature",
            "priority": "high"
        },
        {
            "description": "Add refresh token mechanism",
            "type": "feature",
            "priority": "medium"
        },
        {
            "description": "Implement token validation middleware",
            "type": "feature",
            "priority": "high"
        }
    ]
}

MOCK_CODE_GENERATION = {
    "prompt": "Create a JWT authentication middleware for FastAPI",
    "language": "python",
    "framework": "fastapi"
}

MOCK_TEST_GENERATION = {
    "test_type": "unit",
    "framework": "pytest",
    "coverage_threshold": 80
}

MOCK_COMMIT = {
    "message": "feat: implement JWT authentication",
    "branch": "feature/auth",
    "changes": {
        "added": ["auth/middleware.py", "auth/models.py"],
        "modified": ["main.py"],
        "deleted": []
    }
}

MOCK_PIPELINE = {
    "name": "Authentication Pipeline",
    "branch": "feature/auth",
    "stages": [
        {
            "name": "test",
            "command": "pytest tests/",
            "timeout": 300
        },
        {
            "name": "lint",
            "command": "flake8 .",
            "timeout": 60
        },
        {
            "name": "build",
            "command": "docker build -t devagent:latest .",
            "timeout": 600
        }
    ]
}

@pytest.fixture
async def client():
    async with httpx.AsyncClient(base_url="http://devagent:8000") as client:
        yield client

@pytest.fixture
async def auth_token(client):
    # Register user
    response = await client.post("/users/", json=MOCK_USER)
    assert response.status_code == 200
    
    # Login to get token
    response = await client.post("/token", data={
        "username": MOCK_USER["email"],
        "password": MOCK_USER["password"]
    })
    assert response.status_code == 200
    return response.json()["access_token"]

@pytest.mark.asyncio
async def test_full_workflow(client, auth_token):
    """Test the complete workflow from ticket creation to deployment."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # 1. Create a ticket
    response = await client.post("/tickets/", json=MOCK_TICKET, headers=headers)
    assert response.status_code == 200
    ticket_id = response.json()["id"]
    
    # 2. Generate code based on ticket requirements
    response = await client.post(
        "/code/",
        json={**MOCK_CODE_GENERATION, "ticket_id": ticket_id},
        headers=headers
    )
    assert response.status_code == 200
    code_id = response.json()["id"]
    
    # 3. Generate tests for the code
    response = await client.post(
        "/tests/",
        json={**MOCK_TEST_GENERATION, "code_id": code_id},
        headers=headers
    )
    assert response.status_code == 200
    test_id = response.json()["id"]
    
    # 4. Create a commit with the changes
    response = await client.post(
        "/version-control/commit/",
        json=MOCK_COMMIT,
        headers=headers
    )
    assert response.status_code == 200
    commit_id = response.json()["id"]
    
    # 5. Create and run a CI/CD pipeline
    response = await client.post(
        "/cicd/pipeline/",
        json={**MOCK_PIPELINE, "commit_id": commit_id},
        headers=headers
    )
    assert response.status_code == 200
    pipeline_id = response.json()["id"]
    
    # 6. Monitor pipeline status
    max_retries = 10
    for _ in range(max_retries):
        response = await client.get(f"/cicd/pipeline/{pipeline_id}", headers=headers)
        assert response.status_code == 200
        status = response.json()["status"]
        if status in ["completed", "failed"]:
            break
        await asyncio.sleep(5)
    
    assert status == "completed", f"Pipeline failed with status: {status}"
    
    # 7. Verify all resources were created
    response = await client.get(f"/tickets/{ticket_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    
    response = await client.get(f"/code/{code_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["generated_code"] is not None
    
    response = await client.get(f"/tests/{test_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["generated_tests"] is not None
    
    response = await client.get(f"/version-control/commit/{commit_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["message"] == MOCK_COMMIT["message"]
    
    response = await client.get(f"/cicd/pipeline/{pipeline_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "completed"

@pytest.mark.asyncio
async def test_error_handling(client, auth_token):
    """Test error handling and edge cases."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test invalid ticket
    invalid_ticket = {**MOCK_TICKET, "title": ""}
    response = await client.post("/tickets/", json=invalid_ticket, headers=headers)
    assert response.status_code == 422
    
    # Test invalid code generation
    invalid_code = {**MOCK_CODE_GENERATION, "language": "invalid_lang"}
    response = await client.post("/code/", json=invalid_code, headers=headers)
    assert response.status_code == 422
    
    # Test invalid test generation
    invalid_test = {**MOCK_TEST_GENERATION, "test_type": "invalid_type"}
    response = await client.post("/tests/", json=invalid_test, headers=headers)
    assert response.status_code == 422
    
    # Test invalid commit
    invalid_commit = {**MOCK_COMMIT, "message": ""}
    response = await client.post("/version-control/commit/", json=invalid_commit, headers=headers)
    assert response.status_code == 422
    
    # Test invalid pipeline
    invalid_pipeline = {**MOCK_PIPELINE, "name": ""}
    response = await client.post("/cicd/pipeline/", json=invalid_pipeline, headers=headers)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_concurrent_operations(client, auth_token):
    """Test concurrent operations to ensure system stability."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Create multiple tickets concurrently
    async def create_ticket():
        response = await client.post("/tickets/", json=MOCK_TICKET, headers=headers)
        return response.status_code == 200
    
    tasks = [create_ticket() for _ in range(5)]
    results = await asyncio.gather(*tasks)
    assert all(results)
    
    # Generate code for multiple tickets concurrently
    async def generate_code(ticket_id):
        response = await client.post(
            "/code/",
            json={**MOCK_CODE_GENERATION, "ticket_id": ticket_id},
            headers=headers
        )
        return response.status_code == 200
    
    tasks = [generate_code(i) for i in range(1, 6)]
    results = await asyncio.gather(*tasks)
    assert all(results) 