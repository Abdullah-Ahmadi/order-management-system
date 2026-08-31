"use strict";


/* =========================================================
   DISPATCH FORM
========================================================= */


/* =========================================================
   TRANSPORT FIELDS
========================================================= */

function initializeDispatchTransportFields() {

    const driverSelect =
        document.getElementById(
            "id_driver"
        );

    const truckSelect =
        document.getElementById(
            "id_truck"
        );

    const externalDriver =
        document.getElementById(
            "id_external_driver_name"
        );

    const externalTruck =
        document.getElementById(
            "id_external_truck_plate"
        );


    /* =====================================================
       DRIVER
    ====================================================== */

    if (
        driverSelect &&
        externalDriver
    ) {

        function updateDriverFields() {

            if (driverSelect.value) {

                externalDriver.value = "";

                externalDriver.disabled =
                    true;

            } else {

                externalDriver.disabled =
                    false;

            }

        }


        driverSelect.addEventListener(
            "change",
            updateDriverFields
        );


        updateDriverFields();

    }


    /* =====================================================
       TRUCK
    ====================================================== */

    if (
        truckSelect &&
        externalTruck
    ) {

        function updateTruckFields() {

            if (truckSelect.value) {

                externalTruck.value = "";

                externalTruck.disabled =
                    true;

            } else {

                externalTruck.disabled =
                    false;

            }

        }


        truckSelect.addEventListener(
            "change",
            updateTruckFields
        );


        updateTruckFields();

    }

}


/* =========================================================
   DISPATCH PRODUCT FORMSET
========================================================= */

