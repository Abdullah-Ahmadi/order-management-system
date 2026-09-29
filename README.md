# Order Management System

I built this application for the order and dispatch work I handle as a Sales Clerk at Afghanistan Beverage Industries Ltd. It keeps customer orders, deliveries, transport details, and reports in one place. The backend uses Django, and the frontend uses HTML, CSS, and JavaScript.

A user can record an order, send it in one or more dispatches, and prepare the paperwork for each delivery. The system also manages products, customers, territories, drivers, trucks, and user accounts.

## Distinctiveness and Complexity

This is an internal business tool. Customers do not browse a public store or buy products through a checkout page. There are no auctions, bids, social posts, or followers. The main task is to help staff handle orders after receiving them and keep track of what has been sent. Transport, freight, and delivery documents are part of the same process.

An order is not always sent in one trip. Staff can create several dispatches for it, and the application checks how many cases remain before accepting another dispatch. A dispatch item must belong to the correct order. These checks connect the order and delivery records rather than treating them as separate forms.

The database has eleven business models: Territory, Distributor, Product, Driver, Truck, Order, OrderItem, Dispatch, DispatchItem, PurchaseRequest, and DeliveryNote. Their relationships support the workflow. For example, each order has product rows, each dispatch refers to those rows, and a delivery note belongs to a dispatch. Constraints prevent duplicate items and allow only one active distributor per territory.

Prices and freight also need different rules. An order item stores the customer's wholesale or retail price when it is created. Product case weights determine dispatch tonnage. That weight selects the territory's freight band: below 17 tons, 17 to below 26 tons, or 26 tons and above. Freight is zero when both the driver and truck belong to the company. A purchase request combines the order value and freight from its dispatches.

JavaScript lets users add product rows, filter customers by territory, and see totals while entering an order. Django validates the submitted information and saves related records in transactions. The application also prepares loading dispatches, purchase requests, optional delivery notes, and daily summaries. Summaries can be exported to Excel or PNG. Handling these related records, calculations, and document formats is the main technical work in the project.

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

## How to Run

Use Python 3.11 or a compatible newer version.

```bash
git clone https://github.com/Abdullah-Ahmadi/order-management-system.git
cd order-management-system
python -m venv .venv
```

Activate the virtual environment using the command for your system:

```bash
# Windows Command Prompt
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

Then install the packages and prepare the database:

```bash
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Open http://127.0.0.1:8000/ and sign in with the account you created. The application uses SQLite when no `DATABASE_URL` is set.

Start by adding territories and their freight rates, then customers and products. Products need prices and case weights for the calculations. Add company drivers and trucks if needed. You can then create an order, record a dispatch, and open its documents or the daily summary.

## Additional Information

All required Python packages are listed in `requirements.txt`. For PostgreSQL, set `DATABASE_URL`. Production also needs a private `SECRET_KEY`, `DEBUG=False`, and the correct hostname configuration. The settings support `RENDER_EXTERNAL_HOSTNAME` for Render. Keep credentials and real customer data out of the public repository.

To run the existing checks:

```bash
python manage.py check
python manage.py collectstatic --noinput
python manage.py test
```

Static files must be collected for the current test configuration. The three existing tests cover the management page and product creation and activation; they do not cover every workflow.

The main pages support smaller screens and touch navigation. The four document print previews still need better handling on phones because their layouts are wider than the screen. Printed documents are designed for A4 paper.

The public version does not include the company logo. Company names describe the business context and do not imply endorsement. Use fictional records when demonstrating the application. Further work includes more tests, stronger protection against simultaneous dispatch updates, and an audit history.
