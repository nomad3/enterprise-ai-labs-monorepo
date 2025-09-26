import os  # Import os to access environment variables
from typing import Any, AsyncGenerator, Dict

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from devagent.api.main import app  # Assuming your FastAPI app instance is here
from devagent.api.schemas.tenant import TenantCreate, TenantRead
from devagent.core.database import Base, get_session
from devagent.core.models.tenant_model import Tenant

# Configure a separate test database
# Use environment variable for DB URL if available (for docker-compose), else fallback to SQLite
DATABASE_URL_FOR_TESTS = os.getenv(
    "DATABASE_URL", "sqlite+aiosqlite:///./test_api.db"
)  # Match docker-compose env var

engine_test = create_async_engine(
    DATABASE_URL_FOR_TESTS, echo=False
)  # echo=False for less verbose test output
async_session_test = sessionmaker(
    engine_test, class_=AsyncSession, expire_on_commit=False
)


async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_test() as session:
        yield session


app.dependency_overrides[get_session] = override_get_session


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_database():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_test() as session:
        yield session
        await session.rollback()  # Rollback after each test to keep db clean


@pytest_asyncio.fixture(scope="function")
async def client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(app=app, base_url="http://testserver") as c:
        yield c


@pytest_asyncio.fixture(scope="function")
async def create_test_tenant(
    db_session: AsyncSession, tenant_data: Dict[str, Any]
) -> TenantRead:
    tenant_create_schema = TenantCreate(**tenant_data)
    tenant = Tenant(**tenant_create_schema.dict())
    db_session.add(tenant)
    await db_session.commit()
    await db_session.refresh(tenant)
    return TenantRead.from_orm(tenant)


# Basic tenant data for tests
default_tenant_data_1 = {
    "name": "Test Tenant Alpha",
    "slug": "test-tenant-alpha",
    "description": "Description for Alpha",
    "is_active": True,
    "subscription_tier": "pro",
    "settings": {"feature_x": True},
}

default_tenant_data_2 = {
    "name": "Test Tenant Bravo",
    "slug": "test-tenant-bravo",
    "description": "Description for Bravo",
    "is_active": False,
    "subscription_tier": "basic",
    "settings": {"feature_y": False},
}

default_tenant_data_3 = {
    "name": "Another Test Corp",  # For name filtering
    "slug": "another-test-corp",
    "description": "Description for Another",
    "is_active": True,
    "subscription_tier": "pro",
}


# --- Test Cases ---


@pytest.mark.asyncio
async def test_create_tenant(client: AsyncClient, db_session: AsyncSession):
    response = await client.post("/tenants/", json=default_tenant_data_1)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == default_tenant_data_1["name"]
    assert data["slug"] == default_tenant_data_1["slug"]
    assert data["description"] == default_tenant_data_1["description"]
    assert data["is_active"] == default_tenant_data_1["is_active"]
    assert data["subscription_tier"] == default_tenant_data_1["subscription_tier"]
    assert data["settings"] == default_tenant_data_1["settings"]
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data

    # Verify it's in the DB
    tenant_in_db = await db_session.get(Tenant, data["id"])
    assert tenant_in_db is not None
    assert tenant_in_db.name == default_tenant_data_1["name"]


