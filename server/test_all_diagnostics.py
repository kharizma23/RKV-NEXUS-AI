import asyncio
from app.database.session import AsyncSessionLocal
from app.modules.users.model import User
from app.modules.roles.model import Role
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        print(f"Total users found: {len(users)}")
        for u in users:
            role_names = [r.name for r in u.roles]
            print(f"User: {u.email} | Name: {u.full_name} | Roles: {role_names} | Active: {u.is_active} | Verified: {u.is_verified} | Approved: {u.is_approved}")

if __name__ == "__main__":
    asyncio.run(main())
