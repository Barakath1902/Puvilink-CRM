
document.addEventListener("DOMContentLoaded", function () {

    const enquiryForm = document.getElementById("enquiryForm");

    // Check whether an enquiry number exists in the URL
    const urlParams = new URLSearchParams(window.location.search);

    const enquiryNo = urlParams.get("enquiry_no");

    // If enquiry number exists, load existing data
    if (enquiryNo) {
document.getElementById("submitButton").textContent = "Update Enquiry";
        document.querySelector("h3").textContent = "Update Enquiry";

        loadEnquiry(enquiryNo);

    }

    // Load existing enquiry details
    async function loadEnquiry(enquiryNo) {

        try {

            const response = await fetch(
                "/get-enquiry/" + encodeURIComponent(enquiryNo)
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to load enquiry");
            }

            const enquiry = result.data;

            // Fill existing values in the form
            document.getElementById("enquiryNo").value =
                enquiry.enquiry_no;

            document.getElementById("enquiryDate").value =
                enquiry.enquiry_date;

            document.getElementById("companyName").value =
                enquiry.company_name;

            document.getElementById("mobileNo").value =
                enquiry.mobile_no;

            document.getElementById("leadSource").value =
                enquiry.lead_source || "";

            document.getElementById("enquiryCategory").value =
                enquiry.enquiry_category || "";

        } catch (error) {

            console.error("Error:", error);

            alert("Error: " + error.message);

        }
    }

    // Save or Update Enquiry
    enquiryForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const enquiryData = {

            enquiry_no: document.getElementById("enquiryNo").value,

            enquiry_date: document.getElementById("enquiryDate").value,

            company_name: document.getElementById("companyName").value,

            mobile_no: document.getElementById("mobileNo").value,

            lead_source: document.getElementById("leadSource").value,

            enquiry_category: document.getElementById("enquiryCategory").value

        };
        console.log("Enquiry Data:", enquiryData);
console.table(enquiryData);

        try {

            let url;
            let method;

            // Decide whether to create or update
            if (enquiryNo) {

                url = "/update-enquiry/" +
                    encodeURIComponent(enquiryNo);

                method = "PUT";

            } else {

                url = "/save-enquiry";

                method = "POST";

            }

            const response = await fetch(url, {

                method: method,

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(enquiryData)

            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to save enquiry");
            }

            if (enquiryNo) {

                alert("Enquiry updated successfully!");

            } else {

                alert("Enquiry saved successfully!");

            }

            // Return to Enquiry List
            window.location.href = "/enquiry";

        } catch (error) {

            console.error("Error:", error);

            alert("Error: " + error.message);

        }

    });

});
