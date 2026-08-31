"use strict";


/* =========================================================
   DRIVER LIST LIVE SEARCH
========================================================= */

function initializeDriverLiveSearch() {

    const form =
        document.getElementById(
            "driver-filter-form"
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
            "driver-filter-clear"
        );


    const results =
        document.getElementById(
            "driver-results"
        );


    const statusMessage =
        document.getElementById(
            "driver-filter-status"
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
       REINITIALIZE CONFIRM BUTTONS

       app.js handles confirmations on the initial page.
       After live search replaces the results, the new
       buttons need their listener attached.
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
                        .driverConfirmInitialized
                    === "true"
                ) {
                    return;
                }


                button.dataset
                    .driverConfirmInitialized =
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
            "Updating drivers..."
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
                    "Unable to load drivers."
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
                        "driver-results"
                    );


            if (!newResults) {

                throw new Error(
                    "Driver results were not found."
                );

            }


            results.innerHTML =
                newResults.innerHTML;


            initializeResultConfirmations();


            window.history.replaceState(
                {},
                "",
                url.pathname + url.search
            );


            setStatusMessage("");

        }

        catch (error) {

            if (
                error.name ===
                "AbortError"
            ) {
                return;
            }


            console.error(error);


            setStatusMessage(
                "Could not update the driver list."
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
       TEXT SEARCH
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

        initializeDriverLiveSearch();

    }
);