from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from django.utils import timezone
import datetime
from plans.models import ServicePlan, Discount
from orders.models import WorkOrder, Payment, OrderStatus, FinancialYear, EntityType, ReturnType
from users.models import ClientProfile
from users.serializers import ClientProfileSerializer
from core.encryption import decrypt_data
from queries.models import Query, QueryStatus
from deliveries.models import WorkDelivery, DeliveryStatus, DeliveryType
from audit.models import AuditLog
from audit.signals import AuditMiddleware, _thread_locals

User = get_user_model()

class ITRPlatformTestCase(TestCase):
    def setUp(self):
        # Create users
        self.owner = User.objects.create_user(
            username='owner@example.com',
            email='owner@example.com',
            password='Password123',
            role='owner',
            name='Owner User'
        )
        self.staff = User.objects.create_user(
            username='staff@example.com',
            email='staff@example.com',
            password='Password123',
            role='staff',
            name='Staff User'
        )
        self.client = User.objects.create_user(
            username='client@example.com',
            email='client@example.com',
            password='Password123',
            role='client',
            name='Client User'
        )
        
        # Create service plan
        self.plan = ServicePlan.objects.create(
            name="Simple Return",
            description="Simple Return Description",
            base_price=1500.00,
            required_documents=["Form 16", "Bank Statements"]
        )

        # Create discount code
        self.discount = Discount.objects.create(
            code="TEST10",
            discount_type="percentage",
            discount_value=10.00,
            valid_until=timezone.now() + datetime.timedelta(days=10),
            max_uses=5,
            current_uses=0,
            is_active=True
        )

    def test_discount_validation(self):
        # Verify discount code validation logic
        self.assertTrue(self.discount.is_valid())
        
        # Increment current uses
        self.discount.current_uses = 5
        self.discount.save()
        self.assertFalse(self.discount.is_valid())
        
        # Reset and expire
        self.discount.current_uses = 0
        self.discount.valid_until = timezone.now() - datetime.timedelta(days=1)
        self.discount.save()
        self.assertFalse(self.discount.is_valid())

    def test_client_profile_encryption(self):
        # Construct profile data
        profile_data = {
            'pan_number': 'ABCDE1234F',
            'aadhaar_number': '123456789012',
            'aadhaar_consent': True,
            'fathers_name': 'Fathers Name',
            'residential_address': '123 Test St',
            'tax_regime': 'new',
            'bank_details_encrypted': '{"bank": "SBI"}',
            'it_portal_password': 'PortalPassword123',
            'data_consent_accepted': True,
            'privacy_policy_version': '1.0'
        }
        
        # Simulate serializer validation and save
        serializer = ClientProfileSerializer(data=profile_data)
        serializer.context['request'] = type('MockRequest', (object,), {'user': self.client})()
        
        self.assertTrue(serializer.is_valid(), serializer.errors)
        profile = serializer.save()
        
        # Assert database content is encrypted
        self.assertNotEqual(profile.pan_number, 'ABCDE1234F')
        self.assertNotEqual(profile.aadhaar_encrypted, '123456789012')
        self.assertNotEqual(profile.it_portal_password_vault, 'PortalPassword123')
        
        # Verify correct decryption
        self.assertEqual(decrypt_data(profile.pan_number), 'ABCDE1234F')
        self.assertEqual(decrypt_data(profile.aadhaar_encrypted), '123456789012')
        self.assertEqual(decrypt_data(profile.it_portal_password_vault), 'PortalPassword123')
        
        # Verify API serialization masks PAN
        serialized_data = serializer.data
        self.assertEqual(serialized_data['pan_masked'], 'XXXXX234FX')
        self.assertNotIn('pan_number', serialized_data)
        self.assertNotIn('aadhaar_number', serialized_data)
        self.assertNotIn('it_portal_password', serialized_data)

    def test_order_creation_and_payment_flow(self):
        # Create work order
        order = WorkOrder.objects.create(
            client=self.client,
            service=self.plan,
            status=OrderStatus.PENDING_PAYMENT,
            financial_year=FinancialYear.FY_2024_25,
            entity_type=EntityType.INDIVIDUAL,
            income_types=["salary"],
            original_or_revised=ReturnType.ORIGINAL,
            final_price=1500.00
        )
        
        self.assertEqual(order.status, OrderStatus.PENDING_PAYMENT)
        
        # Submit payment proof
        payment = Payment.objects.create(
            order=order,
            amount=1500.00,
            utr_number="123456789012",
            status="pending"
        )
        
        # Transition to documents pending
        order.status = OrderStatus.DOCUMENTS_PENDING
        order.save()
        
        self.assertEqual(order.status, OrderStatus.DOCUMENTS_PENDING)
        self.assertEqual(order.payment.utr_number, "123456789012")
        self.assertEqual(order.payment.status, "pending")

    def test_query_flow(self):
        # Create work order
        order = WorkOrder.objects.create(
            client=self.client,
            service=self.plan,
            status=OrderStatus.PROCESSING,
            financial_year=FinancialYear.FY_2024_25,
            entity_type=EntityType.INDIVIDUAL,
            income_types=["salary"],
            original_or_revised=ReturnType.ORIGINAL,
            final_price=1500.00
        )
        
        # Raise a query
        query = Query.objects.create(
            order=order,
            raised_by=self.staff,
            query_text="Please upload Bank Statement for March 2025"
        )
        
        # Change order status to QUERY_RAISED (normally handled by view)
        order.status = OrderStatus.QUERY_RAISED
        order.save()
        
        self.assertEqual(query.status, QueryStatus.OPEN)
        self.assertEqual(order.status, OrderStatus.QUERY_RAISED)
        
        # Client replies
        query.client_reply = "Here is the missing document link."
        query.status = QueryStatus.REPLIED
        query.replied_at = timezone.now()
        query.save()
        
        # Update order status to PROCESSING
        order.status = OrderStatus.PROCESSING
        order.save()
        
        self.assertEqual(query.status, QueryStatus.REPLIED)
        self.assertEqual(order.status, OrderStatus.PROCESSING)

    def test_delivery_and_approval_flow(self):
        # Create work order
        order = WorkOrder.objects.create(
            client=self.client,
            service=self.plan,
            status=OrderStatus.PROCESSING,
            financial_year=FinancialYear.FY_2024_25,
            entity_type=EntityType.INDIVIDUAL,
            income_types=["salary"],
            original_or_revised=ReturnType.ORIGINAL,
            final_price=1500.00
        )
        
        # Staff submits delivery
        delivery = WorkDelivery.objects.create(
            order=order,
            submitted_by=self.staff,
            approval_status=DeliveryStatus.PENDING,
            delivery_type=DeliveryType.XML_DELIVERY
        )
        
        order.status = OrderStatus.REVIEW
        order.save()
        
        self.assertEqual(delivery.approval_status, DeliveryStatus.PENDING)
        self.assertEqual(order.status, OrderStatus.REVIEW)
        
        # Owner approves delivery
        delivery.approval_status = DeliveryStatus.APPROVED
        delivery.approved_by = self.owner
        delivery.approved_at = timezone.now()
        delivery.delivered_at = timezone.now()
        delivery.save()
        
        order.status = OrderStatus.COMPLETED
        order.save()
        
        self.assertEqual(delivery.approval_status, DeliveryStatus.APPROVED)
        self.assertEqual(order.status, OrderStatus.COMPLETED)

    def test_audit_logging_via_middleware(self):
        # Mock request setup for middleware
        factory = RequestFactory()
        request = factory.get('/')
        request.user = self.client
        _thread_locals.request = request
        
        # Clear existing logs for simplicity
        AuditLog.objects.all().delete()
        
        # Trigger post_save on WorkOrder to log creation
        order = WorkOrder.objects.create(
            client=self.client,
            service=self.plan,
            status=OrderStatus.PENDING_PAYMENT,
            financial_year=FinancialYear.FY_2024_25,
            entity_type=EntityType.INDIVIDUAL,
            income_types=["salary"],
            original_or_revised=ReturnType.ORIGINAL,
            final_price=1500.00
        )
        
        # Check that an AuditLog entry was created automatically
        logs = AuditLog.objects.filter(entity_type='WorkOrder', entity_id=str(order.id))
        self.assertEqual(logs.count(), 1)
        log = logs.first()
        self.assertEqual(log.actor, self.client)
        self.assertEqual(log.actor_role, 'client')
        self.assertEqual(log.action, 'CREATED')
        
        # Cleanup thread locals
        _thread_locals.request = None
