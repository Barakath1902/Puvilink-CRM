
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

            // Update button
            const updateCell = document.createElement("td");
            const updateButton = document.createElement("button");

            updateButton.textContent = "Update";

            updateButton.addEventListener("click", function () {

    window.location.href =
        "/create-enquiry?enquiry_no=" +
        encodeURIComponent(enquiry.enquiry_no);

});

            updateCell.appendChild(updateButton);
            row.appendChild(updateCell);

            // Delete button
            const deleteCell = document.createElement("td");
            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function () {
                deleteEnquiry(enquiry.enquiry_no);
            });

            deleteCell.appendChild(deleteButton);
            row.appendChild(deleteCell);

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error:", error);
        alert("Error loading enquiries: " + error.message);
    }
}

// Update an enquiry
async function updateEnquiry(enquiry) {

    // Ask the user for updated details
    const enquiryDate = prompt(
        "Enter Enquiry Date (YYYY-MM-DD):",
        enquiry.enquiry_date
            ? String(enquiry.enquiry_date).slice(0, 10)
            : ""
    );

    if (enquiryDate === null) return;

    const companyName = prompt(
        "Enter Company Name:",
        enquiry.company_name || ""
    );

    if (companyName === null) return;

    const mobileNo = prompt(
        "Enter Phone Number:",
        enquiry.mobile_no || ""
    );

    if (mobileNo === null) return;

    const leadSource = prompt(
        "Enter Lead Source:",
        enquiry.lead_source || ""
    );

    if (leadSource === null) return;

    const enquiryCategory = prompt(
        "Enter Enquiry Category:",
        enquiry.enquiry_category || ""
    );

    if (enquiryCategory === null) return;

    const updatedData = {
        enquiry_date: enquiryDate,
        company_name: companyName,
        mobile_no: mobileNo,
        lead_source: leadSource,
        enquiry_category: enquiryCategory
    };

    try {
        const response = await fetch(
            "/update-enquiry/" + encodeURIComponent(enquiry.enquiry_no),
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to update enquiry");
        }

        alert("Enquiry updated successfully!");

        // Refresh the table
        loadEnquiries();

    } catch (error) {
        console.error("Update Error:", error);
        alert("Error: " + error.message);
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
