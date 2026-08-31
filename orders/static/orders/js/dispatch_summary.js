"use strict";


/* =========================================================
   DISPATCH SUMMARY IMAGE EXPORT
========================================================= */


function initializeDispatchSummaryImageExport() {

    const button =
        document.getElementById(
            "dispatch-summary-image-button"
        );


    const report =
        document.getElementById(
            "dispatch-summary-report"
        );


    const table =
        document.getElementById(
            "dispatch-summary-table"
        );


    if (
        !button ||
        !report ||
        !table
    ) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            createDispatchSummaryImage(
                button,
                report,
                table
            );

        }
    );

}



/* =========================================================
   CREATE IMAGE
========================================================= */


function createDispatchSummaryImage(
    button,
    report,
    table
) {

    const originalText =
        button.textContent;


    button.disabled = true;

    button.textContent =
        "Creating Image...";


    try {

        const summaryDate =
            report.dataset.summaryDate
            || "Summary";


        /* =================================================
           TABLE CONTENT
        ================================================== */

        const headerCells =
            Array.from(
                table.querySelectorAll(
                    "thead th"
                )
            );


        const bodyRows =
            Array.from(
                table.querySelectorAll(
                    "tbody tr"
                )
            );


        if (
            headerCells.length === 0 ||
            bodyRows.length === 0
        ) {
            return;
        }


        const headers =
            headerCells.map(
                function (cell) {

                    return cleanCellText(
                        cell.textContent
                    );

                }
            );


        const rows =
            bodyRows.map(
                function (row) {

                    return Array.from(
                        row.cells
                    ).map(
                        function (cell) {

                            return {
                                text:
                                    cleanCellText(
                                        cell.textContent
                                    ),

                                colspan:
                                    cell.colSpan || 1,
                            };

                        }
                    );

                }
            );


        /* =================================================
           IMAGE DIMENSIONS

           Landscape format intended for electronic sharing.
        ================================================== */

        const scale = 2;

        const margin = 48;

        const columnWidths = [
            70,     // S.#
            360,    // Customer
            210,    // Territory
            135,    // Trucks
            130,    // Tonnage
            135,    // PET 1500
            125,    // Can 300
            125,    // Can 250
            135,    // Sting 250
            135,    // Sting 300
            150,    // Total Cases
        ];


        const tableWidth =
            columnWidths.reduce(
                function (
                    total,
                    width
                ) {

                    return total + width;

                },
                0
            );


        const canvasWidth =
            tableWidth
            + (margin * 2);


        /* =================================================
           MEASURE ROW HEIGHTS
        ================================================== */

        const measuringCanvas =
            document.createElement(
                "canvas"
            );


        const measuringContext =
            measuringCanvas.getContext(
                "2d"
            );


        measuringContext.font =
            '18px Arial, sans-serif';


        const headerRowHeight = 64;


        const calculatedRows =
            rows.map(
                function (
                    cells,
                    rowIndex
                ) {

                    const isTotalRow =
                        rowIndex ===
                        rows.length - 1;


                    let columnIndex = 0;

                    let maximumLines = 1;


                    const preparedCells =
                        cells.map(
                            function (cell) {

                                let availableWidth = 0;


                                for (
                                    let i = 0;
                                    i < cell.colspan;
                                    i += 1
                                ) {

                                    availableWidth +=
                                        columnWidths[
                                            columnIndex + i
                                        ] || 100;

                                }


                                const lines =
                                    wrapText(
                                        measuringContext,
                                        cell.text,
                                        availableWidth - 20
                                    );


                                maximumLines =
                                    Math.max(
                                        maximumLines,
                                        lines.length
                                    );


                                const result = {
                                    text:
                                        cell.text,

                                    lines:
                                        lines,

                                    colspan:
                                        cell.colspan,

                                    startColumn:
                                        columnIndex,

                                    width:
                                        availableWidth,
                                };


                                columnIndex +=
                                    cell.colspan;


                                return result;

                            }
                        );


                    const rowHeight =
                        Math.max(
                            54,
                            (
                                maximumLines
                                * 25
                            )
                            + 20
                        );


                    return {
                        cells:
                            preparedCells,

                        height:
                            rowHeight,

                        isTotal:
                            isTotalRow,
                    };

                }
            );


        const tableHeight =
            headerRowHeight
            +
            calculatedRows.reduce(
                function (
                    total,
                    row
                ) {

                    return (
                        total
                        + row.height
                    );

                },
                0
            );


        /* =================================================
           REPORT HEADER / FOOTER
        ================================================== */

        const titleAreaHeight = 185;

        const footerHeight = 70;


        const canvasHeight =
            titleAreaHeight
            + tableHeight
            + footerHeight
            + (margin * 2);


        /* =================================================
           HIGH-RESOLUTION CANVAS
        ================================================== */

        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            canvasWidth * scale;


        canvas.height =
            canvasHeight * scale;


        const context =
            canvas.getContext(
                "2d"
            );


        context.scale(
            scale,
            scale
        );


        /* White image background */

        context.fillStyle =
            "#ffffff";


        context.fillRect(
            0,
            0,
            canvasWidth,
            canvasHeight
        );


        /* =================================================
           COMPANY HEADER
        ================================================== */

        context.textAlign =
            "center";


        context.textBaseline =
            "middle";


        context.fillStyle =
            "#111827";


        context.font =
            'bold 30px Arial, sans-serif';


        context.fillText(
            "Afghanistan Beverage Industries Ltd.",
            canvasWidth / 2,
            margin + 35
        );


        context.font =
            'bold 25px Arial, sans-serif';


        context.fillText(
            "Daily Dispatch Summary",
            canvasWidth / 2,
            margin + 82
        );


        context.font =
            '20px Arial, sans-serif';


        context.fillStyle =
            "#4b5563";


        context.fillText(
            summaryDate,
            canvasWidth / 2,
            margin + 122
        );


        /* Divider */

        context.strokeStyle =
            "#d1d5db";


        context.lineWidth = 1;


        context.beginPath();


        context.moveTo(
            margin,
            margin + 155
        );


        context.lineTo(
            canvasWidth - margin,
            margin + 155
        );


        context.stroke();


        /* =================================================
           TABLE HEADER
        ================================================== */

        let tableY =
            margin
            + titleAreaHeight;


        let currentX =
            margin;


        context.fillStyle =
            "#1f2937";


        context.fillRect(
            margin,
            tableY,
            tableWidth,
            headerRowHeight
        );


        context.fillStyle =
            "#ffffff";


        context.font =
            'bold 16px Arial, sans-serif';


        context.textAlign =
            "center";


        headers.forEach(
            function (
                heading,
                index
            ) {

                const width =
                    columnWidths[index];


                const lines =
                    wrapText(
                        context,
                        heading,
                        width - 14
                    );


                drawCenteredLines(
                    context,
                    lines,
                    currentX,
                    tableY,
                    width,
                    headerRowHeight,
                    20
                );


                currentX += width;

            }
        );


        tableY +=
            headerRowHeight;


        /* =================================================
           TABLE BODY
        ================================================== */

        calculatedRows.forEach(
            function (
                row,
                rowIndex
            ) {

                currentX = margin;


                if (row.isTotal) {

                    context.fillStyle =
                        "#dbeafe";

                } else if (
                    rowIndex % 2 === 1
                ) {

                    context.fillStyle =
                        "#f8fafc";

                } else {

                    context.fillStyle =
                        "#ffffff";

                }


                context.fillRect(
                    margin,
                    tableY,
                    tableWidth,
                    row.height
                );


                context.font =
                    row.isTotal
                        ? 'bold 17px Arial, sans-serif'
                        : '17px Arial, sans-serif';


                context.fillStyle =
                    "#1f2937";


                row.cells.forEach(
                    function (
                        cell,
                        cellIndex
                    ) {

                        const isCustomerColumn =
                            cell.startColumn === 1;


                        if (isCustomerColumn) {

                            context.textAlign =
                                "left";


                            drawLeftAlignedLines(
                                context,
                                cell.lines,
                                currentX,
                                tableY,
                                cell.width,
                                row.height,
                                23
                            );

                        } else {

                            context.textAlign =
                                "center";


                            drawCenteredLines(
                                context,
                                cell.lines,
                                currentX,
                                tableY,
                                cell.width,
                                row.height,
                                23
                            );

                        }


                        currentX +=
                            cell.width;

                    }
                );


                /* Horizontal line */

                context.strokeStyle =
                    "#cbd5e1";


                context.beginPath();


                context.moveTo(
                    margin,
                    tableY + row.height
                );


                context.lineTo(
                    margin + tableWidth,
                    tableY + row.height
                );


                context.stroke();


                tableY +=
                    row.height;

            }
        );


        /* =================================================
           TABLE GRID
        ================================================== */

        context.strokeStyle =
            "#cbd5e1";


        context.lineWidth = 1;


        context.strokeRect(
            margin,
            margin + titleAreaHeight,
            tableWidth,
            tableHeight
        );


        currentX = margin;


        for (
            let index = 0;
            index < columnWidths.length - 1;
            index += 1
        ) {

            currentX +=
                columnWidths[index];


            context.beginPath();


            context.moveTo(
                currentX,
                margin + titleAreaHeight
            );


            context.lineTo(
                currentX,
                margin
                + titleAreaHeight
                + tableHeight
            );


            context.stroke();

        }


        /* =================================================
           GENERATED TIMESTAMP
        ================================================== */

        const generatedAt =
            new Date()
                .toLocaleString();


        context.textAlign =
            "right";


        context.fillStyle =
            "#6b7280";


        context.font =
            '15px Arial, sans-serif';


        context.fillText(
            `Generated: ${generatedAt}`,
            canvasWidth - margin,
            canvasHeight - margin
        );


        /* =================================================
           DOWNLOAD
        ================================================== */

        canvas.toBlob(
            function (blob) {

                if (!blob) {
                    return;
                }


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href = url;


                link.download =
                    `Dispatch_Summary_${summaryDate}.png`;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                URL.revokeObjectURL(
                    url
                );

            },
            "image/png"
        );

    }

    catch (error) {

        console.error(
            "Could not create Dispatch Summary image:",
            error
        );


        window.alert(
            "The Dispatch Summary image could not be created."
        );

    }

    finally {

        button.disabled = false;

        button.textContent =
            originalText;

    }

}



