from django.contrib import admin

from .models import (
    Territory,
    Distributor,
    Product,
    Driver,
    Truck,
    Order,
    OrderItem,
    Dispatch,
    DispatchItem,
    PurchaseRequest,
    DeliveryNote,
)


# =========================================================
# INLINE MODELS
# =========================================================

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

    fields = (
        "product",
        "quantity",
        "unit_price",
    )

    readonly_fields = (
        "unit_price",
    )


class DispatchItemInline(admin.TabularInline):
    model = DispatchItem
    extra = 0

    fields = (
        "order_item",
        "quantity",
    )


# =========================================================
# TERRITORY
# =========================================================

@admin.register(Territory)
class TerritoryAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "low_freight_rate",
        "medium_freight_rate",
        "high_freight_rate",
        "is_active",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
    )

    ordering = (
        "name",
    )


# =========================================================
# DISTRIBUTOR
# =========================================================

@admin.register(Distributor)
class DistributorAdmin(admin.ModelAdmin):

    list_display = (
        "customer_code",
        "full_name",
        "territory",
        "customer_type",
        "payment_status",
        "is_active",
    )

    list_filter = (
        "customer_type",
        "payment_status",
        "is_active",
        "territory",
    )

    search_fields = (
        "customer_code",
        "full_name",
        "territory__name",
    )

    ordering = (
        "full_name",
    )

    list_select_related = (
        "territory",
    )


# =========================================================
# PRODUCT
# =========================================================

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        "sku",
        "name",
        "package_type",
        "size",
        "units_per_case",
        "case_weight_kg",
        "wholesale_price",
        "retail_price",
        "is_active",
    )

    list_filter = (
        "package_type",
        "is_active",
    )

    search_fields = (
        "sku",
        "name",
        "size",
    )

    ordering = (
        "name",
        "size",
    )


# =========================================================
# DRIVER
# =========================================================

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):

    list_display = (
        "driver_code",
        "full_name",
        "is_active",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "driver_code",
        "full_name",
    )

    ordering = (
        "full_name",
    )


# =========================================================
# TRUCK
# =========================================================

@admin.register(Truck)
class TruckAdmin(admin.ModelAdmin):

    list_display = (
        "plate_number",
        "model",
        "is_active",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "plate_number",
        "model",
    )

    ordering = (
        "plate_number",
    )


# =========================================================
# ORDER
# =========================================================

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "serial_number",
        "order_date",
        "distributor",
        "status",
        "display_total_cases",
        "display_weight",
        "display_invoice_value",
        "created_at",
    )

    list_filter = (
        "status",
        "order_date",
        "distributor__territory",
    )

    search_fields = (
        "serial_number",
        "distributor__customer_code",
        "distributor__full_name",
        "distributor__territory__name",
    )

    ordering = (
        "-order_date",
        "-created_at",
    )

    list_select_related = (
        "distributor",
        "distributor__territory",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "display_total_cases",
        "display_weight",
        "display_invoice_value",
    )

    inlines = (
        OrderItemInline,
    )

    fieldsets = (
        (
            "Order Information",
            {
                "fields": (
                    "serial_number",
                    "order_date",
                    "distributor",
                    "status",
                )
            },
        ),
        (
            "Calculated Totals",
            {
                "fields": (
                    "display_total_cases",
                    "display_weight",
                    "display_invoice_value",
                )
            },
        ),
        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
                "classes": (
                    "collapse",
                ),
            },
        ),
    )

    @admin.display(description="Total Cases")
    def display_total_cases(self, obj):
        return obj.total_cases

    @admin.display(description="Weight (kg)")
    def display_weight(self, obj):
        return f"{obj.total_weight_kg:,.2f}"

    @admin.display(description="Invoice Value")
    def display_invoice_value(self, obj):
        return f"AFN {obj.invoice_value:,.2f}"


# =========================================================
# ORDER ITEM
# =========================================================

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):

    list_display = (
        "order",
        "product",
        "quantity",
        "unit_price",
        "display_total",
    )

    search_fields = (
        "order__serial_number",
        "product__sku",
        "product__name",
    )

    list_select_related = (
        "order",
        "product",
    )

    readonly_fields = (
        "unit_price",
        "display_total",
    )

    @admin.display(description="Total")
    def display_total(self, obj):
        return f"AFN {(obj.quantity * obj.unit_price):,.2f}"


# =========================================================
# DISPATCH
# =========================================================

