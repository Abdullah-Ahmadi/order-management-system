"use strict";


/* =========================================================
   ORDER FORM
========================================================= */


function initializeOrderForm() {

    const territorySelect =
        document.querySelector(
            "[data-order-territory-filter]"
        );

    const customerSelect =
        document.querySelector(
            "[data-order-distributor-select]"
        );

    const formset =
        document.getElementById(
            "order-products-formset"
        );

    const rowsContainer =
        document.getElementById(
            "order-product-rows"
        );

    const addButton =
        document.getElementById(
            "order-add-product"
        );

    const emptyTemplate =
        document.getElementById(
            "order-product-empty-form"
        );

    const totalCasesElement =
        document.getElementById(
            "order-live-total-cases"
        );

    const totalWeightElement =
        document.getElementById(
            "order-live-total-weight"
        );

    const priceTypeElement =
        document.getElementById(
            "order-live-price-type"
        );

    const invoiceElement =
        document.getElementById(
            "order-live-invoice"
        );


    if (
        !territorySelect ||
        !customerSelect ||
        !formset ||
        !rowsContainer ||
        !addButton ||
        !emptyTemplate ||
        !totalCasesElement ||
        !totalWeightElement ||
        !priceTypeElement ||
        !invoiceElement
    ) {

        console.error(
            "OMS Order Form: required page elements were not found."
        );

        return;
    }


    const prefix =
        formset.dataset.orderFormsetPrefix;


    const totalFormsInput =
        document.getElementById(
            `id_${prefix}-TOTAL_FORMS`
        );


    if (!totalFormsInput) {

        console.error(
            "OMS Order Form: Django TOTAL_FORMS field was not found."
        );

        return;
    }



    /* =====================================================
       NUMBER HELPERS
    ====================================================== */

    function numberValue(value) {

        const parsed =
            Number.parseFloat(
                value
            );


        return Number.isFinite(parsed)
            ? parsed
            : 0;

    }


    function formatNumber(
        value,
        decimals
    ) {

        return new Intl.NumberFormat(
            "en-US",
            {
                minimumFractionDigits:
                    decimals,

                maximumFractionDigits:
                    decimals,
            }
        ).format(
            value
        );

    }


    function formatMoney(value) {

        return (
            "AFN "
            +
            new Intl.NumberFormat(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }
            ).format(value)
        );

    }



    /* =====================================================
       TERRITORIES
    ====================================================== */

    const usedTerritories =
        new Set();


    Array.from(
        territorySelect.options
    ).forEach(
        function (option) {

            if (!option.value) {
                return;
            }


            if (
                usedTerritories.has(
                    option.value
                )
            ) {

                option.remove();

            }

            else {

                usedTerritories.add(
                    option.value
                );

            }

        }
    );



    /* =====================================================
       CUSTOMERS
    ====================================================== */

    const customerOptions =
        Array.from(
            customerSelect.options
        )
        .filter(
            function (option) {

                return Boolean(
                    option.value
                );

            }
        )
        .map(
            function (option) {

                return option.cloneNode(
                    true
                );

            }
        );


    function selectedCustomerOption() {

        const option =
            customerSelect
                .selectedOptions[0];


        if (
            !option ||
            !option.value
        ) {
            return null;
        }


        return option;

    }


    function customerType() {

        const option =
            selectedCustomerOption();


        if (!option) {
            return "";
        }


        return (
            option.dataset.customerType
            || ""
        );

    }


    function synchronizeTerritoryFromCustomer() {

        const option =
            selectedCustomerOption();


        if (
            option &&
            option.dataset.territoryId
        ) {

            territorySelect.value =
                option.dataset.territoryId;

        }

    }


    function filterCustomers(
        preserveCurrent
    ) {

        const territoryId =
            territorySelect.value;


        const previousCustomer =
            preserveCurrent
                ? customerSelect.value
                : "";


        customerSelect.innerHTML = "";


        const placeholder =
            document.createElement(
                "option"
            );

        placeholder.value = "";

        placeholder.textContent =
            "---------";


        customerSelect.appendChild(
            placeholder
        );


        const matches =
            customerOptions.filter(
                function (option) {

                    if (!territoryId) {
                        return true;
                    }


                    return (
                        option.dataset
                            .territoryId
                        ===
                        territoryId
                    );

                }
            );


        matches.forEach(
            function (option) {

                customerSelect.appendChild(
                    option.cloneNode(true)
                );

            }
        );


        if (
            previousCustomer &&
            Array.from(
                customerSelect.options
            ).some(
                function (option) {

                    return (
                        option.value ===
                        previousCustomer
                    );

                }
            )
        ) {

            customerSelect.value =
                previousCustomer;

        }

        else if (
            territoryId &&
            matches.length === 1
        ) {

            customerSelect.value =
                matches[0].value;

        }

        else {

            customerSelect.value = "";

        }


        calculateOrder();

    }



    /* =====================================================
       FORMSET ROW HELPERS
    ====================================================== */

    function rows() {

        return Array.from(
            rowsContainer.querySelectorAll(
                ".order-product-row"
            )
        );

    }


    function productSelect(row) {

        return row.querySelector(
            'select[name$="-product"]'
        );

    }


    function quantityInput(row) {

        return row.querySelector(
            'input[name$="-quantity"]'
        );

    }


    function deleteInput(row) {

        return row.querySelector(
            'input[name$="-DELETE"]'
        );

    }


    function isSaved(row) {

        return (
            row.dataset.savedRow ===
            "true"
        );

    }


    function isDeleted(row) {

        const field =
            deleteInput(row);


        return Boolean(
            field &&
            field.checked
        );

    }


    function rowContainsData(row) {

        const product =
            productSelect(row);

        const quantity =
            quantityInput(row);


        return Boolean(
            isSaved(row)
            ||
            (
                product &&
                product.value
            )
            ||
            (
                quantity &&
                quantity.value
            )
        );

    }



    /* =====================================================
       PREPARE INITIAL EXTRA FORMS
    ====================================================== */

    function prepareInitialRows() {

        const currentRows =
            rows();


        const meaningful =
            currentRows.filter(
                rowContainsData
            );


        currentRows.forEach(
            function (row) {

                if (
                    !isSaved(row) &&
                    !rowContainsData(row)
                ) {

                    row.hidden = true;

                }

            }
        );


        if (
            meaningful.length === 0
        ) {

            const firstBlank =
                currentRows.find(
                    function (row) {

                        return !isSaved(row);

                    }
                );


            if (firstBlank) {

                firstBlank.hidden =
                    false;

            }

        }

    }



    /* =====================================================
       DJANGO EMPTY FORM
    ====================================================== */

    function replacePrefix(
        element,
        index
    ) {

        Array.from(
            element.attributes
        ).forEach(
            function (attribute) {

                if (
                    attribute.value.includes(
                        "__prefix__"
                    )
                ) {

                    element.setAttribute(
                        attribute.name,
                        attribute.value.replace(
                            /__prefix__/g,
                            index
                        )
                    );

                }

            }
        );

    }


    function prepareFragment(
        fragment,
        index
    ) {

        const row =
            fragment.querySelector(
                ".order-product-row"
            );


        if (!row) {
            return null;
        }


        replacePrefix(
            row,
            index
        );


        row.querySelectorAll(
            "*"
        ).forEach(
            function (element) {

                replacePrefix(
                    element,
                    index
                );

            }
        );


        return row;

    }



    /* =====================================================
       ADD PRODUCT
    ====================================================== */

    function addProduct() {

        const reusable =
            rows().find(
                function (row) {

                    return (
                        row.hidden &&
                        !isSaved(row) &&
                        !rowContainsData(row)
                    );

                }
            );


        if (reusable) {

            reusable.hidden = false;


            const product =
                productSelect(
                    reusable
                );


            if (product) {
                product.focus();
            }


            calculateOrder();

            return;

        }


        const index =
            Number.parseInt(
                totalFormsInput.value,
                10
            );


        if (
            !Number.isInteger(index)
        ) {
            return;
        }


        const fragment =
            emptyTemplate
                .content
                .cloneNode(true);


        const newRow =
            prepareFragment(
                fragment,
                index
            );


        if (!newRow) {
            return;
        }


        rowsContainer.appendChild(
            fragment
        );


        totalFormsInput.value =
            index + 1;


        const product =
            productSelect(
                newRow
            );


        if (product) {
            product.focus();
        }


        calculateOrder();

    }



    /* =====================================================
       REMOVE PRODUCT
    ====================================================== */

    function removeRow(row) {

        const deletionField =
            deleteInput(row);


        if (isSaved(row)) {

            if (deletionField) {

                deletionField.checked =
                    true;

            }


            row.hidden = true;

        }

        else {

            const product =
                productSelect(row);

            const quantity =
                quantityInput(row);


            if (product) {

                product.value = "";

            }


            if (quantity) {

                quantity.value = "";

            }


            if (deletionField) {

                deletionField.checked =
                    false;

            }


            row.hidden = true;

        }


        calculateOrder();

    }



    /* =====================================================
       PRODUCT DATA
    ====================================================== */

    function selectedProduct(row) {

        const select =
            productSelect(row);


        if (
            !select ||
            !select.value
        ) {

            return null;

        }


        const option =
            select.selectedOptions[0];


        if (!option) {
            return null;
        }


        return {
            id:
                select.value,

            caseWeight:
                numberValue(
                    option.dataset
                        .caseWeight
                ),

            wholesale:
                numberValue(
                    option.dataset
                        .wholesalePrice
                ),

            retail:
                numberValue(
                    option.dataset
                        .retailPrice
                ),
        };

    }



    /* =====================================================
       UNIT PRICE
    ====================================================== */

    function unitPrice(
        row,
        product
    ) {

        /*
         * Existing OrderItems retain the price originally
         * saved with that line.
         */
        if (
            isSaved(row) &&
            row.dataset
                .originalProductId
                === product.id &&
            row.dataset
                .existingUnitPrice
                !== ""
        ) {

            return numberValue(
                row.dataset
                    .existingUnitPrice
            );

        }


        if (
            customerType() ===
            "WHOLESALER"
        ) {

            return product.wholesale;

        }


        if (
            customerType() ===
            "RETAILER"
        ) {

            return product.retail;

        }


        return null;

    }



    /* =====================================================
       UPDATE ROW
    ====================================================== */

    function calculateRow(row) {

        const caseWeightCell =
            row.querySelector(
                "[data-order-case-weight]"
            );

        const lineWeightCell =
            row.querySelector(
                "[data-order-line-weight]"
            );

        const unitPriceCell =
            row.querySelector(
                "[data-order-unit-price]"
            );

        const lineTotalCell =
            row.querySelector(
                "[data-order-line-total]"
            );


        const product =
            selectedProduct(row);


        const quantityField =
            quantityInput(row);


        if (
            !product ||
            !quantityField
        ) {

            if (caseWeightCell) {
                caseWeightCell.textContent = "—";
            }

            if (lineWeightCell) {
                lineWeightCell.textContent = "—";
            }

            if (unitPriceCell) {
                unitPriceCell.textContent = "—";
            }

            if (lineTotalCell) {
                lineTotalCell.textContent = "—";
            }


            return null;

        }


        const quantity =
            Math.max(
                0,
                numberValue(
                    quantityField.value
                )
            );


        const weightKg =
            quantity *
            product.caseWeight;


        const price =
            unitPrice(
                row,
                product
            );


        if (caseWeightCell) {

            caseWeightCell.textContent =
                formatNumber(
                    product.caseWeight,
                    3
                )
                + " kg";

        }


        if (lineWeightCell) {

            lineWeightCell.textContent =
                formatNumber(
                    weightKg / 1000,
                    3
                )
                + " tons";

        }


        if (unitPriceCell) {

            unitPriceCell.textContent =
                price === null
                    ? "Select customer"
                    : formatMoney(price);

        }


        if (lineTotalCell) {

            lineTotalCell.textContent =
                price === null
                    ? "—"
                    : formatMoney(
                        price * quantity
                    );

        }


        return {
            cases: quantity,
            weightKg: weightKg,
            value:
                price === null
                    ? 0
                    : price * quantity,
        };

    }



    /* =====================================================
       COMPLETE ORDER CALCULATION
    ====================================================== */

    function calculateOrder() {

        let totalCases = 0;

        let totalWeightKg = 0;

        let totalValue = 0;


        rows().forEach(
            function (row) {

                if (
                    row.hidden ||
                    isDeleted(row)
                ) {
                    return;
                }


                const result =
                    calculateRow(row);


                if (!result) {
                    return;
                }


                totalCases +=
                    result.cases;


                totalWeightKg +=
                    result.weightKg;


                totalValue +=
                    result.value;

            }
        );


        totalCasesElement.textContent =
            formatNumber(
                totalCases,
                0
            );


        totalWeightElement.textContent =
            formatNumber(
                totalWeightKg / 1000,
                3
            )
            + " tons";


        const type =
            customerType();


        if (type === "WHOLESALER") {

            priceTypeElement.textContent =
                "Wholesale";

            invoiceElement.textContent =
                formatMoney(
                    totalValue
                );

        }

        else if (
            type === "RETAILER"
        ) {

            priceTypeElement.textContent =
                "Retail";

            invoiceElement.textContent =
                formatMoney(
                    totalValue
                );

        }

        else {

            priceTypeElement.textContent =
                "Select customer";

            invoiceElement.textContent =
                "Select customer";

        }

    }



    /* =====================================================
       EVENTS
    ====================================================== */

    territorySelect.addEventListener(
        "change",
        function () {

            filterCustomers(
                false
            );

        }
    );


    customerSelect.addEventListener(
        "change",
        function () {

            synchronizeTerritoryFromCustomer();

            calculateOrder();

        }
    );


    rowsContainer.addEventListener(
        "input",
        function (event) {

            if (
                event.target.matches(
                    'input[name$="-quantity"]'
                )
            ) {

                calculateOrder();

            }

        }
    );


    rowsContainer.addEventListener(
        "change",
        function (event) {

            if (
                event.target.matches(
                    'select[name$="-product"]'
                )
                ||
                event.target.matches(
                    'input[name$="-quantity"]'
                )
            ) {

                calculateOrder();

            }

        }
    );


    rowsContainer.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".order-product-remove"
                );


            if (!button) {
                return;
            }


            const row =
                button.closest(
                    ".order-product-row"
                );


            if (row) {

                removeRow(row);

            }

        }
    );


    addButton.addEventListener(
        "click",
        addProduct
    );



    /* =====================================================
       INITIAL STATE
    ====================================================== */

    synchronizeTerritoryFromCustomer();

    filterCustomers(
        true
    );

    prepareInitialRows();

    calculateOrder();

}



/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeOrderForm
);