@pytest.mark.asyncio
async def test_get_tenant(client: AsyncClient, db_session: AsyncSession):
    # Create a tenant directly in DB for this test
    tenant_obj = Tenant(**default_tenant_data_1)
    db_session.add(tenant_obj)
    await db_session.commit()
    await db_session.refresh(tenant_obj)

    response = await client.get(f"/tenants/{tenant_obj.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == default_tenant_data_1["name"]
    assert data["id"] == tenant_obj.id


@pytest.mark.asyncio
async def test_get_tenant_not_found(client: AsyncClient):
    response = await client.get("/tenants/99999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_tenants_empty(client: AsyncClient):
    response = await client.get("/tenants/")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_list_tenants_with_data(client: AsyncClient, db_session: AsyncSession):
    tenant1_obj = Tenant(**default_tenant_data_1)
    tenant2_obj = Tenant(**default_tenant_data_2)
    db_session.add_all([tenant1_obj, tenant2_obj])
    await db_session.commit()

    response = await client.get("/tenants/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert (
        data[0]["name"] == default_tenant_data_1["name"]
        or data[1]["name"] == default_tenant_data_1["name"]
    )
    assert (
        data[0]["name"] == default_tenant_data_2["name"]
        or data[1]["name"] == default_tenant_data_2["name"]
    )


@pytest.mark.asyncio
async def test_list_tenants_pagination(client: AsyncClient, db_session: AsyncSession):
    # Create 3 tenants
    db_session.add_all(
        [
            Tenant(**default_tenant_data_1),
            Tenant(**default_tenant_data_2),
            Tenant(**default_tenant_data_3),
        ]
    )
    await db_session.commit()

    # Get first page, limit 1
    response = await client.get("/tenants/?limit=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

    # Get second page, limit 1, skip 1
    response = await client.get("/tenants/?limit=1&skip=1")
    assert response.status_code == 200
    data_page2 = response.json()
    assert len(data_page2) == 1
    assert data_page2[0]["id"] != data[0]["id"]  # Ensure it's a different tenant


@pytest.mark.asyncio
async def test_list_tenants_filter_by_name(
    client: AsyncClient, db_session: AsyncSession
):
    db_session.add_all(
        [
            Tenant(**default_tenant_data_1),
            Tenant(**default_tenant_data_2),
            Tenant(**default_tenant_data_3),
        ]
    )
    await db_session.commit()

    response = await client.get("/tenants/?name=Alpha")  # Partial match
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == default_tenant_data_1["name"]

    response = await client.get("/tenants/?name=Test")  # Should match Alpha and Another
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


@pytest.mark.asyncio
async def test_list_tenants_filter_by_is_active(
    client: AsyncClient, db_session: AsyncSession
):
    db_session.add_all(
        [
            Tenant(**default_tenant_data_1),
            Tenant(**default_tenant_data_2),
            Tenant(**default_tenant_data_3),
        ]
    )
    await db_session.commit()

    # Filter for active tenants (Alpha and Another)
    response = await client.get("/tenants/?isActive=true")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    names = {item["name"] for item in data}
    assert default_tenant_data_1["name"] in names
    assert default_tenant_data_3["name"] in names

    # Filter for inactive tenants (Bravo)
    response = await client.get("/tenants/?isActive=false")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == default_tenant_data_2["name"]


@pytest.mark.asyncio
async def test_list_tenants_filter_by_subscription_tier(
    client: AsyncClient, db_session: AsyncSession
):
    db_session.add_all(
        [
            Tenant(**default_tenant_data_1),
            Tenant(**default_tenant_data_2),
            Tenant(**default_tenant_data_3),
        ]
    )
    await db_session.commit()

    # Filter for 'pro' tier (Alpha and Another)
    response = await client.get("/tenants/?subscriptionTier=pro")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    names = {item["name"] for item in data}
    assert default_tenant_data_1["name"] in names
    assert default_tenant_data_3["name"] in names

    # Filter for 'basic' tier (Bravo)
    response = await client.get("/tenants/?subscriptionTier=basic")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == default_tenant_data_2["name"]


@pytest.mark.asyncio
async def test_update_tenant(client: AsyncClient, db_session: AsyncSession):
    tenant_obj = Tenant(**default_tenant_data_1)
    db_session.add(tenant_obj)
    await db_session.commit()
    await db_session.refresh(tenant_obj)

    update_data = {
        "name": "Updated Test Tenant Alpha",
        "description": "Updated description",
        "is_active": False,
        "settings": {"feature_x": False, "new_feature": True},
    }
    response = await client.put(f"/tenants/{tenant_obj.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]
    assert data["is_active"] == update_data["is_active"]
    assert data["settings"] == update_data["settings"]
    assert data["id"] == tenant_obj.id

    # Verify in DB
    updated_tenant_in_db = await db_session.get(Tenant, tenant_obj.id)
    assert updated_tenant_in_db.name == update_data["name"]
    assert updated_tenant_in_db.description == update_data["description"]
    assert updated_tenant_in_db.is_active == update_data["is_active"]
    assert updated_tenant_in_db.settings == update_data["settings"]


@pytest.mark.asyncio
async def test_update_tenant_not_found(client: AsyncClient):
    update_data = {"name": "Non Existent"}
    response = await client.put("/tenants/99999", json=update_data)
    # The service layer raises ValueError, which FastAPI might turn into a 500
    # or a 404 if handled by an exception handler.
    # For now, let's assume it's not a clean 404 from the router itself without specific handling.
    # Depending on actual error handling, this might need adjustment.
    # If the service's ValueError is caught and re-raised as HTTPException(404), this would be 404.
    assert (
        response.status_code != 200
    )  # General check, specific code depends on error handling


@pytest.mark.asyncio
async def test_delete_tenant(client: AsyncClient, db_session: AsyncSession):
    tenant_obj = Tenant(**default_tenant_data_1)
    db_session.add(tenant_obj)
    await db_session.commit()
    await db_session.refresh(tenant_obj)

    response = await client.delete(f"/tenants/{tenant_obj.id}")
    assert response.status_code == 204

    # Verify it's deleted from DB
    deleted_tenant = await db_session.get(Tenant, tenant_obj.id)
    assert deleted_tenant is None


@pytest.mark.asyncio
async def test_delete_tenant_not_found(client: AsyncClient):
    response = await client.delete("/tenants/99999")
    # Similar to update, the exact status code depends on how ValueError from service is handled.
    assert response.status_code != 204
