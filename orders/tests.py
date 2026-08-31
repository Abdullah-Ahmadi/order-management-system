from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from .models import Product


class ManagementViewsTests(TestCase):

    @classmethod
    def setUpTestData(cls):
        User = get_user_model()
        cls.user = User.objects.create_user(
            username="manager",
            password="test-password-123",
        )

    def setUp(self):
        self.client.force_login(self.user)

    def test_management_home_loads(self):
        response = self.client.get(
            reverse("orders:management_home")
        )
        self.assertEqual(response.status_code, 200)

    def test_product_can_be_created(self):
        response = self.client.post(
            reverse("orders:product_create"),
            {
                "sku": "TEST-250",
                "name": "Test Product",
                "package_type": "CAN",
                "size": "250 ml",
                "units_per_case": 24,
                "case_weight_kg": "7.500",
                "wholesale_price": "400.00",
                "retail_price": "450.00",
                "is_active": "on",
            },
        )

        self.assertRedirects(
            response,
            reverse("orders:product_list"),
        )
        self.assertTrue(
            Product.objects.filter(sku="TEST-250").exists()
        )

    def test_product_status_can_be_toggled(self):
        product = Product.objects.create(
            sku="TOGGLE-1",
            name="Toggle Product",
            package_type="PET",
            size="1500 ml",
            units_per_case=6,
            case_weight_kg="9.000",
            wholesale_price="300.00",
            retail_price="350.00",
            is_active=True,
        )

        response = self.client.post(
            reverse(
                "orders:product_toggle_status",
                args=[product.id],
            )
        )

        self.assertRedirects(
            response,
            reverse("orders:product_list"),
        )
        product.refresh_from_db()
        self.assertFalse(product.is_active)
