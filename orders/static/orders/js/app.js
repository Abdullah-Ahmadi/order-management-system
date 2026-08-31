"use strict";


/* =========================================================
   OMS GLOBAL JAVASCRIPT

   Page-specific behavior belongs in dedicated files such as:

   order_form.js
   dispatch_form.js
   product_list.js
   driver_list.js
   truck_list.js
   distributor_list.js
   territory_list.js
   user_list.js

   This file contains only behavior shared by the whole OMS.
========================================================= */


/* =========================================================
   NAVIGATION DROPDOWNS
========================================================= */

function initializeNavigationDropdowns() {

    const dropdowns =
        document.querySelectorAll(
            ".nav-dropdown"
        );


    if (!dropdowns.length) {
        return;
    }


    /*
     * Desktop/laptop devices with a real mouse normally
     * support both hover and a precise pointer.
     *
     * Phones/tablets normally do not match this query,
     * so their native <details> tap behavior remains intact.
     */
    const hoverMediaQuery =
        window.matchMedia(
            "(hover: hover) and (pointer: fine)"
        );


    /* =====================================================
       CLOSE OTHER MENUS
    ====================================================== */

    function closeOtherDropdowns(
        currentDropdown
    ) {

        dropdowns.forEach(
            function (dropdown) {

                if (
                    dropdown !==
                    currentDropdown
                ) {

                    dropdown.open =
                        false;

                }

            }
        );

    }



    /* =====================================================
       CLOSE ALL MENUS
    ====================================================== */

    function closeAllDropdowns() {

        dropdowns.forEach(
            function (dropdown) {

                dropdown.open =
                    false;

            }
        );

    }



    /* =====================================================
       INITIALIZE EACH DROPDOWN
    ====================================================== */

    dropdowns.forEach(
        function (dropdown) {

            const summary =
                dropdown.querySelector(
                    ".nav-summary"
                );


            /* =============================================
               DESKTOP: OPEN ON HOVER
            ============================================= */

            dropdown.addEventListener(
                "mouseenter",
                function () {

                    if (
                        !hoverMediaQuery.matches
                    ) {
                        return;
                    }


                    closeOtherDropdowns(
                        dropdown
                    );


                    dropdown.open =
                        true;

                }
            );



            /* =============================================
               DESKTOP: CLOSE WHEN MOUSE LEAVES
            ============================================= */

            dropdown.addEventListener(
                "mouseleave",
                function () {

                    if (
                        !hoverMediaQuery.matches
                    ) {
                        return;
                    }


                    dropdown.open =
                        false;

                }
            );



            /* =============================================
               DESKTOP: PREVENT CLICK FROM CLOSING A
               HOVER-OPENED MENU

               On touch devices this is NOT prevented,
               allowing normal tap-to-open / tap-to-close.
            ============================================= */

            if (summary) {

                summary.addEventListener(
                    "click",
                    function (event) {

                        if (
                            !hoverMediaQuery.matches
                        ) {
                            return;
                        }


                        event.preventDefault();


                        closeOtherDropdowns(
                            dropdown
                        );


                        dropdown.open =
                            true;

                    }
                );

            }



            /* =============================================
               TOUCH / TABLET

               Native <details> handles tapping.

               When one dropdown opens, close the other one.
            ============================================= */

            dropdown.addEventListener(
                "toggle",
                function () {

                    if (
                        dropdown.open
                    ) {

                        closeOtherDropdowns(
                            dropdown
                        );

                    }

                }
            );



            /* =============================================
               KEYBOARD SUPPORT ON DESKTOP

               When keyboard focus enters a dropdown,
               keep it available. When focus leaves the
               entire dropdown, close it.
            ============================================= */

            dropdown.addEventListener(
                "focusin",
                function () {

                    if (
                        !hoverMediaQuery.matches
                    ) {
                        return;
                    }


                    closeOtherDropdowns(
                        dropdown
                    );


                    dropdown.open =
                        true;

                }
            );


            dropdown.addEventListener(
                "focusout",
                function (event) {

                    if (
                        !hoverMediaQuery.matches
                    ) {
                        return;
                    }


                    const nextElement =
                        event.relatedTarget;


                    if (
                        nextElement &&
                        dropdown.contains(
                            nextElement
                        )
                    ) {
                        return;
                    }


                    /*
                     * If the mouse is still over the dropdown,
                     * mouseleave will close it later.
                     */
                    if (
                        dropdown.matches(
                            ":hover"
                        )
                    ) {
                        return;
                    }


                    dropdown.open =
                        false;

                }
            );

        }
    );



    /* =====================================================
       CLICK / TAP OUTSIDE

       Particularly useful on phones and tablets.
    ====================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const clickedDropdown =
                event.target.closest(
                    ".nav-dropdown"
                );


            if (!clickedDropdown) {

                closeAllDropdowns();

            }

        }
    );



    /* =====================================================
       ESCAPE KEY

       Lets keyboard users close an open menu quickly.
    ====================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }


            closeAllDropdowns();


            const activeElement =
                document.activeElement;


            if (
                activeElement &&
                typeof activeElement.blur ===
                    "function"
            ) {

                activeElement.blur();

            }

        }
    );



    /* =====================================================
       DEVICE MODE CHANGE

       Useful for convertible laptops/tablets.

       When the device changes between mouse and touch
       behavior, close any menu left open from the previous
       interaction mode.
    ====================================================== */

    function handlePointerModeChange() {

        closeAllDropdowns();

    }


    if (
        typeof hoverMediaQuery
            .addEventListener
        === "function"
    ) {

        hoverMediaQuery.addEventListener(
            "change",
            handlePointerModeChange
        );

    }

}