function initializeDispatchProductFormset() {

    const formset =
        document.getElementById(
            "dispatch-products-formset"
        );


    if (!formset) {
        return;
    }


    const prefix =
        formset.dataset
            .dispatchFormsetPrefix;


    const rowsContainer =
        document.getElementById(
            "dispatch-product-rows"
        );


    const addButton =
        document.getElementById(
            "dispatch-add-product"
        );


    const emptyTemplate =
        document.getElementById(
            "dispatch-product-empty-form"
        );


    const message =
        document.getElementById(
            "dispatch-product-message"
        );


    const totalFormsInput =
        document.getElementById(
            `id_${prefix}-TOTAL_FORMS`
        );


    if (
        !prefix ||
        !rowsContainer ||
        !addButton ||
        !emptyTemplate ||
        !totalFormsInput
    ) {
        return;
    }


    /* =====================================================
       ORDER ITEM DATA
    ====================================================== */

    const productData =
        new Map();


    document
        .querySelectorAll(
            "#dispatch-order-item-data "
            + "[data-order-item-id]"
        )
        .forEach(
            function (element) {

                productData.set(
                    element.dataset
                        .orderItemId,
                    {
                        ordered:
                            Number(
                                element.dataset
                                    .ordered
                            ),

                        previous:
                            Number(
                                element.dataset
                                    .previouslyDispatched
                            ),

                        available:
                            Number(
                                element.dataset
                                    .available
                            ),
                    }
                );

            }
        );


    /* =====================================================
       MESSAGE
    ====================================================== */

    function showMessage(text) {

        if (!message) {
            return;
        }

        message.textContent = text;

    }


    function clearMessage() {

        showMessage("");

    }


    /* =====================================================
       ROW HELPERS
    ====================================================== */

    function getRows() {

        return Array.from(
            rowsContainer.querySelectorAll(
                ".dispatch-product-row"
            )
        );

    }


    function getProductSelect(row) {

        return row.querySelector(
            'select[name$="-order_item"]'
        );

    }


    function getQuantityInput(row) {

        return row.querySelector(
            'input[name$="-quantity"]'
        );

    }


    function getDeleteInput(row) {

        return row.querySelector(
            'input[name$="-DELETE"]'
        );

    }


    function rowIsRemoved(row) {

        const deleteInput =
            getDeleteInput(row);


        return Boolean(
            deleteInput &&
            deleteInput.checked
        );

    }


    /* =====================================================
       UPDATE QUANTITY INFORMATION
    ====================================================== */

    function updateRowInformation(
        row,
        setDefaultQuantity = false
    ) {

        const productSelect =
            getProductSelect(row);


        const quantityInput =
            getQuantityInput(row);


        const orderedCell =
            row.querySelector(
                "[data-dispatch-ordered]"
            );


        const previousCell =
            row.querySelector(
                "[data-dispatch-previous]"
            );


        const availableCell =
            row.querySelector(
                "[data-dispatch-available]"
            );


        if (!productSelect) {
            return;
        }


        const data =
            productData.get(
                productSelect.value
            );


        if (!data) {

            if (orderedCell) {
                orderedCell.textContent = "—";
            }

            if (previousCell) {
                previousCell.textContent = "—";
            }

            if (availableCell) {
                availableCell.textContent = "—";
            }

            if (quantityInput) {
                quantityInput.removeAttribute(
                    "max"
                );
            }

            return;
        }


        if (orderedCell) {
            orderedCell.textContent =
                data.ordered;
        }


        if (previousCell) {
            previousCell.textContent =
                data.previous;
        }


        if (availableCell) {
            availableCell.textContent =
                data.available;
        }


        if (quantityInput) {

            quantityInput.max =
                data.available;


            if (setDefaultQuantity) {

                quantityInput.value =
                    data.available > 0
                        ? data.available
                        : "";

            }

        }

    }


    /* =====================================================
       PREVENT DUPLICATE PRODUCT SELECTION
    ====================================================== */

    function updateProductOptions() {

        const rows =
            getRows();


        const selectedValues =
            new Set();


        rows.forEach(
            function (row) {

                if (
                    row.hidden ||
                    rowIsRemoved(row)
                ) {
                    return;
                }


                const select =
                    getProductSelect(row);


                if (
                    select &&
                    select.value
                ) {

                    selectedValues.add(
                        select.value
                    );

                }

            }
        );


        rows.forEach(
            function (row) {

                if (
                    row.hidden ||
                    rowIsRemoved(row)
                ) {
                    return;
                }


                const select =
                    getProductSelect(row);


                if (!select) {
                    return;
                }


                const currentValue =
                    select.value;


                Array.from(
                    select.options
                ).forEach(
                    function (option) {

                        if (!option.value) {

                            option.disabled =
                                false;

                            return;
                        }


                        const data =
                            productData.get(
                                option.value
                            );


                        const unavailable =
                            (
                                data &&
                                data.available <= 0
                            );


                        const selectedElsewhere =
                            (
                                selectedValues.has(
                                    option.value
                                )
                                &&
                                option.value !==
                                    currentValue
                            );


                        option.disabled =
                            unavailable
                            || selectedElsewhere;

                    }
                );

            }
        );

    }


    /* =====================================================
       REPLACE DJANGO __prefix__
    ====================================================== */

    function replacePrefix(
        element,
        formIndex
    ) {

        Array.from(
            element.attributes
        ).forEach(
            function (attribute) {

                if (
                    !attribute.value.includes(
                        "__prefix__"
                    )
                ) {
                    return;
                }


                element.setAttribute(
                    attribute.name,
                    attribute.value.replace(
                        /__prefix__/g,
                        formIndex
                    )
                );

            }
        );

    }


    function prepareNewRow(
        fragment,
        formIndex
    ) {

        const row =
            fragment.querySelector(
                ".dispatch-product-row"
            );


        if (!row) {
            return null;
        }


        replacePrefix(
            row,
            formIndex
        );


        row
            .querySelectorAll("*")
            .forEach(
                function (element) {

                    replacePrefix(
                        element,
                        formIndex
                    );

                }
            );


        return row;

    }


    /* =====================================================
       AVAILABLE PRODUCTS
    ====================================================== */

    function getAvailableUnselectedProducts() {

        const selectedValues =
            new Set();


        getRows().forEach(
            function (row) {

                if (
                    row.hidden ||
                    rowIsRemoved(row)
                ) {
                    return;
                }


                const select =
                    getProductSelect(row);


                if (
                    select &&
                    select.value
                ) {

                    selectedValues.add(
                        select.value
                    );

                }

            }
        );


        return Array.from(
            productData.entries()
        )
        .filter(
            function (
                [orderItemId, data]
            ) {

                return (
                    data.available > 0
                    &&
                    !selectedValues.has(
                        orderItemId
                    )
                );

            }
        );

    }


    /* =====================================================
       ADD / RESTORE PRODUCT
    ====================================================== */

    function addProductRow() {

        clearMessage();


        /*
         * First restore a row that the clerk removed
         * during this page visit.
         */

        const removedRow =
            getRows().find(
                function (row) {

                    return (
                        row.hidden &&
                        rowIsRemoved(row)
                    );

                }
            );


        if (removedRow) {

            const deleteInput =
                getDeleteInput(
                    removedRow
                );


            if (deleteInput) {

                deleteInput.checked =
                    false;

            }


            removedRow.hidden =
                false;


            updateRowInformation(
                removedRow
            );


            updateProductOptions();


            const select =
                getProductSelect(
                    removedRow
                );


            if (select) {
                select.focus();
            }


            return;

        }


        /*
         * If every available Order product is already
         * listed, there is nothing meaningful to add.
         */

        if (
            getAvailableUnselectedProducts()
                .length === 0
        ) {

            showMessage(
                "All available order products are already listed."
            );

            return;

        }


        const formIndex =
            Number.parseInt(
                totalFormsInput.value,
                10
            );


        if (
            Number.isNaN(
                formIndex
            )
        ) {
            return;
        }


        const fragment =
            emptyTemplate
                .content
                .cloneNode(true);


        const newRow =
            prepareNewRow(
                fragment,
                formIndex
            );


        if (!newRow) {
            return;
        }


        rowsContainer.appendChild(
            fragment
        );


        totalFormsInput.value =
            formIndex + 1;


        updateProductOptions();


        const select =
            getProductSelect(
                newRow
            );


        if (select) {
            select.focus();
        }

    }


    addButton.addEventListener(
        "click",
        addProductRow
    );


    /* =====================================================
       ROW INTERACTION
    ====================================================== */

    rowsContainer.addEventListener(
        "change",
        function (event) {

            const select =
                event.target.closest(
                    'select[name$="-order_item"]'
                );


            if (!select) {
                return;
            }


            const row =
                select.closest(
                    ".dispatch-product-row"
                );


            if (!row) {
                return;
            }


            updateRowInformation(
                row,
                true
            );


            updateProductOptions();

            clearMessage();

        }
    );


    /* =====================================================
       REMOVE PRODUCT
    ====================================================== */

    rowsContainer.addEventListener(
        "click",
        function (event) {

            const removeButton =
                event.target.closest(
                    ".dispatch-product-remove"
                );


            if (!removeButton) {
                return;
            }


            const row =
                removeButton.closest(
                    ".dispatch-product-row"
                );


            if (!row) {
                return;
            }


            const deleteInput =
                getDeleteInput(row);


            if (deleteInput) {

                deleteInput.checked =
                    true;

            }


            /*
             * Keep the form in the DOM because Django
             * needs the DELETE value on submission.
             *
             * Add Product can also restore it.
             */

            row.hidden = true;


            updateProductOptions();

            clearMessage();

        }
    );


    /* =====================================================
       INITIAL STATE
    ====================================================== */

    getRows().forEach(
        function (row) {

            updateRowInformation(
                row,
                false
            );

        }
    );


    updateProductOptions();

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeDispatchTransportFields();

        initializeDispatchProductFormset();

    }
);