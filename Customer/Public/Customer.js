
document.addEventListener("DOMContentLoaded", async function () {

    const customerForm = document.getElementById("customerForm");

    if (!customerForm) {
        console.log("Customer form not found.");
        return;
    }

    // CHECK CREATE OR UPDATE MODE
    const params = new URLSearchParams(window.location.search);
    const customerCode = params.get("customer_code");

    const heading = document.querySelector("h3");
    const saveButton = customerForm.querySelector('button[type="submit"]');

    // EDIT MODE
    if (customerCode) {

        heading.textContent = "Update Customer";
        saveButton.textContent = "Update Customer";

        try {

            const response = await fetch(
                "/get-customer/" + encodeURIComponent(customerCode)
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to load customer");
            }

            const customer = result.data;

            document.getElementById("customerCode").value =
                customer.customer_code;

            document.getElementById("customerCode").readOnly = true;

            document.getElementById("customerType").value =
                customer.customer_type;

            document.getElementById("customerName").value =
                customer.customer_name;

            document.getElementById("customerContact").value =
                customer.customer_contact;

            document.getElementById("customerMail").value =
                customer.customer_mail;

            document.getElementById("customerGSTIN").value =
                customer.gstin || "";

            console.log("Customer loaded for editing:", customer);

        } catch (error) {

            alert("Error loading customer: " + error.message);
            window.location.href = "/customer";
            return;

        }

    } else {

        // CREATE MODE
        heading.textContent = "Create Customer";
        saveButton.textContent = "Save Customer";

    }


    // SAVE OR UPDATE CUSTOMER
    customerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const customerData = {

            customer_code: document.getElementById("customerCode").value.trim(),

            customer_type: document.getElementById("customerType").value.trim(),

            customer_name: document.getElementById("customerName").value.trim(),

            customer_contact: document.getElementById("customerContact").value.trim(),

            customer_mail: document.getElementById("customerMail").value.trim(),

            gstin: document.getElementById("customerGSTIN").value.trim()

        };

        try {

            let url;
            let method;

            if (customerCode) {

                // UPDATE EXISTING CUSTOMER
                url = "/update-customer/" +
                    encodeURIComponent(customerCode);

                method = "PUT";

            } else {

                // SAVE NEW CUSTOMER
                url = "/save-customer";

                method = "POST";

            }

            const response = await fetch(url, {

                method: method,

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(customerData)

            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Operation failed");
            }

            if (customerCode) {
                alert("Customer updated successfully!");
            } else {
                alert("Customer saved successfully!");
            }

            window.location.href = "/customer";

        } catch (error) {

            console.error("Customer Error:", error);

            alert("Error: " + error.message);

        }

    });

});
