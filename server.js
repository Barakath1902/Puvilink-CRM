
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


// INVOICE FILES
const invoicePublicFolder = path.join(
    __dirname,
    "Invoice",
    "Public"
);

const invoiceListFile = path.join(
    invoicePublicFolder,
    "InvoiceList.html"
);

const invoiceFile = path.join(
    invoicePublicFolder,
    "Invoice.html"
);

// CUSTOMER FILES
const customerPublicFolder = path.join(
    __dirname,
    "Customer",
    "Public"
);

const customerListFile = path.join(
    customerPublicFolder,
    "CustomerList.html"
);

const customerFile = path.join(
    customerPublicFolder,
    "Customer.html"
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

console.log(
    "INVOICE FOLDER EXISTS:",
    fs.existsSync(invoicePublicFolder)
);

console.log(
    "INVOICE LIST EXISTS:",
    fs.existsSync(invoiceListFile)
);

console.log(
    "CREATE INVOICE EXISTS:",
    fs.existsSync(invoiceFile)
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

app.use(
    "/invoice-assets",
    express.static(invoicePublicFolder)
);

app.use(
    "/customer-assets",
    express.static(customerPublicFolder)
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


app.get("/debug-db", (req, res) => {
    let databaseHost = "Unable to read DATABASE_URL";

    try {
        if (process.env.DATABASE_URL) {
            databaseHost = new URL(
                process.env.DATABASE_URL
            ).hostname;
        }
    } catch (error) {
        databaseHost = "Invalid DATABASE_URL format";
    }

    res.json({
        databaseUrlPresent: !!process.env.DATABASE_URL,
        databaseHost: databaseHost,
        connectionFile: require.resolve("./db")
    });
});


 // ==========================================
 // INVOICE PAGE ROUTES
 // ==========================================

// INVOICE LIST
app.get("/invoice", (req, res) => {
    console.log("INVOICE LIST ROUTE CALLED");
    res.sendFile(invoiceListFile);
});

// CREATE INVOICE
app.get("/create-invoice", (req, res) => {
    console.log("CREATE INVOICE ROUTE CALLED");
    res.sendFile(invoiceFile);
});

// DIRECT INVOICE HTML ACCESS
app.get("/Invoice.html", (req, res) => {
    console.log("DIRECT INVOICE HTML ROUTE CALLED");
    res.sendFile(invoiceFile);
});

// ==========================================
// CUSTOMER PAGE ROUTES
// ==========================================

// CUSTOMER LIST
app.get("/customer", (req, res) => {
    console.log("CUSTOMER LIST ROUTE CALLED");
    res.sendFile(customerListFile);
});

// CREATE CUSTOMER
app.get("/create-customer", (req, res) => {
    console.log("CREATE CUSTOMER ROUTE CALLED");
    res.sendFile(customerFile);
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
            FROM public.enquiries
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
            FROM public.enquiries
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
            INSERT INTO public.enquiries (
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
            UPDATE public.enquiries
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
            DELETE FROM public.enquiries
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

// UPDATE QUOTATION
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

        if (
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

// GET ONE QUOTATION
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

// DELETE QUOTATION
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
 // INVOICE MODULE
 // ==========================================

// GET ALL INVOICES
app.get("/get-invoices", async (req, res) => {
    try {
        const sql = `
            SELECT
                invoice_no,
                TO_CHAR(invoice_date, 'YYYY-MM-DD') AS invoice_date,
                customer_name,
                cust_contact,
                cust_mail,
                gstin
            FROM public.invoice
            ORDER BY invoice_no DESC
        `;

        const result = await pool.query(sql);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Get Invoices Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET ONE INVOICE
app.get("/get-invoice/:invoice_no", async (req, res) => {
    try {
        const sql = `
            SELECT
                invoice_no,
                TO_CHAR(invoice_date, 'YYYY-MM-DD') AS invoice_date,
                customer_name,
                cust_contact,
                cust_mail,
                gstin
            FROM public.invoice
            WHERE invoice_no = $1
        `;

        const result = await pool.query(
            sql,
            [req.params.invoice_no]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found."
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Get Invoice Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// SAVE INVOICE
app.post("/save-invoice", async (req, res) => {
    try {
        const {
            invoice_no,
            invoice_date,
            customer_name,
            cust_contact,
            cust_mail,
            gstin
        } = req.body;

        if (
            !invoice_no ||
            !invoice_date ||
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
            INSERT INTO public.invoice (
                invoice_no,
                invoice_date,
                customer_name,
                cust_contact,
                cust_mail,
                gstin
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            invoice_no,
            invoice_date,
            customer_name,
            cust_contact,
            cust_mail,
            gstin || null
        ];

        const result = await pool.query(sql, values);

        res.status(201).json({
            success: true,
            message: "Invoice saved successfully!",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Save Invoice Error:", error);

        res.status(500).json({
            success: false,
            message: error.code === "23505"
                ? "Invoice number already exists."
                : error.message
        });
    }
});

// UPDATE INVOICE
app.put("/update-invoice/:invoice_no", async (req, res) => {
    try {
        const {
            invoice_date,
            customer_name,
            cust_contact,
            cust_mail,
            gstin
        } = req.body;

        if (
            !invoice_date ||
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
            UPDATE public.invoice
            SET
                invoice_date = $1,
                customer_name = $2,
                cust_contact = $3,
                cust_mail = $4,
                gstin = $5
            WHERE invoice_no = $6
            RETURNING *
        `;

        const values = [
            invoice_date,
            customer_name,
            cust_contact,
            cust_mail,
            gstin || null,
            req.params.invoice_no
        ];

        const result = await pool.query(sql, values);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found."
            });
        }

        res.json({
            success: true,
            message: "Invoice updated successfully!",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Update Invoice Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE INVOICE
app.delete("/delete-invoice/:invoice_no", async (req, res) => {
    try {
        const sql = `
            DELETE FROM public.invoice
            WHERE invoice_no = $1
            RETURNING invoice_no
        `;

        const result = await pool.query(
            sql,
            [req.params.invoice_no]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found."
            });
        }

        res.json({
            success: true,
            message: "Invoice deleted successfully!",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Delete Invoice Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


 // ==========================================
 // CUSTOMER MODULE
 // ==========================================

// GET ALL CUSTOMERS
app.get("/get-customers", async (req, res) => {
    try {
        const sql = `
            SELECT
                customer_code,
                customer_type,
                customer_name,
                customer_contact,
                customer_mail,
                gstin
            FROM public.customer
            ORDER BY customer_code DESC
        `;

        const result = await pool.query(sql);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Get Customers Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// GET ONE CUSTOMER
app.get("/get-customer/:customer_code", async (req, res) => {
    try {
        const sql = `
            SELECT
                customer_code,
                customer_type,
                customer_name,
                customer_contact,
                customer_mail,
                gstin
            FROM public.customer
            WHERE customer_code = $1
        `;

        const result = await pool.query(
            sql,
            [req.params.customer_code]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Get Customer Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// SAVE CUSTOMER
app.post("/save-customer", async (req, res) => {
    try {
        const {
            customer_code,
            customer_type,
            customer_name,
            customer_contact,
            customer_mail,
            gstin
        } = req.body;

        if (
            !customer_code ||
            !customer_type ||
            !customer_name ||
            !customer_contact ||
            !customer_mail
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        const sql = `
            INSERT INTO public.customer (
                customer_code,
                customer_type,
                customer_name,
                customer_contact,
                customer_mail,
                gstin
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            customer_code,
            customer_type,
            customer_name,
            customer_contact,
            customer_mail,
            gstin || null
        ];

        const result = await pool.query(sql, values);

        res.status(201).json({
            success: true,
            message: "Customer saved successfully!",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Save Customer Error:", error);

        res.status(500).json({
            success: false,
            message: error.code === "23505"
                ? "Customer code already exists."
                : error.message
        });
    }
});


// UPDATE CUSTOMER
app.put("/update-customer/:customer_code", async (req, res) => {
    try {
        const {
            customer_type,
            customer_name,
            customer_contact,
            customer_mail,
            gstin
        } = req.body;

        if (
            !customer_type ||
            !customer_name ||
            !customer_contact ||
            !customer_mail
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        const sql = `
            UPDATE public.customer
            SET
                customer_type = $1,
                customer_name = $2,
                customer_contact = $3,
                customer_mail = $4,
                gstin = $5
            WHERE customer_code = $6
            RETURNING *
        `;

        const values = [
            customer_type,
            customer_name,
            customer_contact,
            customer_mail,
            gstin || null,
            req.params.customer_code
        ];

        const result = await pool.query(sql, values);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        res.json({
            success: true,
            message: "Customer updated successfully!",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Update Customer Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// DELETE CUSTOMER
app.delete("/delete-customer/:customer_code", async (req, res) => {
    try {
        const sql = `
            DELETE FROM public.customer
            WHERE customer_code = $1
            RETURNING customer_code
        `;

        const result = await pool.query(
            sql,
            [req.params.customer_code]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        res.json({
            success: true,
            message: "Customer deleted successfully!",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Delete Customer Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// TEST INVOICE ROUTE
app.get("/test-invoice", (req, res) => {
    res.send("Invoice route is working!");
});

// ==========================================
// TEST QUOTATION ROUTE
// ==========================================

app.get("/test-quotation", (req, res) => {
    res.send("Quotation route is working!");
});

// ==========================================
// EXPORT APP FOR VERCEL
// ==========================================

module.exports = app;

// ==========================================
// START SERVER LOCALLY
// ==========================================

if (require.main === module) {
    app.listen(PORT, () => {
        console.log("================================");
        console.log("Server running successfully!");
        console.log(`URL: http://localhost:${PORT}`);
        console.log("================================");
    });
}
