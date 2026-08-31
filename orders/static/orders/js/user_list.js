"use strict";


function initializeUserLiveSearch() {

    const form =
        document.getElementById(
            "user-filter-form"
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
            "user-filter-clear"
        );


    const results =
        document.getElementById(
            "user-results"
        );


    const statusMessage =
        document.getElementById(
            "user-filter-status"
        );


    let debounceTimer = null;

    let activeController = null;



    function buildUrl() {

        const url =
            new URL(
                form.action,
                window.location.origin
            );


        const search =
            searchInput.value.trim();


        if (search) {

            url.searchParams.set(
                "q",
                search
            );

        }


        if (statusSelect.value) {

            url.searchParams.set(
                "status",
                statusSelect.value
            );

        }


        return url;

    }



    function setStatusMessage(text) {

        if (statusMessage) {

            statusMessage.textContent =
                text;

        }

    }



    function initializeConfirmations() {

        results
            .querySelectorAll(
                "[data-confirm]"
            )
            .forEach(
                function (button) {

                    if (
                        button.dataset
                            .userConfirmInitialized
                        === "true"
                    ) {
                        return;
                    }


                    button.dataset
                        .userConfirmInitialized =
                        "true";


                    button.addEventListener(
                        "click",
                        function (event) {

                            const message =
                                button.dataset
                                    .confirm
                                    .trim();


                            if (
                                message &&
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


        setStatusMessage(
            "Updating users..."
        );


        try {

            const response =
                await fetch(
                    url.toString(),
                    {
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
                    "Unable to load users."
                );

            }


            const html =
                await response.text();


            const documentParser =
                new DOMParser()
                    .parseFromString(
                        html,
                        "text/html"
                    );


            const newResults =
                documentParser
                    .getElementById(
                        "user-results"
                    );


            if (!newResults) {

                throw new Error(
                    "User results not found."
                );

            }


            results.innerHTML =
                newResults.innerHTML;


            initializeConfirmations();


            window.history.replaceState(
                {},
                "",
                url.pathname
                +
                url.search
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
                "Could not update the user list."
            );

        }

        finally {

            if (
                activeController ===
                controller
            ) {

                activeController = null;

            }

        }

    }



    searchInput.addEventListener(
        "input",
        function () {

            window.clearTimeout(
                debounceTimer
            );


            debounceTimer =
                window.setTimeout(
                    updateResults,
                    250
                );

        }
    );


    statusSelect.addEventListener(
        "change",
        updateResults
    );


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            updateResults();

        }
    );


    clearButton.addEventListener(
        "click",
        function () {

            searchInput.value = "";

            statusSelect.value = "";

            searchInput.focus();

            updateResults();

        }
    );

}


document.addEventListener(
    "DOMContentLoaded",
    initializeUserLiveSearch
);