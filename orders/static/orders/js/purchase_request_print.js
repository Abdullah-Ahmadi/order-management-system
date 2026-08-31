"use strict";


/* =========================================================
   PURCHASE REQUEST PRINTING
========================================================= */

function initializePurchaseRequestPrinting() {

    const copyInput =
        document.getElementById(
            "purchase-request-copy-count"
        );


    const printButton =
        document.getElementById(
            "purchase-request-print-button"
        );


    const pageTemplate =
        document.getElementById(
            "purchase-request-page-template"
        );


    const pagesContainer =
        document.getElementById(
            "purchase-request-pages"
        );


    if (
        !copyInput ||
        !printButton ||
        !pageTemplate ||
        !pagesContainer
    ) {
        return;
    }


    const minimumCopies = 1;

    const maximumCopies = 10;


    /* =====================================================
       COPY COUNT
    ====================================================== */

    function getCopyCount() {

        let count =
            Number.parseInt(
                copyInput.value,
                10
            );


        if (
            !Number.isInteger(count)
        ) {

            count = 2;

        }


        count = Math.max(
            minimumCopies,
            Math.min(
                maximumCopies,
                count
            )
        );


        return count;

    }


    /* =====================================================
       RENDER COPIES
    ====================================================== */

    function renderCopies() {

        const count =
            getCopyCount();


        pagesContainer.replaceChildren();


        for (
            let copyNumber = 0;
            copyNumber < count;
            copyNumber += 1
        ) {

            const copy =
                pageTemplate.content
                    .cloneNode(true);


            pagesContainer.appendChild(
                copy
            );

        }

    }


    /* =====================================================
       COPY INPUT
    ====================================================== */

    copyInput.addEventListener(
        "input",
        renderCopies
    );


    copyInput.addEventListener(
        "change",
        function () {

            const count =
                getCopyCount();


            copyInput.value =
                count;


            renderCopies();

        }
    );


    /* =====================================================
       PRINT
    ====================================================== */

    printButton.addEventListener(
        "click",
        function () {

            const count =
                getCopyCount();


            copyInput.value =
                count;


            /*
             * Re-render immediately before printing so the
             * number of physical pages always matches the
             * requested copy count.
             */
            renderCopies();


            window.print();

        }
    );


    /* =====================================================
       DEFAULT = 2 COPIES
    ====================================================== */

    renderCopies();

}



/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializePurchaseRequestPrinting
);