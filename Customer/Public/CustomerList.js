
async function loadCustomers() {

    try {

        const response = await fetch("/get-customers");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to load customers");
        }

        const tableBody = document.getElementById("customerTableBody");

        tableBody.innerHTML = "";

        if (!result.data || result.data.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">No customers found.</td>
                </tr>
            `;

            return;
        }

        result.data.forEach(customer => {
            createCustomerRow(customer, tableBody);
        });

    } catch (error) {

        console.error("Load Error:", error);

        alert("Error loading customers: " + error.message);

    }

}


// CREATE CUSTOMER ROW
function createCustomerRow(customer, tableBody) {

    const row = document.createElement("tr");

    const fields = [
        "customer_code",
        "customer_type",
        "customer_name",
        "customer_contact",
        "customer_mail",
        "gstin"
    ];

    fields.forEach(field => {

        const cell = document.createElement("td");

        cell.textContent = customer[field] || "";

        row.appendChild(cell);

    });

    const actionCell = document.createElement("td");


    // EDIT BUTTON
    const editButton = document.createElement("button");

    editButton.textContent = "Edit";

    editButton.addEventListener("click", function () {

        window.location.href =
            "/create-customer?customer_code=" +
            encodeURIComponent(customer.customer_code);

    });


    // DELETE BUTTON
    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", async function () {

        const confirmDelete = confirm(
            "Are you sure you want to delete customer " +
            customer.customer_code + "?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            const response = await fetch(
                "/delete-customer/" +
                encodeURIComponent(customer.customer_code),
                {
                    method: "DELETE"
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Delete failed");
            }

            alert("Customer deleted successfully!");

            loadCustomers();

        } catch (error) {

            console.error("Delete Error:", error);

            alert("Error deleting customer: " + error.message);

        }

    });


    actionCell.appendChild(editButton);
    actionCell.appendChild(deleteButton);

    row.appendChild(actionCell);

    tableBody.appendChild(row);

}


// LOAD CUSTOMERS WHEN PAGE OPENS
loadCustomers();
