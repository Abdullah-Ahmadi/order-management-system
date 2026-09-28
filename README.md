# Order Management System (OMS)

OMS is a Django and JavaScript application developed as my CS50W final project for the operational needs of **Afghanistan Beverage Industries Ltd. (ABI), the PepsiCo franchisee where I work as a Sales Clerk**. Its design reflects the practical work of recording customer orders, coordinating dispatches, calculating freight, and preparing distribution documents.

The application brings orders, transport information, customer records, and reporting into one workflow. It is intended for internal company users, with authenticated access and administrator-controlled user management.

## Distinctiveness and Complexity

OMS addresses beverage-distribution operations rather than public online shopping. Although it contains products, prices, and orders, its central workflow is the internal coordination of customer orders and their fulfillment through one or more dispatches. It does not provide auctions, bidding, watchlists, or a public customer checkout. Its focus on transport, freight, and operational paperwork distinguishes it from the CS50W Commerce project and the Pizza ordering concept.

The application also differs from Network, Mail, Wiki, and Search. It does not organize social posts, messages, encyclopedia entries, or search-engine queries. Instead, it connects business records across an order's operational lifecycle. My work at ABI informed the choice of entities, calculations, and printable documents, giving the project a specific real-company purpose.

The data model contains eleven related entities: Territory, Distributor, Product, Driver, Truck, Order, OrderItem, Dispatch, DispatchItem, PurchaseRequest, and DeliveryNote. Orders contain multiple products and can be fulfilled across several dispatches. Validation checks that dispatch items belong to the correct order and do not exceed its remaining quantities. Database constraints prevent duplicate line items and enforce one active distributor per territory. Saving related order or dispatch records uses database transactions.

Business calculations add complexity beyond basic record creation and editing. Order items store the applicable wholesale or retail price when created. Dispatch quantities and case weights determine tonnage, which selects a territory-specific freight rate. Freight is zero when both the driver and truck belong to the company. Purchase requests combine order values with freight across related dispatches, while delivery notes record delivery information separately.

The frontend coordinates dynamic product rows, customer filtering by territory, and live order totals with Django forms and formsets. The system also produces A4 operational documents, daily dispatch summaries, Excel downloads, and PNG exports. These connected workflows, validations, calculations, and output formats provide the project's main complexity; framework choice and deployment alone are not the justification.

## Features and Business Rules

- Authentication, password resets through administrator tools, and user activation controls.
- Order creation, editing, searching, automatic serial numbers, and draft/confirmed/cancelled statuses.
- Multiple dispatches per order, company or external transport, and remaining-quantity validation.
- Freight bands: below 17 tons, 17 to below 26 tons, and 26 tons or more.
- Loading dispatches with four printed copies, purchase requests with selectable copy counts, and optional delivery notes with two copies.
- Daily dispatch summaries with customer, territory, truck, tonnage, and product totals.
- Management of products, distributors, territories, drivers, and trucks.

## File Guide

Paths below are relative to the repository root. Files with parallel roles are grouped and explicitly named.

### Root and Django Configuration

| File | Contents |
| --- | --- |
| `README.md` | Project explanation, setup, file guide, and limitations. |
| `requirements.txt` | Python dependencies. |
| `.gitignore` | Exclusions for local databases, secrets, caches, and generated files. |
| `manage.py` | Django command-line entry point. |
| `oms/__init__.py`, `orders/__init__.py` | Python package markers. |
| `oms/settings.py` | Applications, authentication, databases, static storage, timezone, and environment configuration. |
| `oms/urls.py` | Root routing, authentication routes, and admin integration. |
| `oms/asgi.py`, `oms/wsgi.py` | ASGI and WSGI server entry points, respectively. |

### Application Python Files

| File | Contents |
| --- | --- |
| `orders/apps.py` | Django application configuration. |
| `orders/models.py` | Eleven business models, relationships, constraints, and calculated properties. |
| `orders/forms.py` | User and business forms, selection widgets, formsets, and validation. |
| `orders/views.py` | Page handlers, permissions, workflow validation, document preparation, summaries, and Excel export. |
| `orders/urls.py` | Named application routes. |
| `orders/admin.py` | Django admin registrations and management configuration. |
| `orders/tests.py` | Tests for the management page, product creation, and product activation. |

### Database Migrations

All files below are in `orders/migrations/`.

| File | Contents |
| --- | --- |
| `__init__.py` | Migration package marker. |
| `0001_initial.py` | Initial Territory model. |
| `0002_product_territory_high_freight_rate_and_more.py` | Products, distributors, and territory freight rates. |
| `0003_driver_truck.py` | Driver and Truck models. |
| `0004_remove_truck_truck_code.py` | Removal of the truck-code field. |
| `0005_order.py` | Order model. |
| `0006_deliverynote_dispatch_dispatchitem_orderitem_and_more.py` | Operational document and line-item models, relationships, package type, and constraints. |
| `0007_alter_product_package_type.py` | Product package-type choices. |
| `0008_dispatch_dispatch_date.py` | Dispatch-date field. |
| `0009_alter_dispatch_dispatch_date.py` | Dispatch-date default adjustment. |

