import { db } from "./index.js";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Starting database migration...");

  try {
    // Check if description column exists
    const descriptionExists = await db.select({ count: sql`count(*)` })
      .from(sql`pragma_table_info('habits')`)
      .where(sql`name = 'description'`)
      .get();

    if (!descriptionExists || descriptionExists.count === 0) {
      console.log("Adding description column to habits table...");
      await db.run(sql`ALTER TABLE habits ADD COLUMN description TEXT`);
    }

    // Check if importance column exists
    const importanceExists = await db.select({ count: sql`count(*)` })
      .from(sql`pragma_table_info('habits')`)
      .where(sql`name = 'importance'`)
      .get();

    if (!importanceExists || importanceExists.count === 0) {
      console.log("Adding importance column to habits table...");
      await db.run(sql`ALTER TABLE habits ADD COLUMN importance INTEGER NOT NULL DEFAULT 5`);
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run migration
migrate(); 