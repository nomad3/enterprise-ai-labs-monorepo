import pytest
import requests
from typing import Dict, Any

BASE_URL = "http://localhost:8000"
TEST_USER = {
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
}

def test_auth_flow():
    # Register
    register_response = requests.post(
        f"{BASE_URL}/auth/register",
        json=TEST_USER
    )
    assert register_response.status_code == 200
    token = register_response.json()["token"]

    # Login
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
    )
    assert login_response.status_code == 200
    assert "token" in login_response.json()

    # Verify token
    verify_response = requests.get(
        f"{BASE_URL}/auth/verify",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert verify_response.status_code == 200

    return token

def test_ticket_flow(token: str):
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create ticket
    ticket_data = {
        "title": "Test Ticket",
        "description": "Test Description",
        "priority": "high",
        "status": "open"
    }
    create_response = requests.post(
        f"{BASE_URL}/tickets",
        json=ticket_data,
        headers=headers
    )
    assert create_response.status_code == 200
    ticket_id = create_response.json()["id"]

    # Get ticket
    get_response = requests.get(
        f"{BASE_URL}/tickets/{ticket_id}",
        headers=headers
    )
    assert get_response.status_code == 200
    assert get_response.json()["title"] == ticket_data["title"]

    # Update ticket
    update_data = {"status": "in_progress"}
    update_response = requests.patch(
        f"{BASE_URL}/tickets/{ticket_id}",
        json=update_data,
        headers=headers
    )
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "in_progress"

    return ticket_id

def test_code_generation_flow(token: str, ticket_id: str):
    headers = {"Authorization": f"Bearer {token}"}
    
    # Generate code
    generation_data = {
        "ticket_id": ticket_id,
        "language": "python",
        "requirements": "Create a simple calculator function"
    }
    generate_response = requests.post(
        f"{BASE_URL}/code/generate",
        json=generation_data,
        headers=headers
    )
    assert generate_response.status_code == 200
    code_id = generate_response.json()["id"]

    # Get generated code
    get_response = requests.get(
        f"{BASE_URL}/code/{code_id}",
        headers=headers
    )
    assert get_response.status_code == 200
    assert "code" in get_response.json()

    return code_id

def test_test_generation_flow(token: str, code_id: str):
    headers = {"Authorization": f"Bearer {token}"}
    
    # Generate tests
    test_data = {
        "code_id": code_id,
        "test_type": "unit"
    }
    generate_response = requests.post(
        f"{BASE_URL}/tests/generate",
        json=test_data,
        headers=headers
    )
    assert generate_response.status_code == 200
    test_id = generate_response.json()["id"]

    # Run tests
    run_response = requests.post(
        f"{BASE_URL}/tests/{test_id}/run",
        headers=headers
    )
    assert run_response.status_code == 200
    assert "results" in run_response.json()

    return test_id

def test_version_control_flow(token: str):
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create branch
    branch_data = {
        "name": "test-branch",
        "base": "main"
    }
    branch_response = requests.post(
        f"{BASE_URL}/git/branches",
        json=branch_data,
        headers=headers
    )
    assert branch_response.status_code == 200
    branch_name = branch_response.json()["name"]

    # Create commit
    commit_data = {
        "message": "Test commit",
        "files": [
            {
                "path": "test.py",
                "content": "print('Hello, World!')"
            }
        ]
    }
    commit_response = requests.post(
        f"{BASE_URL}/git/commit",
        json=commit_data,
        headers=headers
    )
    assert commit_response.status_code == 200
    commit_id = commit_response.json()["id"]

    return branch_name, commit_id

def test_cicd_flow(token: str, branch_name: str):
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create pipeline
    pipeline_data = {
        "name": "test-pipeline",
        "branch": branch_name,
        "stages": [
            {
                "name": "build",
                "commands": ["npm install", "npm run build"]
            },
            {
                "name": "test",
                "commands": ["npm test"]
            }
        ]
    }
    pipeline_response = requests.post(
        f"{BASE_URL}/cicd/pipelines",
        json=pipeline_data,
        headers=headers
    )
    assert pipeline_response.status_code == 200
    pipeline_id = pipeline_response.json()["id"]

    # Run pipeline
    run_response = requests.post(
        f"{BASE_URL}/cicd/pipelines/{pipeline_id}/run",
        headers=headers
    )
    assert run_response.status_code == 200

    # Get pipeline status
    status_response = requests.get(
        f"{BASE_URL}/cicd/pipelines/{pipeline_id}",
        headers=headers
    )
    assert status_response.status_code == 200
    assert "status" in status_response.json()

    return pipeline_id

def test_full_flow():
    # Test authentication
    token = test_auth_flow()
    
    # Test ticket management
    ticket_id = test_ticket_flow(token)
    
    # Test code generation
    code_id = test_code_generation_flow(token, ticket_id)
    
    # Test test generation
    test_id = test_test_generation_flow(token, code_id)
    
    # Test version control
    branch_name, commit_id = test_version_control_flow(token)
    
    # Test CI/CD
    pipeline_id = test_cicd_flow(token, branch_name)
    
    print("All tests passed successfully!")
    print(f"Created resources:")
    print(f"- Ticket ID: {ticket_id}")
    print(f"- Code ID: {code_id}")
    print(f"- Test ID: {test_id}")
    print(f"- Branch: {branch_name}")
    print(f"- Commit ID: {commit_id}")
    print(f"- Pipeline ID: {pipeline_id}")

if __name__ == "__main__":
    test_full_flow() 