/* =========================================================
   CLEAN TABLE TEXT
========================================================= */


function cleanCellText(text) {

    return text
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}



/* =========================================================
   WORD WRAPPING
========================================================= */


function wrapText(
    context,
    text,
    maximumWidth
) {

    const words =
        String(text)
            .split(/\s+/);


    if (words.length === 0) {
        return [""];
    }


    const lines = [];

    let currentLine = "";


    words.forEach(
        function (word) {

            const testLine =
                currentLine
                    ? `${currentLine} ${word}`
                    : word;


            const width =
                context.measureText(
                    testLine
                ).width;


            if (
                width > maximumWidth
                &&
                currentLine
            ) {

                lines.push(
                    currentLine
                );


                currentLine =
                    word;

            } else {

                currentLine =
                    testLine;

            }

        }
    );


    if (currentLine) {

        lines.push(
            currentLine
        );

    }


    return lines;

}



/* =========================================================
   DRAW CENTERED MULTI-LINE TEXT
========================================================= */


function drawCenteredLines(
    context,
    lines,
    x,
    y,
    width,
    height,
    lineHeight
) {

    const totalHeight =
        lines.length
        * lineHeight;


    let textY =
        y
        +
        (
            height
            - totalHeight
        )
        / 2
        +
        lineHeight / 2;


    lines.forEach(
        function (line) {

            context.fillText(
                line,
                x + width / 2,
                textY
            );


            textY +=
                lineHeight;

        }
    );

}



/* =========================================================
   DRAW LEFT-ALIGNED MULTI-LINE TEXT
========================================================= */


function drawLeftAlignedLines(
    context,
    lines,
    x,
    y,
    width,
    height,
    lineHeight
) {

    const totalHeight =
        lines.length
        * lineHeight;


    let textY =
        y
        +
        (
            height
            - totalHeight
        )
        / 2
        +
        lineHeight / 2;


    lines.forEach(
        function (line) {

            context.fillText(
                line,
                x + 10,
                textY
            );


            textY +=
                lineHeight;

        }
    );

}



/* =========================================================
   INITIALIZATION
========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeDispatchSummaryImageExport();

    }
);