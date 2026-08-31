from django import forms
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm, SetPasswordForm
from django.forms import (
    inlineformset_factory,
    BaseInlineFormSet,
)

from .models import (
    Order,
    OrderItem,
    Territory,
    Distributor,
    Product,
    Dispatch,
    DispatchItem,
    Driver,
    Truck,
    DeliveryNote,
)


# =========================================================
# SYSTEM USERS
# =========================================================

User = get_user_model()


class OMSUserCreationForm(UserCreationForm):

    class Meta(UserCreationForm.Meta):

        model = User

        fields = (
            "username",
            "first_name",
            "last_name",
            "email",
            "is_active",
        )


class OMSUserEditForm(forms.ModelForm):

    class Meta:

        model = User

        fields = (
            "username",
            "first_name",
            "last_name",
            "email",
            "is_active",
        )


class OMSUserPasswordForm(SetPasswordForm):
    pass


# =========================================================
# MANAGEMENT FORMS
# =========================================================

class ProductForm(forms.ModelForm):

    class Meta:
        model = Product
        fields = [
            "sku",
            "name",
            "package_type",
            "size",
            "units_per_case",
            "case_weight_kg",
            "wholesale_price",
            "retail_price",
            "is_active",
        ]
        widgets = {
            "sku": forms.TextInput(
                attrs={"placeholder": "Internal SKU, e.g. PEP-1500"}
            ),
            "name": forms.TextInput(
                attrs={"placeholder": "Product name"}
            ),
            "package_type": forms.Select(),
            "size": forms.TextInput(
                attrs={"placeholder": "e.g. 1500 ml"}
            ),
            "units_per_case": forms.NumberInput(
                attrs={"min": 1}
            ),
            "case_weight_kg": forms.NumberInput(
                attrs={"min": "0.001", "step": "0.001"}
            ),
            "wholesale_price": forms.NumberInput(
                attrs={"min": 0, "step": "0.01"}
            ),
            "retail_price": forms.NumberInput(
                attrs={"min": 0, "step": "0.01"}
            ),
        }


class DriverForm(forms.ModelForm):

    class Meta:
        model = Driver
        fields = [
            "driver_code",
            "full_name",
            "is_active",
        ]
        widgets = {
            "driver_code": forms.TextInput(
                attrs={"placeholder": "Unique driver code"}
            ),
            "full_name": forms.TextInput(
                attrs={"placeholder": "Driver full name"}
            ),
        }


class TruckForm(forms.ModelForm):

    class Meta:
        model = Truck
        fields = [
            "plate_number",
            "model",
            "is_active",
        ]
        widgets = {
            "plate_number": forms.TextInput(
                attrs={"placeholder": "Truck plate number"}
            ),
            "model": forms.TextInput(
                attrs={"placeholder": "Truck model"}
            ),
        }


