from django.urls import path

from . import views


app_name = "orders"


urlpatterns = [

    # =====================================================
    # DASHBOARD
    # =====================================================

    path(
        "",
        views.dashboard,
        name="dashboard",
    ),

    # =====================================================
    # HELP
    # =====================================================


    path(
        "help/",
        views.help_page,
        name="help",
    ),



    # =====================================================
    # MANAGEMENT
    # =====================================================

    path(
        "management/",
        views.management_home,
        name="management_home",
    ),

    # Products
    path(
        "management/products/",
        views.product_list,
        name="product_list",
    ),
    path(
        "management/products/new/",
        views.product_create,
        name="product_create",
    ),
    path(
        "management/products/<int:product_id>/edit/",
        views.product_edit,
        name="product_edit",
    ),
    path(
        "management/products/<int:product_id>/toggle-status/",
        views.product_toggle_status,
        name="product_toggle_status",
    ),

    # Drivers
    path(
        "management/drivers/",
        views.driver_list,
        name="driver_list",
    ),
    path(
        "management/drivers/new/",
        views.driver_create,
        name="driver_create",
    ),
    path(
        "management/drivers/<int:driver_id>/edit/",
        views.driver_edit,
        name="driver_edit",
    ),
    path(
        "management/drivers/<int:driver_id>/toggle-status/",
        views.driver_toggle_status,
        name="driver_toggle_status",
    ),

    # Trucks
    path(
        "management/trucks/",
        views.truck_list,
        name="truck_list",
    ),
    path(
        "management/trucks/new/",
        views.truck_create,
        name="truck_create",
    ),
    path(
        "management/trucks/<int:truck_id>/edit/",
        views.truck_edit,
        name="truck_edit",
    ),
    path(
        "management/trucks/<int:truck_id>/toggle-status/",
        views.truck_toggle_status,
        name="truck_toggle_status",
    ),

    # Customers / Distributors
    path(
        "management/customers/",
        views.distributor_list,
        name="distributor_list",
    ),
    path(
        "management/customers/new/",
        views.distributor_create,
        name="distributor_create",
    ),
    path(
        "management/customers/<int:distributor_id>/edit/",
        views.distributor_edit,
        name="distributor_edit",
    ),
    path(
        "management/customers/<int:distributor_id>/toggle-status/",
        views.distributor_toggle_status,
        name="distributor_toggle_status",
    ),

    # Territories
    path(
        "management/territories/",
        views.territory_list,
        name="territory_list",
    ),
    path(
        "management/territories/new/",
        views.territory_create,
        name="territory_create",
    ),
    path(
        "management/territories/<int:territory_id>/edit/",
        views.territory_edit,
        name="territory_edit",
    ),
    path(
        "management/territories/<int:territory_id>/toggle-status/",
        views.territory_toggle_status,
        name="territory_toggle_status",
    ),


    # =====================================================
    # ORDERS
    # =====================================================

    path(
        "orders/",
        views.order_list,
        name="order_list",
    ),

    path(
        "orders/new/",
        views.order_create,
        name="order_create",
    ),

    path(
        "orders/<int:order_id>/",
        views.order_detail,
        name="order_detail",
    ),

    path(
        "orders/<int:order_id>/edit/",
        views.order_edit,
        name="order_edit",
    ),

    path(
        "orders/<int:order_id>/print/",
        views.order_print,
        name="order_print",
    ),


    # =====================================================
    # DISPATCHES
    # =====================================================

    path(
        "dispatches/",
        views.dispatch_list,
        name="dispatch_list",
    ),

    path(
        "orders/<int:order_id>/dispatch/new/",
        views.dispatch_create,
        name="dispatch_create",
    ),

    path(
        "dispatches/<int:dispatch_id>/",
        views.dispatch_detail,
        name="dispatch_detail",
    ),

    path(
        "dispatches/<int:dispatch_id>/edit/",
        views.dispatch_edit,
        name="dispatch_edit",
    ),

    path(
        "dispatches/<int:dispatch_id>/print/",
        views.dispatch_print,
        name="dispatch_print",
    ),


    # =====================================================
    # PURCHASE REQUESTS
    # =====================================================

    path(
        "orders/<int:order_id>/purchase-request/",
        views.purchase_request_detail,
        name="purchase_request_detail",
    ),

    path(
        "orders/<int:order_id>/purchase-request/print/",
        views.purchase_request_print,
        name="purchase_request_print",
    ),


    # =====================================================
    # DELIVERY NOTES
    # =====================================================

    path(
        "dispatches/<int:dispatch_id>/delivery-note/",
        views.delivery_note_detail,
        name="delivery_note_detail",
    ),

    path(
        "dispatches/<int:dispatch_id>/delivery-note/edit/",
        views.delivery_note_edit,
        name="delivery_note_edit",
    ),

    path(
        "dispatches/<int:dispatch_id>/delivery-note/print/",
        views.delivery_note_print,
        name="delivery_note_print",
    ),


    # =====================================================
    # REPORTS
    # =====================================================

    path(
        "reports/dispatch-summary/",
        views.dispatch_summary,
        name="dispatch_summary",
    ),

    path(
    "reports/dispatch-summary/",
    views.dispatch_summary,
    name="dispatch_summary",
    ),

    path(
        "reports/dispatch-summary/excel/",
        views.dispatch_summary_excel,
        name="dispatch_summary_excel",
    ),

    path(
    "management/users/",
    views.user_list,
    name="user_list",
    ),

    path(
        "management/users/add/",
        views.user_create,
        name="user_create",
    ),

    path(
        "management/users/<int:user_id>/edit/",
        views.user_edit,
        name="user_edit",
    ),

    path(
        "management/users/<int:user_id>/status/",
        views.user_toggle_status,
        name="user_toggle_status",
    ),

    path(
        "management/users/<int:user_id>/password/",
        views.user_reset_password,
        name="user_reset_password",
    ),

    path(
    "dispatches/<int:dispatch_id>/delivery-note/create/",
    views.delivery_note_create,
    name="delivery_note_create",
    ),
]
