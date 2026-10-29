import asyncio
from app.database.session import AsyncSessionLocal
from sqlalchemy import text

async def main():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'alumni' ORDER BY ordinal_position"))
        rows = res.fetchall()
        print("Columns in alumni table:")
        for r in rows:
            print(f"  {r[0]}: {r[1]} (nullable={r[2]})")

if __name__ == "__main__":
    asyncio.run(main())
