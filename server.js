
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

// ENQUIRY FILES
const enquiryPublicFolder = path.join(
    __dirname,
    "Enquiry",
    "Public"
);

const enquiryListFile = path.join(
    enquiryPublicFolder,
    "EnquiryList.html"
);

const enquiryFile = path.join(
    enquiryPublicFolder,
    "Enquiry.html"
);

// QUOTATION FILES
const quotationPublicFolder = path.join(
    __dirname,
    "Quotation",
    "Public"
);

const quotationListFile = path.join(
    quotationPublicFolder,
    "QuotationList.html"
);

const quotationFile = path.join(
    quotationPublicFolder,
    "Quotation.html"
);

// ==========================================
// CHECK FILES
// ==========================================

console.log("================================");
console.log("PROJECT LOCATION:", __dirname);

console.log("INDEX EXISTS:", fs.existsSync(indexFile));

console.log(
    "ENQUIRY FOLDER EXISTS:",
    fs.existsSync(enquiryPublicFolder)
);

console.log(
    "ENQUIRY LIST EXISTS:",
    fs.existsSync(enquiryListFile)
);

console.log(
    "CREATE ENQUIRY EXISTS:",
    fs.existsSync(enquiryFile)
);

console.log(
    "QUOTATION FOLDER EXISTS:",
    fs.existsSync(quotationPublicFolder)
);

console.log(
    "QUOTATION LIST EXISTS:",
    fs.existsSync(quotationListFile)
);

console.log(
    "CREATE QUOTATION EXISTS:",
    fs.existsSync(quotationFile)
);

console.log("================================");

// ==========================================
// SERVE FRONTEND FILES
// ==========================================

app.use(express.static(enquiryPublicFolder));

app.use(
    "/quotation-assets",
    express.static(quotationPublicFolder)
);

// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {
    console.log("HOME PAGE ROUTE CALLED");
    res.sendFile(indexFile);
});

// ==========================================
// ENQUIRY PAGE ROUTES
// ==========================================

// ENQUIRY LIST
app.get("/enquiry", (req, res) => {
    console.log("ENQUIRY LIST ROUTE CALLED");
    res.sendFile(enquiryListFile);
});

// CREATE ENQUIRY
app.get("/create-enquiry", (req, res) => {
    console.log("CREATE ENQUIRY ROUTE CALLED");
    res.sendFile(enquiryFile);
});

// ==========================================
// QUOTATION PAGE ROUTES
// ==========================================

// QUOTATION LIST
app.get("/quotation", (req, res) => {
    console.log("QUOTATION LIST ROUTE CALLED");
    res.sendFile(quotationListFile);
});

// CREATE QUOTATION
app.get("/create-quotation", (req, res) => {
    console.log("CREATE QUOTATION ROUTE CALLED");
    res.sendFile(quotationFile);
});

// ==========================================
// TEST DATABASE CONNECTION
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
// ENQUIRY MODULE
// ==========================================

// GET ALL ENQUIRIES
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

// GET ONE ENQUIRY
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

// SAVE ENQUIRY
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
            message: error.code === "23505"
                ? "Enquiry number already exists."
                : error.message
        });
    }
});

// UPDATE ENQUIRY
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

// DELETE ENQUIRY
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
// QUOTATION MODULE
// ==========================================

// GET ALL QUOTATIONS
app.get("/get-quotations", async (req, res) => {
    try {
        const sql = `
            SELECT
                quotation_no,
                TO_CHAR(proposal_date, 'YYYY-MM-DD') AS proposal_date,
                status,
                customer_name,
                cust_contact,
                cust_mail,
                gstin
            FROM public.quotation
            ORDER BY quotation_no DESC
        `;

        const result = await pool.query(sql);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Get Quotations Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// SAVE QUOTATION
app.post("/save-quotation", async (req, res) => {
    try {
        const {
            quotation_no,
            proposal_date,
            status,
            customer_name,
            cust_contact,
            cust_mail,
            gstin
        } = req.body;

        if (
            !quotation_no ||
            !proposal_date ||
            !status ||
            !customer_name ||
            !cust_contact ||
            !cust_mail
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        const sql = `
            INSERT INTO public.quotation (
                quotation_no,
                proposal_date,
                status,
                customer_name,
                cust_contact,
                cust_mail,
                gstin
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            quotation_no,
            proposal_date,
            status,
            customer_name,
            cust_contact,
            cust_mail,
            gstin || null
        ];

        const result = await pool.query(sql, values);

        res.status(201).json({
            success: true,
            message: "Quotation saved successfully!",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Save Quotation Error:", error);

        res.status(500).json({
            success: false,
            message: error.code === "23505"
                ? "Quotation number already exists."
                : error.message
        });
    }
});

app.put("/update-quotation/:quotation_no", async (req, res) => {
    try {
        const { quotation_no } = req.params;

        const {
            proposal_date,
            status,
            customer_name,
            cust_contact,
            cust_mail,
            gstin
        } = req.body;

        if (!proposal_date || !status || !customer_name ||
            !cust_contact || !cust_mail) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        const sql = `
            UPDATE public.quotation
            SET
                proposal_date = $1,
                status = $2,
                customer_name = $3,
                cust_contact = $4,
                cust_mail = $5,
                gstin = $6
            WHERE quotation_no = $7
            RETURNING *
        `;

        const values = [
            proposal_date,
            status,
            customer_name,
            cust_contact,
            cust_mail,
            gstin || null,
            quotation_no
        ];

        const result = await pool.query(sql, values);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found."
            });
        }

        res.json({
            success: true,
            message: "Quotation updated successfully!",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Update Quotation Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.get("/get-quotation/:quotation_no", async (req, res) => {
    try {
        const { quotation_no } = req.params;

        const sql = `
            SELECT
                quotation_no,
                TO_CHAR(proposal_date, 'YYYY-MM-DD') AS proposal_date,
                status,
                customer_name,
                cust_contact,
                cust_mail,
                gstin
            FROM public.quotation
            WHERE quotation_no = $1
        `;

        const result = await pool.query(sql, [quotation_no]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found."
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Get Single Quotation Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
// ==========================================
// DELETE QUOTATION
// ==========================================

app.delete("/delete-quotation/:quotation_no", async (req, res) => {
    try {
        const { quotation_no } = req.params;

        const sql = `
            DELETE FROM public.quotation
            WHERE quotation_no = $1
            RETURNING quotation_no
        `;

        const result = await pool.query(sql, [quotation_no]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Quotation deleted successfully!",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Delete Quotation Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// ==========================================
// START SERVER
// ==========================================
// TEST QUOTATION ROUTE
app.get("/test-quotation", (req, res) => {
    res.send("Quotation route is working!");
});
app.listen(PORT, () => {
    console.log("================================");
    console.log("Server running successfully!");
    console.log(`URL: http://localhost:${PORT}`);
    console.log("================================");
});
