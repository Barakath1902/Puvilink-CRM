
const express = require("express");
const path = require("path");
const pool = require("./db");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve CSS, JavaScript and other frontend files
app.use(express.static(path.join(__dirname, "Enquiry")));

// Open Enquiry HTML page
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "Enquiry", "Enquiry.html"),
        (err) => {
            if (err) {
                console.error("HTML file error:", err.message);
                res.status(404).send(
                    "Enquiry.html not found. Check your Enquiry folder."
                );
            }
        }
    );
});

// Test PostgreSQL connection
app.get("/test-db", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.send("PostgreSQL connected successfully!");
    } catch (error) {
        console.error("Database error:", error.message);
        res.status(500).send("PostgreSQL connection failed!");
    }
});

// Save Enquiry to PostgreSQL
app.post("/save-enquiry", async (req, res) => {
    try {
        const {
            enquiry_number,
            enquiry_date,
            company_name,
            phone_no,
            lead_source,
            enquiry_category
        } = req.body;

        // Validate form fields
        if (
            !enquiry_number ||
            !enquiry_date ||
            !company_name ||
            !phone_no ||
            !lead_source ||
            !enquiry_category
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields."
            });
        }

        // SQL query
        const sql = `
            INSERT INTO enquiries (
                enquiry_number,
                enquiry_date,
                company_name,
                phone_no,
                lead_source,
                enquiry_category
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            enquiry_number,
            enquiry_date,
            company_name,
            phone_no,
            lead_source,
            enquiry_category
        ];

        const result = await pool.query(sql, values);

        res.status(201).json({
            success: true,
            message: "Enquiry saved successfully!",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to save enquiry.",
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("Server running successfully!");
    console.log(`URL: http://localhost:${PORT}`);
    console.log("--------------------------------");
});
