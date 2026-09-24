import uuid
from django.db import models

class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, default="New Vehicle Diagnostic Session")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Session {str(self.id)[:8]} - {self.title}"

class UploadedMedia(models.Model):
    MEDIA_TYPES = [
        ('image', 'Image'),
        ('audio', 'Audio'),
        ('video', 'Video'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='mechanic_uploads/')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.media_type.upper()} ({self.id})"

class Message(models.Model):
    SENDER_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    text = models.TextField()
    media = models.ForeignKey(UploadedMedia, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender}: {self.text[:30]}"

class DiagnosisReport(models.Model):
    SEVERITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='diagnoses')
    summary = models.CharField(max_length=255)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='Medium')
    probable_causes = models.JSONField(default=list)
    recommended_fixes = models.JSONField(default=list)
    estimated_cost = models.CharField(max_length=100, default="$100 - $350")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Diagnosis [{self.severity}]: {self.summary}"

class MechanicBooking(models.Model):
    SERVICE_TYPES = [
        ('doorstep', 'Doorstep Mechanic Visit'),
        ('workshop', 'Workshop Drop-off'),
        ('towing', 'Emergency Towing Service'),
    ]
    STATUS_CHOICES = [
        ('Confirmed', 'Confirmed'),
        ('Assigned', 'Mechanic Assigned'),
        ('In Progress', 'Diagnosis & Repair in Progress'),
        ('Completed', 'Service Completed'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    diagnosis = models.ForeignKey(DiagnosisReport, on_delete=models.SET_NULL, null=True, blank=True)
    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=20)
    car_details = models.CharField(max_length=200) # e.g. 2018 Honda Civic
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES, default='doorstep')
    location_address = models.TextField()
    preferred_date = models.CharField(max_length=50, default="As soon as possible")
    notes = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Confirmed')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking #{str(self.id)[:8]} ({self.customer_name}) - {self.status}"
