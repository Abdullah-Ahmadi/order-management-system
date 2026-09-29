# Order Management System

I work as a Sales Clerk at Afghanistan Beverage Industries Ltd. I built this project around the order and dispatch work I handle there. It keeps orders, customers, products, drivers, and trucks in one place and helps prepare delivery documents and daily reports.

The application uses Django for the backend and JavaScript for the interactive parts of the pages. Users sign in before working with the records. An administrator manages user accounts.

## Distinctiveness and Complexity

The project is for staff who handle distribution. It is not a public shopping site, an auction site, or a social network. Its main purpose is to record orders and follow them through dispatch and delivery, including the transport details and paperwork.

One order can leave in several trips. For example, if a customer orders 100 cases and 30 are dispatched, only 70 should remain available for another dispatch. The application checks those quantities and makes sure each dispatched product belongs to the right order.

The database connects eleven models. Orders have product rows, dispatches refer to those rows, and delivery notes belong to dispatches. Other models hold customers, territories, products, drivers, trucks, and purchase requests. Database rules prevent duplicate items and more than one active distributor in a territory.

The calculations also depend on the records. Order items save the applicable wholesale or retail price. Dispatch weight comes from the number of cases and each product's case weight. Freight depends on that weight and the territory's rates. It becomes zero when both the driver and truck belong to the company.

JavaScript updates order totals as products and quantities change. It also lets users add rows and find customers by territory. Django checks the submitted data before saving it. The system prepares dispatch sheets, purchase requests, delivery notes, and daily summaries, with Excel and PNG exports for summaries. Keeping these records and calculations connected is what makes the project more involved than a basic set of forms.

## Files

### Project setup

- `README.md`: Project explanation, setup, file guide, and limitations.
- `requirements.txt`: Python dependencies.
- `.gitignore`: Exclusions for local databases, secrets, caches, and generated files.
- `manage.py`: Django command-line entry point.
- `oms/__init__.py`, `orders/__init__.py`: Python package markers.
- `oms/settings.py`: Database, login, static-file, and other settings.
- `oms/urls.py`: Root routing, authentication routes, and admin integration.
- `oms/asgi.py`, `oms/wsgi.py`: Entry points for hosting the application.

### Main application

- `orders/apps.py`: Django application configuration.
- `orders/models.py`: Database models and calculations.
- `orders/forms.py`: Forms and checks for the information users enter.
- `orders/views.py`: Handles requests, saves records, prepares documents, and exports reports.
- `orders/urls.py`: Named application routes.
- `orders/admin.py`: Makes the models available in Django admin.
- `orders/tests.py`: Tests for the management page, product creation, and product activation.

### Database changes

All files below are in `orders/migrations/`.

- `__init__.py`: Migration package marker.
- `0001_initial.py`: Initial Territory model.
- `0002_product_territory_high_freight_rate_and_more.py`: Products, distributors, and territory freight rates.
- `0003_driver_truck.py`: Driver and Truck models.
- `0004_remove_truck_truck_code.py`: Removal of the truck-code field.
- `0005_order.py`: Order model.
- `0006_deliverynote_dispatch_dispatchitem_orderitem_and_more.py`: Operational document and line-item models, relationships, package type, and constraints.
- `0007_alter_product_package_type.py`: Product package-type choices.
- `0008_dispatch_dispatch_date.py`: Dispatch-date field.
- `0009_alter_dispatch_dispatch_date.py`: Dispatch-date default adjustment.

### Templates

Except the login template, these files are in `orders/templates/orders/`.

- `base.html`: Shared layout, navigation, messages, and assets.
- `dashboard.html`: Operational overview.
- `help.html`: In-application workflow guidance.
- `management_home.html`: Links to management pages.
- `order_list.html`, `order_detail.html`, `order_form.html`: Order browsing, details, and active create/edit form, respectively.
- `order_create.html`: Earlier standalone creation template; the current creation view uses `order_form.html`.
- `order_print.html`: Printable order.
- `dispatch_list.html`, `dispatch_detail.html`, `dispatch_form.html`: Dispatch browsing, details, and create/edit form, respectively.
- `dispatch_print.html`: Four-copy loading dispatch.
- `dispatch_summary.html`: Daily summary and export controls.
- `purchase_request_detail.html`, `purchase_request_print.html`: Purchase-request details and printable copies, respectively.
- `delivery_note_detail.html`, `delivery_note_form.html`, `delivery_note_print.html`: Delivery details, recipient-data entry, and printable copies, respectively.
- `product_list.html`, `product_form.html`: Product listing and editing.
- `distributor_list.html`, `distributor_form.html`: Distributor listing and editing.
- `territory_list.html`, `territory_form.html`: Territory listing and freight-rate editing.
- `driver_list.html`, `driver_form.html`: Driver listing and editing.
- `truck_list.html`, `truck_form.html`: Truck listing and editing.
- `user_list.html`, `user_form.html`, `user_password_form.html`: User listing, account editing, and password resets, respectively.
- `orders/templates/registration/login.html`: Login form.

### CSS and JavaScript

These paths are relative to `orders/static/orders/`.

- `css/styles.css`: Shared styling, forms, tables, and mobile layouts.
- `css/dashboard.css`: Dashboard styling and responsive grids.
- `css/dispatch_print.css`, `css/purchase_request_print.css`, `css/delivery_note_print.css`: Corresponding A4 document layouts.
- `js/app.js`: Menus, printing, confirmation prompts, and form submission handling.
- `js/order_form.js`: Dynamic product rows, territory/customer filtering, and live totals.
- `js/dispatch_form.js`: Transport-field behavior and dispatch product rows.
- `js/dispatch_list.js`: Dispatch-list interactions and filtering.
- `js/dispatch_summary.js`: Summary interactions and canvas-based PNG export.
- `js/purchase_request_print.js`: Purchase-request copy-count and printing behavior.
- `js/product_list.js`, `js/distributor_list.js`, `js/territory_list.js`, `js/driver_list.js`, `js/truck_list.js`, `js/user_list.js`: Search and filtering for each management page.

## How to Run

Use Python 3.11 or a compatible newer version. Download the project and create a virtual environment:

```bash
git clone https://github.com/Abdullah-Ahmadi/order-management-system.git
cd order-management-system
python -m venv .venv
```

Activate it with `.venv\Scripts\activate` in Windows Command Prompt, or `source .venv/bin/activate` on macOS or Linux. Then run:

```bash
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Open http://127.0.0.1:8000/ and sign in. SQLite is used unless a `DATABASE_URL` is provided.

Add territories and freight rates first, followed by customers and products. Enter product prices and case weights, then add drivers and trucks if needed. You can now create an order and record its dispatches.

## Additional Information

Use fictional records for demonstrations. The company logo is not included, and naming the company does not mean it endorses the project. Keep passwords, database credentials, and customer data out of the repository.

For production, set `SECRET_KEY`, `DEBUG=False`, and the database and hostname settings. The project supports PostgreSQL and Render's `RENDER_EXTERNAL_HOSTNAME`.

To run the checks, use `python manage.py check`, then `python manage.py collectstatic --noinput` and `python manage.py test`. The current tests cover the management page and product creation and activation.

The main pages adapt to smaller screens. The four print previews still need work on phones; they currently use layouts intended for printed documents. More tests, an audit history, and better handling of simultaneous dispatch updates are also planned.
