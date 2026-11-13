
async function loadQuotations() {
    try {
        const response = await fetch("/get-quotations");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to load quotations");
        }

        const tableBody = document.getElementById("quotationTableBody");
        tableBody.innerHTML = "";

        result.data.forEach(quotation => {
            createQuotationRow(quotation, tableBody);
        });

    } catch (error) {
        console.error("Load Error:", error);
        alert("Error loading quotations: " + error.message);
    }
}


// CREATE QUOTATION ROW
function createQuotationRow(quotation, tableBody) {

    const row = document.createElement("tr");

    const fields = [
        "quotation_no",
        "proposal_date",
        "status",
        "customer_name",
        "cust_contact",
        "cust_mail",
        "gstin"
    ];

    fields.forEach(field => {
        const cell = document.createElement("td");
        cell.textContent = quotation[field] || "";
        row.appendChild(cell);
    });

    const actionCell = document.createElement("td");

    // Prevent buttons from appearing one below the other
    actionCell.setAttribute("nowrap", "nowrap");

    // EDIT BUTTON
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";

    editButton.addEventListener("click", function () {

        window.location.href =
            "/create-quotation?quotation_no=" +
            encodeURIComponent(quotation.quotation_no);

    });


    // DELETE BUTTON
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", async function () {

        const confirmDelete = confirm(
            "Are you sure you want to delete quotation " +
            quotation.quotation_no + "?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            const response = await fetch(
                "/delete-quotation/" +
                encodeURIComponent(quotation.quotation_no),
                {
                    method: "DELETE"
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Delete failed");
            }

            alert("Quotation deleted successfully!");

            loadQuotations();

        } catch (error) {

            console.error("Delete Error:", error);
            alert("Error deleting quotation: " + error.message);

        }

    });

    actionCell.appendChild(editButton);
    actionCell.appendChild(document.createTextNode(" "));
    actionCell.appendChild(deleteButton);

    row.appendChild(actionCell);
    tableBody.appendChild(row);
}


// LOAD QUOTATIONS WHEN PAGE OPENS
loadQuotations();
