
async function loadInvoices() {

    try {

        const response = await fetch("/get-invoices");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to load invoices");
        }

        const tableBody = document.getElementById("invoiceTableBody");

        tableBody.innerHTML = "";

        if (!result.data || result.data.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">No invoices found.</td>
                </tr>
            `;

            return;
        }

        result.data.forEach(invoice => {
            createInvoiceRow(invoice, tableBody);
        });

    } catch (error) {

        console.error("Load Error:", error);

        alert("Error loading invoices: " + error.message);

    }

}


// CREATE INVOICE ROW
function createInvoiceRow(invoice, tableBody) {

    const row = document.createElement("tr");

    const fields = [
        "invoice_no",
        "invoice_date",
        "customer_name",
        "cust_contact",
        "cust_mail",
        "gstin"
    ];

    fields.forEach(field => {

        const cell = document.createElement("td");

        cell.textContent = invoice[field] || "";

        row.appendChild(cell);

    });

    const actionCell = document.createElement("td");


    // EDIT BUTTON
    const editButton = document.createElement("button");

    editButton.textContent = "Edit";

    editButton.addEventListener("click", function () {

        window.location.href =
            "/create-invoice?invoice_no=" +
            encodeURIComponent(invoice.invoice_no);

    });


    // DELETE BUTTON
    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", async function () {

        const confirmDelete = confirm(
            "Are you sure you want to delete invoice " +
            invoice.invoice_no + "?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            const response = await fetch(
                "/delete-invoice/" +
                encodeURIComponent(invoice.invoice_no),
                {
                    method: "DELETE"
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Delete failed");
            }

            alert("Invoice deleted successfully!");

            loadInvoices();

        } catch (error) {

            console.error("Delete Error:", error);

            alert("Error deleting invoice: " + error.message);

        }

    });


    actionCell.appendChild(editButton);
    actionCell.appendChild(deleteButton);

    row.appendChild(actionCell);

    tableBody.appendChild(row);

}


// LOAD INVOICES WHEN PAGE OPENS
loadInvoices();