### Templates

Except the login template, these files are in `orders/templates/orders/`.

| File(s) | Contents |
| --- | --- |
| `base.html` | Shared layout, navigation, messages, and assets. |
| `dashboard.html` | Operational overview. |
| `help.html` | In-application workflow guidance. |
| `management_home.html` | Links to management pages. |
| `order_list.html`, `order_detail.html`, `order_form.html` | Order browsing, details, and active create/edit form, respectively. |
| `order_create.html` | Earlier standalone creation template; the current creation view uses `order_form.html`. |
| `order_print.html` | Printable order. |
| `dispatch_list.html`, `dispatch_detail.html`, `dispatch_form.html` | Dispatch browsing, details, and create/edit form, respectively. |
| `dispatch_print.html` | Four-copy loading dispatch. |
| `dispatch_summary.html` | Daily summary and export controls. |
| `purchase_request_detail.html`, `purchase_request_print.html` | Purchase-request details and printable copies, respectively. |
| `delivery_note_detail.html`, `delivery_note_form.html`, `delivery_note_print.html` | Delivery details, recipient-data entry, and printable copies, respectively. |
| `product_list.html`, `product_form.html` | Product listing and editing. |
| `distributor_list.html`, `distributor_form.html` | Distributor listing and editing. |
| `territory_list.html`, `territory_form.html` | Territory listing and freight-rate editing. |
| `driver_list.html`, `driver_form.html` | Driver listing and editing. |
| `truck_list.html`, `truck_form.html` | Truck listing and editing. |
| `user_list.html`, `user_form.html`, `user_password_form.html` | User listing, account editing, and password resets, respectively. |
| `orders/templates/registration/login.html` | Login form. |

### Static Assets

These paths are relative to `orders/static/orders/`.

| File(s) | Contents |
| --- | --- |
| `css/styles.css` | Shared styling, forms, tables, and mobile layouts. |
| `css/dashboard.css` | Dashboard styling and responsive grids. |
| `css/dispatch_print.css`, `css/purchase_request_print.css`, `css/delivery_note_print.css` | Corresponding A4 document layouts. |
| `js/app.js` | Navigation, print actions, confirmations, messages, and submission protection. |
| `js/order_form.js` | Dynamic product rows, territory/customer filtering, and live totals. |
| `js/dispatch_form.js` | Transport-field behavior and dispatch product rows. |
| `js/dispatch_list.js` | Dispatch-list interactions and filtering. |
| `js/dispatch_summary.js` | Summary interactions and canvas-based PNG export. |
| `js/purchase_request_print.js` | Purchase-request copy-count and printing behavior. |
| `js/product_list.js`, `js/distributor_list.js`, `js/territory_list.js`, `js/driver_list.js`, `js/truck_list.js`, `js/user_list.js` | Corresponding management-list interactions and filtering. |
| `logo/abi_logo.png` | Company branding used in documents. |

## How to Run

Use Python 3.11 or a compatible newer version.

```bash
git clone https://github.com/Abdullah-Ahmadi/order-management-system.git
cd order-management-system
python -m venv .venv
```

Activate the environment:

```bash
# Windows Command Prompt
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

Install and initialize:

```bash
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Open http://127.0.0.1:8000/ and sign in. Without `DATABASE_URL`, the application uses SQLite. Local development defaults to `DEBUG=True`.

For first use, create territories and freight rates, then distributors and products with prices and case weights. Add company drivers and trucks when applicable. Create an order, dispatch some or all of its quantities, and inspect the resulting documents and daily summary. Use fictional records for evaluation rather than confidential company data.

## Checks and Configuration

```bash
python manage.py check
python manage.py collectstatic --noinput
python manage.py test
```

Static collection is included because the configured manifest storage requires collected assets when tests render pages with debugging disabled. The existing three tests cover management/product behavior, not the full operational workflow.

Production configuration uses `SECRET_KEY`, `DEBUG=False`, `DATABASE_URL`, and, on Render, `RENDER_EXTERNAL_HOSTNAME`. PostgreSQL support uses `dj-database-url` and `psycopg2-binary`; Gunicorn serves the application and WhiteNoise serves collected static assets. Keep secrets outside version control. `PYTHON_VERSION` is a hosting runtime setting rather than an application setting.

## Additional Information and Limitations

The main interface includes mobile breakpoints, touch navigation, and scrollable tables. Print previews retain fixed A4 dimensions and still require mobile-usability verification; responsive CSS alone does not establish that every screen works on every device.

Stronger concurrency controls, broader automated tests, granular operational permissions, and audit logging remain future improvements. The project documents a real company's workflow, but this README does not assert company endorsement or certify production readiness. No open-source license is currently granted.
