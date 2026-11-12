
require("dotenv").config();
const { Pool } = require("pg");

// Local PostgreSQL connection
const localDB = new Pool({
    host: "localhost",
    port: 5432,
    database: "erp_db",
    user: process.env.LOCAL_DB_USER,
    password: process.env.LOCAL_DB_PASSWORD
});

// Neon PostgreSQL connection
const neonDB = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function migrateTable(localTable, neonTable, columns, primaryKey) {
    console.log(`\nMigrating ${localTable}...`);

    const localResult = await localDB.query(
        `SELECT ${columns.join(", ")} FROM public.${localTable}`
    );

    let inserted = 0;
    let skipped = 0;

    const client = await neonDB.connect();

    try {
        await client.query("BEGIN");

        for (const row of localResult.rows) {
            const values = columns.map((column) => row[column]);
            const placeholders = values.map((_, i) => `$${i + 1}`);

            const sql = `
                INSERT INTO public.${neonTable}
                (${columns.join(", ")})
                VALUES (${placeholders.join(", ")})
                ON CONFLICT (${primaryKey}) DO NOTHING
            `;

            const result = await client.query(sql, values);

            if (result.rowCount === 1) {
                inserted++;
            } else {
                skipped++;
            }
        }

        await client.query("COMMIT");

        console.log(`Local records: ${localResult.rowCount}`);
        console.log(`Inserted into Neon: ${inserted}`);
        console.log(`Skipped duplicates: ${skipped}`);

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
}

async function migrateData() {
    try {
        if (!process.env.DATABASE_URL || !process.env.LOCAL_DB_PASSWORD) {
            throw new Error("Check DATABASE_URL and LOCAL_DB_PASSWORD in .env");
        }

        console.log("Starting database migration...");

        // Local enquiry -> Neon enquiries
        await migrateTable(
            "enquiry",
            "enquiries",
            [
                "enquiry_no",
                "enquiry_date",
                "company_name",
                "mobile_no",
                "lead_source",
                "enquiry_category"
            ],
            "enquiry_no"
        );

        // Local quotation -> Neon quotation
        await migrateTable(
            "quotation",
            "quotation",
            [
                "quotation_no",
                "proposal_date",
                "status",
                "customer_name",
                "cust_contact",
                "cust_mail",
                "gstin"
            ],
            "quotation_no"
        );

        console.log("\nMigration completed successfully!");

    } catch (error) {
        console.error("\nMigration failed:", error.message);

    } finally {
        await localDB.end();
        await neonDB.end();
    }
}

migrateData();
