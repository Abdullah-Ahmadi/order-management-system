"use strict";


/* =========================================================
   DISPATCH LIST
========================================================= */

function initializeDispatchLiveSearch() {

    const form =
        document.getElementById(
            "dispatch-filter-form"
        );

    if (!form) {
        return;
    }


    const searchInput =
        document.getElementById("q");

    const dateInput =
        document.getElementById("date");

    const clearButton =
        document.getElementById(
            "dispatch-filter-clear"
        );

    const results =
        document.getElementById(
            "dispatch-results"
        );

    const status =
        document.getElementById(
            "dispatch-filter-status"
        );


    if (
        !searchInput
        ||
        !dateInput
        ||
        !clearButton
        ||
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


        const date =
            dateInput.value;


        if (search) {

            url.searchParams.set(
                "q",
                search
            );

        }


        if (date) {

            url.searchParams.set(
                "date",
                date
            );

        }


        return url;

    }


    /* =====================================================
       STATUS
    ====================================================== */

    function setStatus(text) {

        if (status) {
            status.textContent = text;
        }

    }


    /* =====================================================
       UPDATE RESULTS
    ====================================================== */

    async function updateResults() {

        const url =
            buildUrl();


        /*
         * Cancel the previous request when the
         * clerk continues typing.
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


        setStatus(
            "Updating results..."
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
                    "Unable to load dispatches."
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
                        "dispatch-results"
                    );


            if (!newResults) {

                throw new Error(
                    "Dispatch results were not found."
                );

            }


            results.innerHTML =
                newResults.innerHTML;


            /*
             * Keep the browser URL synchronized
             * without refreshing the page.
             */

            window.history.replaceState(
                {},
                "",
                url.pathname + url.search
            );


            setStatus("");

        }

        catch (error) {

            /*
             * An aborted request simply means a
             * newer search has started.
             */

            if (
                error.name ===
                "AbortError"
            ) {
                return;
            }


            console.error(error);


            setStatus(
                "Could not update the dispatch list."
            );

        }

        finally {

            /*
             * Do not let an old aborted request
             * clear the loading state of a newer
             * request.
             */

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
       DEBOUNCED SEARCH
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


    /*
     * Text updates while typing.
     */

    searchInput.addEventListener(
        "input",
        queueSearch
    );


    /*
     * Date updates immediately.
     */

    dateInput.addEventListener(
        "change",
        function () {

            window.clearTimeout(
                debounceTimer
            );


            updateResults();

        }
    );


    /*
     * Keep standard GET form behavior as a
     * fallback if JavaScript is unavailable.
     */

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

            dateInput.value = "";


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

        initializeDispatchLiveSearch();

    }
);