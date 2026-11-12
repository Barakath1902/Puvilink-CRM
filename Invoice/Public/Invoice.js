
document.addEventListener("DOMContentLoaded", async function () {

    const invoiceForm = document.getElementById("invoiceForm");

    if (!invoiceForm) {
        console.log("Invoice form not found.");
        return;
    }

    // Check whether this is a new invoice or existing invoice
    const params = new URLSearchParams(window.location.search);
    const invoiceNo = params.get("invoice_no");

    const heading = document.querySelector("h3");
    const saveButton = invoiceForm.querySelector('button[type="submit"]');

    // EDIT MODE
    if (invoiceNo) {

        heading.textContent = "Update Invoice";
        saveButton.textContent = "Update Invoice";

        try {

            const response = await fetch(
                "/get-invoice/" + encodeURIComponent(invoiceNo)
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to load invoice");
            }

            const invoice = result.data;

            document.getElementById("invoiceNo").value =
                invoice.invoice_no;

            document.getElementById("invoiceNo").readOnly = true;

            document.getElementById("invoiceDate").value =
                invoice.invoice_date;

            document.getElementById("invoiceCustomer").value =
                invoice.customer_name;

            document.getElementById("invoiceContact").value =
                invoice.cust_contact;

            document.getElementById("invoiceMail").value =
                invoice.cust_mail;

            document.getElementById("invoiceGSTIN").value =
                invoice.gstin || "";

            console.log("Invoice loaded for editing:", invoice);

        } catch (error) {

            alert("Error loading invoice: " + error.message);
            window.location.href = "/invoice";
            return;

        }

    } else {

        // CREATE MODE
        heading.textContent = "Create Invoice";
        saveButton.textContent = "Save Invoice";

    }

    // SAVE OR UPDATE FORM
    invoiceForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const invoiceData = {

            invoice_no: document.getElementById("invoiceNo").value.trim(),

            invoice_date: document.getElementById("invoiceDate").value,

            customer_name: document.getElementById("invoiceCustomer").value.trim(),

            cust_contact: document.getElementById("invoiceContact").value.trim(),

            cust_mail: document.getElementById("invoiceMail").value.trim(),

            gstin: document.getElementById("invoiceGSTIN").value.trim()

        };

        try {

            let url;
            let method;

            if (invoiceNo) {

                // Update existing invoice
                url = "/update-invoice/" +
                    encodeURIComponent(invoiceNo);

                method = "PUT";

            } else {

                // Save new invoice
                url = "/save-invoice";

                method = "POST";

            }

            const response = await fetch(url, {

                method: method,

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(invoiceData)

            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Operation failed");
            }

            if (invoiceNo) {
                alert("Invoice updated successfully!");
            } else {
                alert("Invoice saved successfully!");
            }

            window.location.href = "/invoice";

        } catch (error) {

            console.error("Invoice Error:", error);

            alert("Error: " + error.message);

        }

    });

});
