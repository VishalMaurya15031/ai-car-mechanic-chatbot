from rest_framework import serializers
from .models import Conversation, UploadedMedia, Message, DiagnosisReport, MechanicBooking

class UploadedMediaSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = UploadedMedia
        fields = ['id', 'file', 'file_url', 'media_type', 'created_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

class MessageSerializer(serializers.ModelSerializer):
    media = UploadedMediaSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'text', 'media', 'created_at']

class DiagnosisReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiagnosisReport
        fields = ['id', 'conversation', 'summary', 'severity', 'probable_causes', 'recommended_fixes', 'estimated_cost', 'created_at']

class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    latest_diagnosis = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'messages', 'latest_diagnosis', 'created_at', 'updated_at']

    def get_latest_diagnosis(self, obj):
        diag = obj.diagnoses.order_by('-created_at').first()
        if diag:
            return DiagnosisReportSerializer(diag).data
        return None

class MechanicBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MechanicBooking
        fields = [
            'id', 'diagnosis', 'customer_name', 'customer_phone',
            'car_details', 'service_type', 'location_address',
            'preferred_date', 'notes', 'status', 'created_at'
        ]
