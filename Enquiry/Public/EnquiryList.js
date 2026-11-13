
// Open the Create Enquiry page
function createEnquiry() {
    window.location.href = "/create-enquiry";
}

// Load enquiries when the page opens
document.addEventListener("DOMContentLoaded", function () {
    loadEnquiries();
});

// Get all enquiries from PostgreSQL
async function loadEnquiries() {
    try {
        const response = await fetch("/get-enquiries");
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to load enquiries");
        }

        const tableBody = document.getElementById("enquiryTableBody");

        tableBody.innerHTML = "";

        result.data.forEach(function (enquiry) {

            const row = document.createElement("tr");

            // Format the date without timezone conversion
            const date = enquiry.enquiry_date
                ? String(enquiry.enquiry_date).slice(0, 10)
                : "";

            const values = [
                enquiry.enquiry_no,
                date,
                enquiry.company_name,
                enquiry.mobile_no,
                enquiry.lead_source,
                enquiry.enquiry_category
            ];

            values.forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });

            // Actions column
            const actionsCell = document.createElement("td");

            // Update button
            const updateButton = document.createElement("button");
            updateButton.textContent = "Edit";

            updateButton.addEventListener("click", function () {
                window.location.href =
                    "/create-enquiry?enquiry_no=" +
                    encodeURIComponent(enquiry.enquiry_no);
            });

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function () {
                deleteEnquiry(enquiry.enquiry_no);
            });

            actionsCell.appendChild(updateButton);
            actionsCell.appendChild(document.createTextNode(" "));
            actionsCell.appendChild(deleteButton);

            row.appendChild(actionsCell);

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error:", error);
        alert("Error loading enquiries: " + error.message);
    }
}

// Delete an enquiry
async function deleteEnquiry(enquiryNo) {

    const confirmDelete = confirm(
        "Are you sure you want to delete enquiry " + enquiryNo + "?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(
            "/delete-enquiry/" + encodeURIComponent(enquiryNo),
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to delete enquiry");
        }

        alert("Enquiry deleted successfully!");

        // Refresh the table
        loadEnquiries();

    } catch (error) {
        console.error("Delete Error:", error);
        alert("Error: " + error.message);
    }
}
