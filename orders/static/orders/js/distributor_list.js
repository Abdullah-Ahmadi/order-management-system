"use strict";


/* =========================================================
   CUSTOMER / DISTRIBUTOR LIST LIVE SEARCH
========================================================= */

function initializeCustomerLiveSearch() {

    const form =
        document.getElementById(
            "customer-filter-form"
        );


    if (!form) {
        return;
    }


    const searchInput =
        document.getElementById(
            "q"
        );


    const customerTypeSelect =
        document.getElementById(
            "customer_type"
        );


    const paymentSelect =
        document.getElementById(
            "payment_status"
        );


    const statusSelect =
        document.getElementById(
            "status"
        );


    const clearButton =
        document.getElementById(
            "customer-filter-clear"
        );


    const results =
        document.getElementById(
            "customer-results"
        );


    const statusMessage =
        document.getElementById(
            "customer-filter-status"
        );


    if (
        !searchInput ||
        !customerTypeSelect ||
        !paymentSelect ||
        !statusSelect ||
        !clearButton ||
        !results
    ) {
        return;
    }


    let debounceTimer = null;

    let activeController = null;


    /* =====================================================
       BUILD URL
    ====================================================== */

    function buildUrl() {

        const url =
            new URL(
                form.action,
                window.location.origin
            );


        const search =
            searchInput.value.trim();


        const customerType =
            customerTypeSelect.value;


        const paymentStatus =
            paymentSelect.value;


        const selectedStatus =
            statusSelect.value;


        if (search) {

            url.searchParams.set(
                "q",
                search
            );

        }


        if (customerType) {

            url.searchParams.set(
                "customer_type",
                customerType
            );

        }


        if (paymentStatus) {

            url.searchParams.set(
                "payment_status",
                paymentStatus
            );

        }


        if (selectedStatus) {

            url.searchParams.set(
                "status",
                selectedStatus
            );

        }


        return url;

    }


    /* =====================================================
       STATUS MESSAGE
    ====================================================== */

    function setStatusMessage(text) {

        if (!statusMessage) {
            return;
        }


        statusMessage.textContent =
            text;

    }


    /* =====================================================
       CONFIRMATIONS FOR LIVE RESULTS
    ====================================================== */

    function initializeResultConfirmations() {

        const confirmationButtons =
            results.querySelectorAll(
                "[data-confirm]"
            );


        confirmationButtons.forEach(
            function (button) {

                if (
                    button.dataset
                        .customerConfirmInitialized
                    === "true"
                ) {
                    return;
                }


                button.dataset
                    .customerConfirmInitialized =
                    "true";


                button.addEventListener(
                    "click",
                    function (event) {

                        const message =
                            button.dataset
                                .confirm
                                .trim();


                        if (!message) {
                            return;
                        }


                        if (
                            !window.confirm(
                                message
                            )
                        ) {

                            event.preventDefault();

                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       UPDATE RESULTS
    ====================================================== */

    async function updateResults() {

        const url =
            buildUrl();


        /*
         * Cancel an older request when the user
         * changes the search or filters again.
         */

        if (activeController) {

            activeController.abort();

        }


        const controller =
            new AbortController();


        activeController =
            controller;


        results.setAttribute(
            "aria-busy",
            "true"
        );


        setStatusMessage(
            "Updating customers..."
        );


        try {

            const response =
                await fetch(
                    url.toString(),
                    {
                        method: "GET",

                        headers: {
                            "X-Requested-With":
                                "XMLHttpRequest"
                        },

                        signal:
                            controller.signal,
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to load customers."
                );

            }


            const html =
                await response.text();


            const parser =
                new DOMParser();


            const responseDocument =
                parser.parseFromString(
                    html,
                    "text/html"
                );


            const newResults =
                responseDocument
                    .getElementById(
                        "customer-results"
                    );


            if (!newResults) {

                throw new Error(
                    "Customer results were not found."
                );

            }


            results.innerHTML =
                newResults.innerHTML;


            /*
             * Newly loaded Activate / Deactivate
             * buttons need confirmation behavior.
             */

            initializeResultConfirmations();


            /*
             * Keep the browser URL synchronized
             * with the current filters.
             */

            window.history.replaceState(
                {},
                "",
                url.pathname + url.search
            );


            setStatusMessage("");

        }

        catch (error) {

            /*
             * AbortError simply means a newer
             * search request replaced this one.
             */

            if (
                error.name ===
                "AbortError"
            ) {
                return;
            }


            console.error(error);


            setStatusMessage(
                "Could not update the customer list."
            );

        }

        finally {

            if (
                activeController ===
                controller
            ) {

                results.setAttribute(
                    "aria-busy",
                    "false"
                );


                activeController = null;

            }

        }

    }


    /* =====================================================
       SEARCH WHILE TYPING
    ====================================================== */

    function queueSearch() {

        window.clearTimeout(
            debounceTimer
        );


        debounceTimer =
            window.setTimeout(
                updateResults,
                250
            );

    }


    searchInput.addEventListener(
        "input",
        queueSearch
    );


    /* =====================================================
       SELECT FILTERS
    ====================================================== */

    const filterSelects = [
        customerTypeSelect,
        paymentSelect,
        statusSelect,
    ];


    filterSelects.forEach(
        function (select) {

            select.addEventListener(
                "change",
                function () {

                    window.clearTimeout(
                        debounceTimer
                    );


                    updateResults();

                }
            );

        }
    );


    /* =====================================================
       NORMAL FORM SUBMISSION
    ====================================================== */

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            window.clearTimeout(
                debounceTimer
            );


            updateResults();

        }
    );


    /* =====================================================
       CLEAR FILTERS
    ====================================================== */

    clearButton.addEventListener(
        "click",
        function () {

            window.clearTimeout(
                debounceTimer
            );


            searchInput.value = "";

            customerTypeSelect.value = "";

            paymentSelect.value = "";

            statusSelect.value = "";


            searchInput.focus();


            updateResults();

        }
    );

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeCustomerLiveSearch();

    }
);