/* =========================================================
   PRINT BUTTONS
========================================================= */

function initializePrintButtons() {

    const printButtons =
        document.querySelectorAll(
            "[data-print]"
        );


    printButtons.forEach(
        function (button) {

            if (
                button.dataset
                    .printInitialized
                === "true"
            ) {
                return;
            }


            button.dataset
                .printInitialized =
                "true";


            button.addEventListener(
                "click",
                function () {

                    window.print();

                }
            );

        }
    );

}



/* =========================================================
   CONFIRMATION DIALOGS
========================================================= */

function initializeConfirmations() {

    const elements =
        document.querySelectorAll(
            "[data-confirm]"
        );


    elements.forEach(
        function (element) {

            if (
                element.dataset
                    .globalConfirmInitialized
                === "true"
            ) {
                return;
            }


            element.dataset
                .globalConfirmInitialized =
                "true";


            element.addEventListener(
                "click",
                function (event) {

                    const message =
                        (
                            element.dataset
                                .confirm
                            ||
                            ""
                        ).trim();


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



/* =========================================================
   SUCCESS MESSAGES
========================================================= */

function initializeMessages() {

    const messages =
        document.querySelectorAll(
            ".message-success"
        );


    messages.forEach(
        function (message) {

            if (
                message.dataset
                    .autoHideInitialized
                === "true"
            ) {
                return;
            }


            message.dataset
                .autoHideInitialized =
                "true";


            window.setTimeout(
                function () {

                    message.style.transition =
                        "opacity 0.4s ease";


                    message.style.opacity =
                        "0";


                    window.setTimeout(
                        function () {

                            message.remove();

                        },
                        400
                    );

                },
                4000
            );

        }
    );

}



/* =========================================================
   DOUBLE-SUBMISSION PROTECTION
========================================================= */

function initializeFormSubmissionProtection() {

    const forms =
        document.querySelectorAll(
            "form[data-prevent-double-submit]"
        );


    forms.forEach(
        function (form) {

            if (
                form.dataset
                    .submissionProtectionInitialized
                === "true"
            ) {
                return;
            }


            form.dataset
                .submissionProtectionInitialized =
                "true";


            form.addEventListener(
                "submit",
                function () {

                    const submitButtons =
                        form.querySelectorAll(
                            'button[type="submit"], '
                            +
                            'input[type="submit"]'
                        );


                    submitButtons.forEach(
                        function (button) {

                            button.disabled =
                                true;

                        }
                    );

                }
            );

        }
    );

}



/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeNavigationDropdowns();

        initializePrintButtons();

        initializeConfirmations();

        initializeMessages();

        initializeFormSubmissionProtection();

    }
);