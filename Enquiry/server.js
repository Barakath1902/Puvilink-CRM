
const express = require("express");
const path = require("path");
const pool = require("./db");

const app = express();
const PORT = 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "Public")));


// ==========================================
// DISPLAY ENQUIRY LIST PAGE
// ==========================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "Public", "EnquiryList.html")
    );
});


// ==========================================
// DISPLAY CREATE / UPDATE ENQUIRY PAGE
// ==========================================

app.get("/create-enquiry", (req, res) => {
    res.sendFile(
        path.join(__dirname, "Public", "Enquiry.html")
    );
});


// ==========================================
// GET ALL ENQUIRIES
// ==========================================

app.get("/get-enquiries", async (req, res) => {
    try {

        const sql = `
            SELECT
                enquiry_no,
                TO_CHAR(enquiry_date, 'YYYY-MM-DD') AS enquiry_date,
                company_name,
                mobile_no,
                lead_source,
                enquiry_category
            FROM enquiry
            ORDER BY enquiry_no DESC
        `;

        const result = await pool.query(sql);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error("Get Enquiries Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve enquiries"
        });
    }
});


// ==========================================
// GET ONE ENQUIRY FOR UPDATING
// ==========================================

app.get("/get-enquiry/:enquiry_no", async (req, res) => {
    try {

        const enquiryNo = req.params.enquiry_no;

        const sql = `
            SELECT
                enquiry_no,
                TO_CHAR(enquiry_date, 'YYYY-MM-DD') AS enquiry_date,
                company_name,
                mobile_no,
                lead_source,
                enquiry_category
            FROM enquiry
            WHERE enquiry_no = $1
        `;

        const result = await pool.query(sql, [enquiryNo]);

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Enquiry not found"
            });

        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {

        console.error("Get Enquiry Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve enquiry"
        });
    }
});


// ==========================================
// TEST POSTGRESQL CONNECTION
// ==========================================

app.get("/test-db", async (req, res) => {
    try {

        await pool.query("SELECT 1");

        res.send("PostgreSQL connected successfully!");

    } catch (error) {

        console.error("Database Error:", error.message);

        res.status(500).send("Database connection failed!");
    }
});


// ==========================================
// SAVE NEW ENQUIRY
// ==========================================

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

        const sql = `
            INSERT INTO enquiry (
                enquiry_no,
                enquiry_date,
                company_name,
                mobile_no,
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

        console.error("Save Enquiry Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to save enquiry"
        });
    }
});


// ==========================================
// UPDATE EXISTING ENQUIRY
// ==========================================

app.put("/update-enquiry/:enquiry_no", async (req, res) => {
    try {

        const {
            enquiry_date,
            company_name,
            phone_no,
            lead_source,
            enquiry_category
        } = req.body;

        const enquiryNo = req.params.enquiry_no;

        const sql = `
            UPDATE enquiry
            SET
                enquiry_date = $1,
                company_name = $2,
                mobile_no = $3,
                lead_source = $4,
                enquiry_category = $5
            WHERE enquiry_no = $6
            RETURNING *
        `;

        const values = [
            enquiry_date,
            company_name,
            phone_no,
            lead_source,
            enquiry_category,
            enquiryNo
        ];

        const result = await pool.query(sql, values);

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Enquiry not found"
            });

        }

        res.json({
            success: true,
            message: "Enquiry updated successfully!",
            data: result.rows[0]
        });

    } catch (error) {

        console.error("Update Enquiry Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to update enquiry"
        });
    }
});


// ==========================================
// DELETE EXISTING ENQUIRY
// ==========================================

app.delete("/delete-enquiry/:enquiry_no", async (req, res) => {
    try {

        const enquiryNo = req.params.enquiry_no;

        const sql = `
            DELETE FROM enquiry
            WHERE enquiry_no = $1
            RETURNING *
        `;

        const result = await pool.query(sql, [enquiryNo]);

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Enquiry not found"
            });

        }

        res.json({
            success: true,
            message: "Enquiry deleted successfully!"
        });

    } catch (error) {

        console.error("Delete Enquiry Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to delete enquiry"
        });
    }
});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log("Enquiry server running!");

    console.log(`http://localhost:${PORT}`);

});