@admin.register(Dispatch)
class DispatchAdmin(admin.ModelAdmin):

    list_display = (
        "dispatch_number",
        "order",
        "display_driver",
        "display_truck",
        "display_weight",
        "freight_category",
        "display_freight_rate",
        "display_total_freight",
        "created_at",
    )

    list_filter = (
        "order__order_date",
        "order__distributor__territory",
    )

    search_fields = (
        "dispatch_number",
        "order__serial_number",
        "order__distributor__full_name",
        "driver__full_name",
        "truck__plate_number",
        "external_driver_name",
        "external_truck_plate",
    )

    ordering = (
        "-created_at",
    )

    list_select_related = (
        "order",
        "order__distributor",
        "order__distributor__territory",
        "driver",
        "truck",
    )

    readonly_fields = (
        "created_at",
        "display_weight",
        "freight_category",
        "display_freight_rate",
        "display_total_freight",
    )

    inlines = (
        DispatchItemInline,
    )

    fieldsets = (
        (
            "Dispatch Information",
            {
                "fields": (
                    "order",
                    "dispatch_number",
                )
            },
        ),
        (
            "Company Transport",
            {
                "fields": (
                    "driver",
                    "truck",
                )
            },
        ),
        (
            "External Transport",
            {
                "fields": (
                    "external_driver_name",
                    "external_truck_plate",
                )
            },
        ),
        (
            "Calculated Freight",
            {
                "fields": (
                    "display_weight",
                    "freight_category",
                    "display_freight_rate",
                    "display_total_freight",
                )
            },
        ),
        (
            "System Information",
            {
                "fields": (
                    "created_at",
                ),
                "classes": (
                    "collapse",
                ),
            },
        ),
    )

    @admin.display(description="Driver")
    def display_driver(self, obj):
        if obj.driver:
            return obj.driver.full_name

        if obj.external_driver_name:
            return f"{obj.external_driver_name} (External)"

        return "—"

    @admin.display(description="Truck")
    def display_truck(self, obj):
        if obj.truck:
            return obj.truck.plate_number

        if obj.external_truck_plate:
            return f"{obj.external_truck_plate} (External)"

        return "—"

    @admin.display(description="Weight (tons)")
    def display_weight(self, obj):
        return f"{obj.total_weight_tons:,.2f}"

    @admin.display(description="Freight / Ton")
    def display_freight_rate(self, obj):
        return f"AFN {obj.freight_rate_per_ton:,.2f}"

    @admin.display(description="Total Freight")
    def display_total_freight(self, obj):
        return f"AFN {obj.total_freight:,.2f}"


# =========================================================
# DISPATCH ITEM
# =========================================================

@admin.register(DispatchItem)
class DispatchItemAdmin(admin.ModelAdmin):

    list_display = (
        "dispatch",
        "display_product",
        "quantity",
    )

    search_fields = (
        "dispatch__dispatch_number",
        "order_item__order__serial_number",
        "order_item__product__sku",
        "order_item__product__name",
    )

    list_select_related = (
        "dispatch",
        "order_item",
        "order_item__product",
    )

    @admin.display(description="Product")
    def display_product(self, obj):
        return obj.order_item.product


# =========================================================
# PURCHASE REQUEST
# =========================================================

@admin.register(PurchaseRequest)
class PurchaseRequestAdmin(admin.ModelAdmin):

    list_display = (
        "order",
        "display_customer",
        "display_subtotal",
        "display_weight",
        "display_freight",
        "display_payable",
        "created_at",
    )

    search_fields = (
        "order__serial_number",
        "order__distributor__customer_code",
        "order__distributor__full_name",
    )

    ordering = (
        "-created_at",
    )

    list_select_related = (
        "order",
        "order__distributor",
    )

    readonly_fields = (
        "created_at",
        "display_subtotal",
        "display_weight",
        "display_freight",
        "display_payable",
    )

    @admin.display(description="Customer")
    def display_customer(self, obj):
        return obj.order.distributor.full_name

    @admin.display(description="Subtotal")
    def display_subtotal(self, obj):
        return f"AFN {obj.subtotal:,.2f}"

    @admin.display(description="Tonnage")
    def display_weight(self, obj):
        return f"{obj.total_weight_tons:,.2f}"

    @admin.display(description="Freight")
    def display_freight(self, obj):
        return f"AFN {obj.total_freight:,.2f}"

    @admin.display(description="Payable")
    def display_payable(self, obj):
        return f"AFN {obj.payable_amount:,.2f}"


# =========================================================
# DELIVERY NOTE
# =========================================================

@admin.register(DeliveryNote)
class DeliveryNoteAdmin(admin.ModelAdmin):

    list_display = (
        "dispatch",
        "display_customer",
        "receiver_name",
        "receiver_phone",
        "delivered_at",
        "created_at",
    )

    search_fields = (
        "dispatch__dispatch_number",
        "dispatch__order__serial_number",
        "dispatch__order__distributor__full_name",
        "receiver_name",
        "receiver_id",
        "receiver_phone",
    )

    ordering = (
        "-created_at",
    )

    list_select_related = (
        "dispatch",
        "dispatch__order",
        "dispatch__order__distributor",
    )

    readonly_fields = (
        "created_at",
    )

    @admin.display(description="Customer")
    def display_customer(self, obj):
        return obj.dispatch.order.distributor.full_name


# =========================================================
# ADMIN SITE BRANDING
# =========================================================

admin.site.site_header = "OMS Administration"
admin.site.site_title = "Order Management System"
admin.site.index_title = "Administration"
