"use strict";


/* =========================================================
   TRUCK LIST LIVE SEARCH
========================================================= */

function initializeTruckLiveSearch() {

    const form =
        document.getElementById(
            "truck-filter-form"
        );


    if (!form) {
        return;
    }


    const searchInput =
        document.getElementById(
            "q"
        );


    const statusSelect =
        document.getElementById(
            "status"
        );


    const clearButton =
        document.getElementById(
            "truck-filter-clear"
        );


    const results =
        document.getElementById(
            "truck-results"
        );


    const statusMessage =
        document.getElementById(
            "truck-filter-status"
        );


    if (
        !searchInput ||
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


        const selectedStatus =
            statusSelect.value;


        if (search) {

            url.searchParams.set(
                "q",
                search
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
       CONFIRMATION BUTTONS

       app.js initializes the buttons when the page
       originally loads.

       Live search replaces the results table, so newly
       loaded Activate / Deactivate buttons need their
       confirmation behavior initialized as well.
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
                        .truckConfirmInitialized
                    === "true"
                ) {
                    return;
                }


                button.dataset
                    .truckConfirmInitialized =
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
         * Cancel an older request if another
         * search starts before it finishes.
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
            "Updating trucks..."
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
                    "Unable to load trucks."
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
                        "truck-results"
                    );


            if (!newResults) {

                throw new Error(
                    "Truck results were not found."
                );

            }


            results.innerHTML =
                newResults.innerHTML;


            /*
             * Reinitialize confirmation buttons
             * inserted by the live search.
             */

            initializeResultConfirmations();


            /*
             * Keep the browser URL synchronized
             * with the displayed results.
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
                "Could not update the truck list."
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
       FORM FALLBACK
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
       CLEAR
    ====================================================== */

    clearButton.addEventListener(
        "click",
        function () {

            window.clearTimeout(
                debounceTimer
            );


            searchInput.value = "";

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

        initializeTruckLiveSearch();

    }
);