"use strict";


/* =========================================================
   PRODUCT LIST LIVE SEARCH
========================================================= */

function initializeProductLiveSearch() {

    const form =
        document.getElementById(
            "product-filter-form"
        );


    if (!form) {
        return;
    }


    const searchInput =
        document.getElementById(
            "q"
        );


    const packageSelect =
        document.getElementById(
            "package_type"
        );


    const statusSelect =
        document.getElementById(
            "status"
        );


    const clearButton =
        document.getElementById(
            "product-filter-clear"
        );


    const results =
        document.getElementById(
            "product-results"
        );


    const statusMessage =
        document.getElementById(
            "product-filter-status"
        );


    if (
        !searchInput ||
        !packageSelect ||
        !statusSelect ||
        !clearButton ||
        !results
    ) {
        return;
    }


    let debounceTimer = null;

    let activeController = null;


    /* =====================================================
       BUILD SEARCH URL
    ====================================================== */

    function buildUrl() {

        const url =
            new URL(
                form.action,
                window.location.origin
            );


        const search =
            searchInput.value.trim();


        const packageType =
            packageSelect.value;


        const selectedStatus =
            statusSelect.value;


        if (search) {

            url.searchParams.set(
                "q",
                search
            );

        }


        if (packageType) {

            url.searchParams.set(
                "package_type",
                packageType
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
       INITIALIZE CONFIRMATIONS FOR NEW RESULTS

       app.js initializes confirmation buttons when the
       page first loads.

       Live search replaces the result table, so newly
       fetched Activate / Deactivate buttons need their
       confirmation listener initialized again.
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
                        .productConfirmInitialized
                    === "true"
                ) {
                    return;
                }


                button.dataset
                    .productConfirmInitialized =
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
       FETCH RESULTS
    ====================================================== */

    async function updateResults() {

        const url =
            buildUrl();


        /*
         * Cancel an older request if the clerk
         * continues typing before it finishes.
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
            "Updating products..."
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
                    "Unable to load products."
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
                        "product-results"
                    );


            if (!newResults) {

                throw new Error(
                    "Product results were not found."
                );

            }


            results.innerHTML =
                newResults.innerHTML;


            /*
             * Reinitialize confirmation buttons that
             * came from the newly fetched table.
             */

            initializeResultConfirmations();


            /*
             * Keep the URL synchronized with the
             * currently displayed filters.
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
             * An aborted request simply means that
             * a newer search request replaced it.
             */

            if (
                error.name ===
                "AbortError"
            ) {
                return;
            }


            console.error(error);


            setStatusMessage(
                "Could not update the product list."
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
       PACKAGE FILTER
    ====================================================== */

    packageSelect.addEventListener(
        "change",
        function () {

            window.clearTimeout(
                debounceTimer
            );


            updateResults();

        }
    );


    /* =====================================================
       STATUS FILTER
    ====================================================== */

    statusSelect.addEventListener(
        "change",
        function () {

            window.clearTimeout(
                debounceTimer
            );


            updateResults();

        }
    );


    /* =====================================================
       NORMAL FORM SUBMISSION

       The form still works normally without JavaScript.
       With JavaScript enabled, submission simply uses
       the same live-update mechanism.
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

            packageSelect.value = "";

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

        initializeProductLiveSearch();

    }
);