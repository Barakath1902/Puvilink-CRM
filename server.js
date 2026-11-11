
const express = require("express");
const path = require("path");
const fs = require("fs");
const pool = require("./db");

const app = express();
const PORT = 3000;

// ==========================================
// SERVER IDENTIFICATION
// ==========================================

console.log("MAIN SERVER.JS IS RUNNING");
console.log("SERVER FILE:", __filename);

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// FILE LOCATIONS
// ==========================================

const indexFile = path.join(__dirname, "Index.html");

const publicFolder = path.join(
    __dirname,
    "Enquiry",
    "Public"
);

const enquiryListFile = path.join(publicFolder, "EnquiryList.html");
const enquiryFile = path.join(publicFolder, "Enquiry.html");

// ==========================================
// CHECK FILES
// ==========================================

console.log("================================");
console.log("PROJECT LOCATION:", __dirname);
console.log("INDEX EXISTS:", fs.existsSync(indexFile));
console.log("PUBLIC FOLDER EXISTS:", fs.existsSync(publicFolder));
console.log("ENQUIRY LIST EXISTS:", fs.existsSync(enquiryListFile));
console.log("CREATE ENQUIRY EXISTS:", fs.existsSync(enquiryFile));
console.log("================================");

// ==========================================
// SERVE FRONTEND FILES
// ==========================================

app.use(express.static(publicFolder));

// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {
    console.log("HOME PAGE ROUTE CALLED");
    res.sendFile(indexFile);
});

// ==========================================
// ENQUIRY LIST PAGE
// ==========================================

app.get("/enquiry", (req, res) => {
    console.log("ENQUIRY LIST ROUTE CALLED");
    res.sendFile(enquiryListFile);
});

// ==========================================
// CREATE ENQUIRY PAGE
// ==========================================

app.get("/create-enquiry", (req, res) => {
    console.log("CREATE ENQUIRY ROUTE CALLED");
    res.sendFile(enquiryFile);
});

// ==========================================
// TEST DATABASE
// ==========================================

app.get("/test-db", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.send("PostgreSQL connected successfully!");
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).send(error.message);
    }
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
            FROM public.enquiry
            ORDER BY enquiry_no DESC
        `;

        const result = await pool.query(sql);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Get Enquiries Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ==========================================
// GET ONE ENQUIRY
// ==========================================

app.get("/get-enquiry/:enquiry_no", async (req, res) => {
    try {
        const sql = `
            SELECT
                enquiry_no,
                TO_CHAR(enquiry_date, 'YYYY-MM-DD') AS enquiry_date,
                company_name,
                mobile_no,
                lead_source,
                enquiry_category
            FROM public.enquiry
            WHERE enquiry_no = $1
        `;

        const result = await pool.query(
            sql,
            [req.params.enquiry_no]
        );

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
        console.error("Get Enquiry Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ==========================================
// SAVE ENQUIRY
// ==========================================

app.post("/save-enquiry", async (req, res) => {
    try {
        const {
            enquiry_no,
            enquiry_date,
            company_name,
            mobile_no,
            lead_source,
            enquiry_category
        } = req.body;

        if (
            !enquiry_no ||
            !enquiry_date ||
            !company_name ||
            !mobile_no ||
            !lead_source ||
            !enquiry_category
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields."
            });
        }

        const sql = `
            INSERT INTO public.enquiry (
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
            enquiry_no,
            enquiry_date,
            company_name,
            mobile_no,
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
        console.error("Save Enquiry Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ==========================================
// UPDATE ENQUIRY
// ==========================================

app.put("/update-enquiry/:enquiry_no", async (req, res) => {
    try {
        const {
            enquiry_date,
            company_name,
            mobile_no,
            lead_source,
            enquiry_category
        } = req.body;

        const sql = `
            UPDATE public.enquiry
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
            mobile_no,
            lead_source,
            enquiry_category,
            req.params.enquiry_no
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
        console.error("Update Enquiry Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ==========================================
// DELETE ENQUIRY
// ==========================================

app.delete("/delete-enquiry/:enquiry_no", async (req, res) => {
    try {
        const sql = `
            DELETE FROM public.enquiry
            WHERE enquiry_no = $1
            RETURNING *
        `;

        const result = await pool.query(
            sql,
            [req.params.enquiry_no]
        );

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
        console.error("Delete Enquiry Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
    console.log("================================");
    console.log("Server running successfully!");
    console.log(`URL: http://localhost:${PORT}`);
    console.log("================================");
});
