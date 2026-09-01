# Order Management System (OMS)

<p align="center">
  <strong>A practical Django-based order and dispatch management system</strong><br>
  Built as a CS50W final project and designed for real-world business use.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Django-5.2-0C4B33?logo=django&logoColor=white" alt="Django 5.2">
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white" alt="Python 3.11">
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=000" alt="JavaScript">
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Deployed%20on-Render-46E3B7?logo=render&logoColor=000" alt="Render">
  <img src="https://img.shields.io/badge/CS50W-Final%20Project-A51C30" alt="CS50W Final Project">
</p>

---

## ✨ Overview

The **Order Management System (OMS)** is a web application built with Django to manage beverage distribution workflows in one centralized place.

It replaces a largely spreadsheet-based process with a structured system for managing:

- orders
- dispatches
- purchase requests
- delivery notes
- dispatch summaries
- customers and territories
- products, drivers, and trucks
- user access

The project is intentionally designed to stay **simple, practical, maintainable, and business-focused** while still supporting real operational requirements.

---

## 🚀 Main Features

### 🔐 Authentication and User Management
- Secure Django authentication
- Login and logout
- Administrator-only user management
- Create, edit, activate, and deactivate users
- Reset user passwords
- Protection against deactivating the current or last active administrator

### 🧾 Order Management
- Create, edit, view, and search orders
- Automatic order serial numbers
- Editable order date and serial number
- Customer selection by territory
- Dynamic product rows
- Live calculation of:
  - total cases
  - total weight
  - applicable customer price type
  - estimated invoice value
- Wholesale and retail pricing
- Order status management

### 🚚 Dispatch Management
- Create one or more dispatches from an order
- Independent dispatch date
- Company or external driver/truck information
- Remaining-order-quantity validation
- Automatic dispatch weight calculation
- Automatic freight category determination
- Automatic freight calculation based on tonnage and territory
- Zero freight when both truck and driver belong to the company
- Search and filter dispatches

### 🖨️ Dispatch Printing
- Printable loading dispatch designed to match the existing business document
- Four copies on one A4 page:
  - Sales Copy
  - Warehouse Copy
  - Security Copy
  - Finance Copy
- Fixed product matrix
- Driver, truck, customer, territory, dispatch number, date, and weight
- Company branding and print time

### 💰 Purchase Requests
- Purchase Request generated from order/dispatch information
- Fixed product and pricing table
- Payment term, territory, dispatch, vehicle, driver, and tonnage information
- Subtotal
- Freight
- Payable amount
- Amount in words
- Rounded monetary values for printing
- User-selectable print copy count
- Default print count of two copies

### 📦 Delivery Notes
- Delivery Notes are optional and created only when required
- Intended mainly for deliveries made using company transport
- Product quantities are taken from the relevant dispatch
- Sender information includes driver and truck
- Recipient name, ID, phone number, and signature remain blank on the printed document for handwritten completion at delivery
- Returned recipient information can later be recorded in the system
- Two identical copies are prepared for printing

### 📊 Dispatch Summary
- Daily Dispatch Summary by dispatch date
- Aggregated customer/territory dispatch information
- Truck count
- Tonnage
- Product-category totals
- Overall totals
- Printable view
- Excel export
- PNG export

### 🛠️ Master Data Management
The system provides management pages for:
- Products
- Customers / Distributors
- Territories
- Drivers
- Trucks
- Users

Management pages include search/filter functionality and activation/deactivation where appropriate.

### 📱 Responsive Interface
- Responsive layout for desktop, tablet, and mobile
- Desktop navigation supports hover
- Touch devices use tap-to-open navigation
- Tables remain horizontally scrollable where necessary
- Forms collapse into mobile-friendly single-column layouts

---

## 🧠 Business Rules

The OMS implements several workflow rules directly in the application:

- Only one active distributor may exist for a territory.
- Product case weights are used to calculate dispatch tonnage.
- Freight category is determined automatically:
  - **Low:** below 17 tons
  - **Medium:** 17 to below 26 tons
  - **High:** 26 tons and above
- Freight rates are configured per territory.
- Company truck + company driver results in zero freight.
- A dispatch cannot contain more cases than remain on the order.
- One order may have multiple dispatches or trips.
- Purchase Request totals can aggregate multiple dispatches belonging to the same order.
- Delivery Notes are created only when needed.

