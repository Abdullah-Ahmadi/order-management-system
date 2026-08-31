"use strict";


/* =========================================================
   TERRITORY LIST LIVE SEARCH
========================================================= */

function initializeTerritoryLiveSearch() {

    const form =
        document.getElementById(
            "territory-filter-form"
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
            "territory-filter-clear"
        );


    const results =
        document.getElementById(
            "territory-results"
        );


    const statusMessage =
        document.getElementById(
            "territory-filter-status"
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
       CONFIRMATION BUTTONS FOR LIVE RESULTS
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
                        .territoryConfirmInitialized
                    === "true"
                ) {
                    return;
                }


                button.dataset
                    .territoryConfirmInitialized =
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
         * Cancel an older request if the clerk
         * changes the search before it finishes.
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
            "Updating territories..."
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
                    "Unable to load territories."
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
                        "territory-results"
                    );


            if (!newResults) {

                throw new Error(
                    "Territory results were not found."
                );

            }


            results.innerHTML =
                newResults.innerHTML;


            /*
             * Activate / Deactivate buttons inside
             * the newly fetched results need their
             * confirmation listeners.
             */

            initializeResultConfirmations();


            /*
             * Keep the browser URL synchronized with
             * the currently displayed filters.
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
             * AbortError means a newer search
             * replaced this request.
             */

            if (
                error.name ===
                "AbortError"
            ) {
                return;
            }


            console.error(error);


            setStatusMessage(
                "Could not update the territory list."
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

        initializeTerritoryLiveSearch();

    }
);