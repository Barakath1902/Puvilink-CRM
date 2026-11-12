
document.addEventListener("DOMContentLoaded", async function () {

    const quotationForm = document.getElementById("quotationForm");

    if (!quotationForm) {
        console.log("Quotation form not found.");
        return;
    }

    // Check whether this is a new quotation or an existing quotation
    const params = new URLSearchParams(window.location.search);
    const quotationNo = params.get("quotation_no");

    const heading = document.querySelector("h3");
    const saveButton = quotationForm.querySelector('button[type="submit"]');

    // EDIT MODE
    if (quotationNo) {

        heading.textContent = "Update Quotation";
        saveButton.textContent = "Update Quotation";

        try {

            const response = await fetch(
                "/get-quotation/" + encodeURIComponent(quotationNo)
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to load quotation");
            }

            const quotation = result.data;

            document.getElementById("quotationNo").value =
                quotation.quotation_no;

            document.getElementById("quotationNo").readOnly = true;

            document.getElementById("proposalDate").value =
                quotation.proposal_date;

            document.getElementById("quotationStatus").value =
                quotation.status;

            document.getElementById("quotationCustomer").value =
                quotation.customer_name;

            document.getElementById("quotationContact").value =
                quotation.cust_contact;

            document.getElementById("quotationMail").value =
                quotation.cust_mail;

            document.getElementById("quotationGSTIN").value =
                quotation.gstin || "";

            console.log("Quotation loaded for editing:", quotation);

        } catch (error) {

            alert("Error loading quotation: " + error.message);
            window.location.href = "/quotation";
            return;

        }

    } else {

        // CREATE MODE
        heading.textContent = "Create Quotation";
        saveButton.textContent = "Save Quotation";

    }


    // SAVE OR UPDATE FORM
    quotationForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const quotationData = {

            quotation_no: document.getElementById("quotationNo").value.trim(),

            proposal_date: document.getElementById("proposalDate").value,

            status: document.getElementById("quotationStatus").value,

            customer_name: document.getElementById("quotationCustomer").value.trim(),

            cust_contact: document.getElementById("quotationContact").value.trim(),

            cust_mail: document.getElementById("quotationMail").value.trim(),

            gstin: document.getElementById("quotationGSTIN").value.trim()

        };


        try {

            let url;
            let method;

            if (quotationNo) {

                // Update existing quotation
                url = "/update-quotation/" +
                    encodeURIComponent(quotationNo);

                method = "PUT";

            } else {

                // Save new quotation
                url = "/save-quotation";

                method = "POST";

            }

            const response = await fetch(url, {

                method: method,

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(quotationData)

            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Operation failed");
            }

            if (quotationNo) {
                alert("Quotation updated successfully!");
            } else {
                alert("Quotation saved successfully!");
            }

            window.location.href = "/quotation";

        } catch (error) {

            console.error("Quotation Error:", error);

            alert("Error: " + error.message);

        }

    });

});