---

## 🧰 Technology Stack

| Layer | Technology |
| --- | --- |
| Backend | Python, Django |
| Frontend | HTML, CSS, JavaScript |
| Local Database | SQLite |
| Deployed Database | PostgreSQL |
| Spreadsheet Export | openpyxl |
| Production Server | Gunicorn |
| Static Files | WhiteNoise |
| Deployment | Render |
| Hosted PostgreSQL | Neon |
| Version Control | Git / GitHub |

---

## 📁 Project Structure

```text
oms/
├── manage.py
├── requirements.txt
├── oms/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
└── orders/
    ├── migrations/
    ├── static/
    │   └── orders/
    │       ├── css/
    │       ├── js/
    │       └── logo/
    ├── templates/
    │   ├── orders/
    │   └── registration/
    ├── admin.py
    ├── forms.py
    ├── models.py
    ├── tests.py
    ├── urls.py
    └── views.py
```

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd oms
```

### 2. Create a virtual environment

**Windows**

```bash
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 4. Apply migrations

```bash
python manage.py migrate
```

### 5. Create an administrator

```bash
python manage.py createsuperuser
```

### 6. Run the development server

```bash
python manage.py runserver
```

Open:

```text
http://127.0.0.1:8000/
```

When `DATABASE_URL` is not configured, the project automatically uses local SQLite.

---

## 🔑 Environment Variables

The deployed application reads configuration from environment variables.

| Variable | Purpose |
| --- | --- |
| `SECRET_KEY` | Django production secret key |
| `DEBUG` | Set to `False` in production |
| `DATABASE_URL` | PostgreSQL connection string |
| `RENDER_EXTERNAL_HOSTNAME` | Supplied automatically by Render |
| `PYTHON_VERSION` | Python runtime version used by Render |

> ⚠️ Never commit production secrets, database credentials, `.env` files, or `db.sqlite3` to a public repository.

---

## ☁️ Deployment

Current deployment architecture:

```text
GitHub
   ↓
Render Web Service
   ↓
Django + Gunicorn + WhiteNoise
   ↓
Neon PostgreSQL
```

Render automatically redeploys the application when changes are pushed to the configured GitHub branch.

Typical update workflow:

```bash
python manage.py check
git add .
git commit -m "Describe the change"
git push
```

The application is redeployed while PostgreSQL data remains persistent.

---

## 🖨️ Printing

The following documents are formatted for A4 printing:

- Loading Dispatch
- Purchase Request
- Delivery Note
- Dispatch Summary

Printing uses the browser's normal print system, so the document is sent to a printer available to the computer or device currently using the OMS.

---

## 🎯 Design Goals

The project prioritizes:

- simple and maintainable architecture
- practical business workflows
- data integrity
- clear separation between backend, templates, CSS, and JavaScript
- responsive usability
- reusable master data
- printable operational documents
- straightforward deployment and future maintenance

---

## 🛣️ Future Improvements

Possible future improvements include:

- expanded automated test coverage
- stronger concurrency controls for critical serial/dispatch operations
- more granular user roles and permissions
- audit logging
- database backup/restore tooling
- additional reporting and analytics
- improved production monitoring
- further validation based on real-world user feedback

---

## 🔒 Security Notes

This repository should never contain:

```text
db.sqlite3
.env
production SECRET_KEY values
PostgreSQL connection strings
database passwords
private API keys
```

For production use:

- keep `DEBUG=False`
- use individual user accounts
- use strong passwords
- keep secrets in environment variables
- avoid committing real operational data

---

## 🎓 CS50W

This project was created as a final project for **CS50's Web Programming with Python and JavaScript (CS50W)**.

It goes beyond a demonstration-only application by modeling a real operational workflow with multiple related business entities, dynamic calculations, printable documents, authentication, responsive behavior, PostgreSQL deployment, and concurrent multi-user access.

---

## 📄 License

No open-source license is currently granted.

If this repository is made public, the source code is visible, but it should not be assumed to be available for commercial reuse unless a license is explicitly added.

---

<p align="center">
  <strong>Built with Django • Designed for real operational use • CS50W Final Project</strong>
</p>