class DistributorForm(forms.ModelForm):

    class Meta:
        model = Distributor
        fields = [
            "customer_code",
            "full_name",
            "territory",
            "customer_type",
            "payment_status",
            "is_active",
        ]
        widgets = {
            "customer_code": forms.TextInput(
                attrs={"placeholder": "Unique customer ID / code"}
            ),
            "full_name": forms.TextInput(
                attrs={"placeholder": "Customer / distributor name"}
            ),
            "territory": forms.Select(),
            "customer_type": forms.Select(),
            "payment_status": forms.Select(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        territory_queryset = Territory.objects.filter(
            is_active=True
        )

        if self.instance and self.instance.pk:
            territory_queryset = Territory.objects.filter(
                models.Q(is_active=True)
                | models.Q(pk=self.instance.territory_id)
            )

        self.fields["territory"].queryset = (
            territory_queryset.order_by("name")
        )

    def clean(self):
        cleaned_data = super().clean()

        territory = cleaned_data.get("territory")
        is_active = cleaned_data.get("is_active")

        if territory and is_active:
            existing = Distributor.objects.filter(
                territory=territory,
                is_active=True,
            )

            if self.instance and self.instance.pk:
                existing = existing.exclude(pk=self.instance.pk)

            if existing.exists():
                self.add_error(
                    "territory",
                    "This territory already has an active distributor. "
                    "Deactivate the existing distributor before activating "
                    "another one for the same territory."
                )

        return cleaned_data


class TerritoryForm(forms.ModelForm):

    class Meta:
        model = Territory
        fields = [
            "name",
            "low_freight_rate",
            "medium_freight_rate",
            "high_freight_rate",
            "is_active",
        ]
        widgets = {
            "name": forms.TextInput(
                attrs={"placeholder": "Territory name"}
            ),
            "low_freight_rate": forms.NumberInput(
                attrs={"min": 0, "step": "0.01"}
            ),
            "medium_freight_rate": forms.NumberInput(
                attrs={"min": 0, "step": "0.01"}
            ),
            "high_freight_rate": forms.NumberInput(
                attrs={"min": 0, "step": "0.01"}
            ),
        }

# =========================================================
# CUSTOM SELECT WIDGETS
# =========================================================


class DistributorSelect(forms.Select):
    """
    Add customer business data directly to each
    Distributor <option>.

    order_form.js can then read the selected customer's
    territory and price type without another request.
    """

    def create_option(
        self,
        name,
        value,
        label,
        selected,
        index,
        subindex=None,
        attrs=None,
    ):
        option = super().create_option(
            name,
            value,
            label,
            selected,
            index,
            subindex=subindex,
            attrs=attrs,
        )

        if value and hasattr(value, "instance"):

            distributor = value.instance

            option["attrs"][
                "data-territory-id"
            ] = str(
                distributor.territory_id
            )

            option["attrs"][
                "data-territory-name"
            ] = (
                distributor.territory.name
            )

            option["attrs"][
                "data-customer-type"
            ] = (
                distributor.customer_type
            )

            option["attrs"][
                "data-payment-status"
            ] = (
                distributor.payment_status
            )

        return option


class ProductSelect(forms.Select):
    """
    Add calculation information directly to each
    Product <option>.
    """

    def create_option(
        self,
        name,
        value,
        label,
        selected,
        index,
        subindex=None,
        attrs=None,
    ):
        option = super().create_option(
            name,
            value,
            label,
            selected,
            index,
            subindex=subindex,
            attrs=attrs,
        )

        if value and hasattr(value, "instance"):

            product = value.instance

            option["attrs"][
                "data-case-weight"
            ] = str(
                product.case_weight_kg
            )

            option["attrs"][
                "data-wholesale-price"
            ] = str(
                product.wholesale_price
            )

            option["attrs"][
                "data-retail-price"
            ] = str(
                product.retail_price
            )

        return option

# =========================================================
# ORDER
# =========================================================

class OrderForm(forms.ModelForm):

    class Meta:
        model = Order
        fields = [
            "serial_number",
            "order_date",
            "distributor",
            "status",
        ]

        widgets = {
            "serial_number": forms.TextInput(
                attrs={
                    "placeholder": "Order serial number",
                }
            ),

            "order_date": forms.DateInput(
                attrs={
                    "type": "date",
                },
                format="%Y-%m-%d",
            ),

            "distributor": DistributorSelect(
            attrs={
                "data-order-distributor-select":
                    "true",
                }
            ),

            "status": forms.Select(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Show active distributors.
        # When editing an existing order, also keep its
        # distributor available even if later marked inactive.
        queryset = Distributor.objects.filter(
            is_active=True
        )

        if self.instance and self.instance.pk:
            queryset = Distributor.objects.filter(
                models.Q(is_active=True)
                | models.Q(pk=self.instance.distributor_id)
            )

        self.fields["distributor"].queryset = (
            queryset
            .select_related("territory")
            .order_by("full_name")
        )


# =========================================================
# ORDER ITEMS
# =========================================================

class OrderItemForm(forms.ModelForm):

    class Meta:
        model = OrderItem
        fields = [
            "product",
            "quantity",
        ]

        widgets = {
            "product": ProductSelect(),

            "quantity": forms.NumberInput(
                attrs={
                    "min": 1,
                    "placeholder": "Cases",
                }
            ),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        queryset = Product.objects.filter(
            is_active=True
        )

        # Keep an existing inactive product visible
        # when an old order is being edited.
        if self.instance and self.instance.pk:
            queryset = Product.objects.filter(
                models.Q(is_active=True)
                | models.Q(pk=self.instance.product_id)
            )

        self.fields["product"].queryset = queryset.order_by(
            "name",
            "size",
        )


class BaseOrderItemFormSet(BaseInlineFormSet):

    def clean(self):
        super().clean()

        if any(self.errors):
            return

        products = set()
        valid_item_count = 0

        for form in self.forms:

            if not hasattr(form, "cleaned_data"):
                continue

            if form.cleaned_data.get("DELETE"):
                continue

            product = form.cleaned_data.get("product")
            quantity = form.cleaned_data.get("quantity")

            if product is None and quantity is None:
                continue

            if product:
                if product.pk in products:
                    raise forms.ValidationError(
                        "The same product cannot appear more than once "
                        "in an order."
                    )

                products.add(product.pk)

            if product and quantity:
                valid_item_count += 1

        if valid_item_count == 0:
            raise forms.ValidationError(
                "An order must contain at least one product."
            )


OrderItemFormSet = inlineformset_factory(
    Order,
    OrderItem,
    form=OrderItemForm,
    formset=BaseOrderItemFormSet,
    fields=[
        "product",
        "quantity",
    ],
    extra=5,
    can_delete=True,
)


# =========================================================
# DISPATCH
# =========================================================

class DispatchForm(forms.ModelForm):

    class Meta:
        model = Dispatch

        fields = [
            "order",
            "dispatch_number",
            "dispatch_date",
            "driver",
            "truck",
            "external_driver_name",
            "external_truck_plate",
        ]

        widgets = {
            "order": forms.Select(),

            "dispatch_number": forms.TextInput(
                attrs={
                    "placeholder":
                        "Dispatch number",
                }
            ),

            "dispatch_date": forms.DateInput(
                attrs={
                    "type": "date",
                },
                format="%Y-%m-%d",
            ),

            "driver": forms.Select(),

            "truck": forms.Select(),

            "external_driver_name":
                forms.TextInput(
                    attrs={
                        "placeholder":
                            "External driver name",
                    }
                ),

            "external_truck_plate":
                forms.TextInput(
                    attrs={
                        "placeholder":
                            "External truck plate",
                    }
                ),
        }

    def __init__(
        self,
        *args,
        **kwargs
    ):
        super().__init__(
            *args,
            **kwargs
        )

        self.fields[
            "order"
        ].queryset = (
            Order.objects
            .exclude(
                status="CANCELLED"
            )
            .select_related(
                "distributor"
            )
            .order_by(
                "-order_date",
                "-created_at",
            )
        )

        driver_queryset = (
            Driver.objects
            .filter(
                is_active=True
            )
        )

        truck_queryset = (
            Truck.objects
            .filter(
                is_active=True
            )
        )

        # Preserve historical selections
        # while editing a Dispatch.
        if (
            self.instance
            and self.instance.pk
        ):

            if self.instance.driver_id:

                driver_queryset = (
                    Driver.objects.filter(
                        models.Q(
                            is_active=True
                        )
                        |
                        models.Q(
                            pk=
                            self.instance.driver_id
                        )
                    )
                )

            if self.instance.truck_id:

                truck_queryset = (
                    Truck.objects.filter(
                        models.Q(
                            is_active=True
                        )
                        |
                        models.Q(
                            pk=
                            self.instance.truck_id
                        )
                    )
                )

        self.fields[
            "driver"
        ].queryset = (
            driver_queryset
            .order_by("full_name")
        )

        self.fields[
            "truck"
        ].queryset = (
            truck_queryset
            .order_by("plate_number")
        )

        self.fields[
            "driver"
        ].required = False

        self.fields[
            "truck"
        ].required = False

        self.fields[
            "external_driver_name"
        ].required = False

        self.fields[
            "external_truck_plate"
        ].required = False

    def clean(self):
        cleaned_data = super().clean()

        driver = cleaned_data.get(
            "driver"
        )

        truck = cleaned_data.get(
            "truck"
        )

        external_driver_name = (
            cleaned_data.get(
                "external_driver_name"
            )
        )

        external_truck_plate = (
            cleaned_data.get(
                "external_truck_plate"
            )
        )

        if (
            driver
            and external_driver_name
        ):

            self.add_error(
                "external_driver_name",
                (
                    "Choose a company driver "
                    "or enter an external driver, "
                    "not both."
                )
            )

        if (
            truck
            and external_truck_plate
        ):

            self.add_error(
                "external_truck_plate",
                (
                    "Choose a company truck "
                    "or enter an external truck "
                    "plate, not both."
                )
            )

        return cleaned_data


# =========================================================
# DISPATCH ITEMS
# =========================================================

class DispatchItemForm(forms.ModelForm):

    class Meta:
        model = DispatchItem

        fields = [
            "order_item",
            "quantity",
        ]

        widgets = {
            "order_item": forms.Select(),

            "quantity": forms.NumberInput(
                attrs={
                    "min": 1,
                    "placeholder": "Cases",
                }
            ),
        }

    def __init__(
        self,
        *args,
        order=None,
        **kwargs
    ):
        super().__init__(*args, **kwargs)

        queryset = OrderItem.objects.none()

        if order is not None:
            queryset = (
                OrderItem.objects
                .filter(order=order)
                .select_related("product")
                .order_by(
                    "product__name",
                    "product__size",
                )
            )

        elif (
            self.instance
            and self.instance.pk
        ):
            queryset = (
                OrderItem.objects
                .filter(
                    order=self.instance.dispatch.order
                )
                .select_related("product")
                .order_by(
                    "product__name",
                    "product__size",
                )
            )

        self.fields["order_item"].queryset = queryset


class BaseDispatchItemFormSet(BaseInlineFormSet):

    def clean(self):
        super().clean()

        if any(self.errors):
            return

        order_items = set()
        valid_item_count = 0

        for form in self.forms:

            if not hasattr(form, "cleaned_data"):
                continue

            if form.cleaned_data.get("DELETE"):
                continue

            order_item = form.cleaned_data.get(
                "order_item"
            )

            quantity = form.cleaned_data.get(
                "quantity"
            )

            if order_item is None and quantity is None:
                continue

            if order_item:

                if order_item.pk in order_items:
                    raise forms.ValidationError(
                        "The same product cannot appear more than "
                        "once in a dispatch."
                    )

                order_items.add(order_item.pk)

            if order_item and quantity:
                valid_item_count += 1

        if valid_item_count == 0:
            raise forms.ValidationError(
                "A dispatch must contain at least one product."
            )


DispatchItemFormSet = inlineformset_factory(
    Dispatch,
    DispatchItem,
    form=DispatchItemForm,
    formset=BaseDispatchItemFormSet,
    fields=[
        "order_item",
        "quantity",
    ],
    extra=5,
    can_delete=True,
)


# =========================================================
# DELIVERY NOTE
# =========================================================

class DeliveryNoteForm(forms.ModelForm):

    class Meta:
        model = DeliveryNote

        fields = [
            "receiver_name",
            "receiver_id",
            "receiver_phone",
            "delivered_at",
            "notes",
        ]

        widgets = {
            "receiver_name": forms.TextInput(
                attrs={
                    "placeholder": "Receiver name",
                }
            ),

            "receiver_id": forms.TextInput(
                attrs={
                    "placeholder": "Receiver ID",
                }
            ),

            "receiver_phone": forms.TextInput(
                attrs={
                    "placeholder": "Phone number",
                }
            ),

            "delivered_at": forms.DateTimeInput(
                attrs={
                    "type": "datetime-local",
                },
                format="%Y-%m-%dT%H:%M",
            ),

            "notes": forms.Textarea(
                attrs={
                    "rows": 4,
                    "placeholder": "Optional notes",
                }
            ),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Delivery information may not be known
        # when the note is initially created.
        self.fields["receiver_name"].required = False
        self.fields["receiver_id"].required = False
        self.fields["receiver_phone"].required = False
        self.fields["delivered_at"].required = False
        self.fields["notes"].required = False
