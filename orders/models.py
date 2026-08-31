from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db.models import Sum, Q


# Create your models here.
class Territory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    low_freight_rate = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    medium_freight_rate = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    high_freight_rate = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )

    def __str__(self):
        return self.name

class Distributor(models.Model):
    CUSTOMER_TYPES = [
        ("WHOLESALER", "Wholesaler"),
        ("RETAILER", "Retailer"),
    ]

    PAYMENT_TYPES = [
        ("CASH", "Cash"),
        ("CREDIT", "Credit"),
    ]

    customer_code = models.CharField(max_length=30, unique=True)
    full_name = models.CharField(max_length=150)

    territory = models.ForeignKey(
        Territory,
        on_delete=models.PROTECT,
        related_name="distributors"
    )

    customer_type = models.CharField(
        max_length=20,
        choices=CUSTOMER_TYPES
    )

    payment_status = models.CharField(
        max_length=10,
        choices=PAYMENT_TYPES
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["territory"],
                condition=Q(is_active=True),
                name="one_active_distributor_per_territory"
            )
        ]

    def __str__(self):
        return f"{self.full_name} ({self.customer_code})"


class Product(models.Model):
    name = models.CharField(max_length=100)
    sku = models.CharField(max_length=30, unique=True)

    size = models.CharField(max_length=30)
    units_per_case = models.PositiveIntegerField()
    case_weight_kg = models.DecimalField(
        max_digits=8,
        decimal_places=3
    )

    wholesale_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    retail_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    PACKAGE_TYPES = [
    ("PET", "PET"),
    ("CAN", "Can"),
    ]

    package_type = models.CharField(
        max_length=20,
        choices=PACKAGE_TYPES
    )

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.size}"  

class Driver(models.Model):
    driver_code = models.CharField(max_length=30, unique=True)
    full_name = models.CharField(max_length=150)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.full_name} ({self.driver_code})"


class Truck(models.Model):
    plate_number = models.CharField(max_length=30, unique=True)
    model = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.plate_number} - {self.model}"


class Order(models.Model):
    STATUS_CHOICES = [
        ("DRAFT", "Draft"),
        ("CONFIRMED", "Confirmed"),
        ("CANCELLED", "Cancelled"),
    ]

    serial_number = models.CharField(max_length=30, unique=True)
    order_date = models.DateField(default=timezone.localdate)

    distributor = models.ForeignKey(
        Distributor,
        on_delete=models.PROTECT,
        related_name="orders"
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="DRAFT"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_cases(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def total_weight_kg(self):
        return sum(
            (
                item.quantity * item.product.case_weight_kg
                for item in self.items.all()
            ),
            Decimal("0")
        )

    @property
    def total_weight_tons(self):
        return self.total_weight_kg / Decimal("1000")


    @property
    def invoice_value(self):
        return sum(
            (
                item.quantity * item.unit_price
                for item in self.items.all()
            ),
            Decimal("0")
        )

    def __str__(self):
        return f"{self.serial_number} - {self.distributor.full_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="order_items"
    )

    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        editable=False
    )

    def save(self, *args, **kwargs):
        if self._state.adding:
            if self.order.distributor.customer_type == "WHOLESALER":
                self.unit_price = self.product.wholesale_price
            else:
                self.unit_price = self.product.retail_price

        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["order", "product"],
                name="unique_product_per_order"
            )
        ]

    def __str__(self):
        return f"{self.order.serial_number} - {self.product} x {self.quantity}"


class Dispatch(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="dispatches"
    )

    dispatch_number = models.CharField(
        max_length=40,
        unique=True
    )

    dispatch_date = models.DateField(
        default=timezone.localdate
    )

    driver = models.ForeignKey(
        Driver,
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )

    truck = models.ForeignKey(
        Truck,
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )

    external_driver_name = models.CharField(
        max_length=150,
        blank=True
    )

    external_truck_plate = models.CharField(
        max_length=30,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def total_weight_kg(self):
        return sum(
            (
                item.quantity * item.order_item.product.case_weight_kg
                for item in self.items.all()
            ),
            Decimal("0")
        )


    @property
    def total_weight_tons(self):
        return self.total_weight_kg / Decimal("1000")


    @property
    def freight_category(self):
        weight = self.total_weight_tons

        if weight < 17:
            return "LOW"
        elif weight < 26:
            return "MEDIUM"
        return "HIGH"


    @property
    def freight_rate_per_ton(self):
        # Company driver + company truck = no freight
        if self.driver and self.truck:
            return Decimal("0")

        territory = self.order.distributor.territory

        if self.freight_category == "LOW":
            return territory.low_freight_rate
        elif self.freight_category == "MEDIUM":
            return territory.medium_freight_rate

        return territory.high_freight_rate


    @property
    def total_freight(self):
        return self.total_weight_tons * self.freight_rate_per_ton


    def __str__(self):
        return self.dispatch_number


class DispatchItem(models.Model):
    dispatch = models.ForeignKey(
        Dispatch,
        on_delete=models.CASCADE,
        related_name="items"
    )

    order_item = models.ForeignKey(
        OrderItem,
        on_delete=models.PROTECT,
        related_name="dispatch_items"
    )

    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["dispatch", "order_item"],
                name="unique_item_per_dispatch"
            )
        ]

    def clean(self):
        # The item must belong to the same order as the dispatch.
        if self.dispatch_id and self.order_item_id:
            if self.dispatch.order_id != self.order_item.order_id:
                raise ValidationError(
                    "This product does not belong to the dispatch's order."
                )

            already_dispatched = (
                DispatchItem.objects
                .filter(order_item=self.order_item)
                .exclude(pk=self.pk)
                .aggregate(total=Sum("quantity"))["total"]
                or 0
            )

            if already_dispatched + self.quantity > self.order_item.quantity:
                raise ValidationError({
                    "quantity": "Dispatched quantity cannot exceed ordered quantity."
                })

    def __str__(self):
        return (
            f"{self.dispatch.dispatch_number} - "
            f"{self.order_item.product} x {self.quantity}"
        )

class PurchaseRequest(models.Model):
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="purchase_request"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def subtotal(self):
        return self.order.invoice_value


    @property
    def total_freight(self):
        return sum(
            (dispatch.total_freight for dispatch in self.order.dispatches.all()),
            Decimal("0")
        )


    @property
    def payable_amount(self):
        return self.subtotal - self.total_freight


    @property
    def total_weight_tons(self):
        return sum(
            (dispatch.total_weight_tons for dispatch in self.order.dispatches.all()),
            Decimal("0")
        )


    def __str__(self):
        return f"PR - {self.order.serial_number}"


class DeliveryNote(models.Model):
    dispatch = models.OneToOneField(
        Dispatch,
        on_delete=models.CASCADE,
        related_name="delivery_note"
    )

    receiver_name = models.CharField(
        max_length=150,
        blank=True
    )

    receiver_id = models.CharField(
        max_length=50,
        blank=True
    )

    receiver_phone = models.CharField(
        max_length=30,
        blank=True
    )

    delivered_at = models.DateTimeField(
        null=True,
        blank=True
    )

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Delivery Note - {self.dispatch.dispatch_number}"

