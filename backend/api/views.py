from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.conf import settings

from .models import Conversation, UploadedMedia, Message, DiagnosisReport, MechanicBooking
from .serializers import (
    ConversationSerializer, MessageSerializer, UploadedMediaSerializer,
    DiagnosisReportSerializer, MechanicBookingSerializer
)
from .services.rule_engine import SmartRuleEngine
from .services.ai_service import AIService

@api_view(['GET'])
def health_check(request):
    api_key = getattr(settings, 'GEMINI_API_KEY', '')
    return Response({
        'status': 'healthy',
        'service': 'AI Car Mechanic Chatbot API',
        'version': '1.0.0',
        'gemini_configured': bool(api_key and len(api_key.strip()) > 10)
    })

@api_view(['POST'])
def chat_api(request):
    """
    POST /api/chat/
    Send user prompt/media to mechanic chatbot. Uses Zero-AI Rule Engine first for cost control,
    then invokes Gemini AI / Local Fallback.
    """
    conversation_id = request.data.get('conversation_id')
    text = request.data.get('text', '').strip()
    media_id = request.data.get('media_id')

    # Get or create conversation
    if conversation_id:
        conversation = get_object_or_404(Conversation, id=conversation_id)
    else:
        title = text[:40] if text else "Media Diagnostic Session"
        conversation = Conversation.objects.create(title=title)

    # Get media if attached
    media_obj = None
    if media_id:
        try:
            media_obj = UploadedMedia.objects.get(id=media_id)
        except UploadedMedia.DoesNotExist:
            pass

    # Save User Message
    user_msg = Message.objects.create(
        conversation=conversation,
        sender='user',
        text=text if text else "[Uploaded Attachment]",
        media=media_obj
    )

    # 1. First, check Zero-AI Rule Engine to minimize AI API costs
    rule_result = SmartRuleEngine.evaluate(text) if text and not media_obj else None

    if rule_result and rule_result.get('handled'):
        reply_text = rule_result['text']
        source = rule_result['source']
        diagnosis_data = rule_result.get('diagnosis_card')
    else:
        # 2. Invoke AI Service (Gemini or Local Fallback)
        ai_res = AIService.process_chat(
            user_message=text,
            conversation_history=list(conversation.messages.values('sender', 'text')),
            media_obj=media_obj
        )
        reply_text = ai_res['text']
        source = ai_res['source']
        diagnosis_data = ai_res.get('diagnosis_card')

    # Save Assistant Message
    assistant_msg = Message.objects.create(
        conversation=conversation,
        sender='assistant',
        text=reply_text
    )

    # Save/Update Diagnosis Report if diagnosis data is produced
    diagnosis_obj = None
    if diagnosis_data:
        diagnosis_obj = DiagnosisReport.objects.create(
            conversation=conversation,
            summary=diagnosis_data.get('summary', 'Mechanical Inspection'),
            severity=diagnosis_data.get('severity', 'Medium'),
            probable_causes=diagnosis_data.get('probable_causes', []),
            recommended_fixes=diagnosis_data.get('recommended_fixes', []),
            estimated_cost=diagnosis_data.get('estimated_cost', '$100 - $350')
        )

    # Refresh conversation title if initial generic
    if conversation.messages.count() <= 3 and text:
        conversation.title = text[:35]
        conversation.save()

    return Response({
        'conversation_id': str(conversation.id),
        'user_message': MessageSerializer(user_msg, context={'request': request}).data,
        'assistant_message': MessageSerializer(assistant_msg, context={'request': request}).data,
        'source': source,
        'diagnosis': DiagnosisReportSerializer(diagnosis_obj).data if diagnosis_obj else None
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_api(request):
    """
    POST /api/upload/
    Upload Image, Audio, or Video media file for diagnostic inspection.
    """
    file_obj = request.FILES.get('file')
    media_type = request.data.get('media_type', 'image')

    if not file_obj:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

    # Auto detect media type if not provided
    content_type = file_obj.content_type
    if content_type.startswith('audio/'):
        media_type = 'audio'
    elif content_type.startswith('video/'):
        media_type = 'video'
    elif content_type.startswith('image/'):
        media_type = 'image'

    uploaded = UploadedMedia.objects.create(
        file=file_obj,
        media_type=media_type
    )

    serializer = UploadedMediaSerializer(uploaded, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def generate_diagnosis_api(request):
    """
    POST /api/diagnosis/
    Generate/retrieve formal Diagnosis Report for a conversation session.
    """
    conversation_id = request.data.get('conversation_id')
    if not conversation_id:
        return Response({'error': 'conversation_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    conversation = get_object_or_404(Conversation, id=conversation_id)
    
    # Check if report already generated
    latest_diag = conversation.diagnoses.order_by('-created_at').first()
    if not latest_diag:
        diag_data = AIService.synthesize_diagnosis(conversation)
        latest_diag = DiagnosisReport.objects.create(
            conversation=conversation,
            summary=diag_data['summary'],
            severity=diag_data['severity'],
            probable_causes=diag_data['probable_causes'],
            recommended_fixes=diag_data['recommended_fixes'],
            estimated_cost=diag_data['estimated_cost']
        )

    return Response(DiagnosisReportSerializer(latest_diag).data, status=status.HTTP_200_OK)

@api_view(['POST'])
def create_booking_api(request):
    """
    POST /api/booking/
    Book doorstep mechanic, workshop service, or towing.
    """
    serializer = MechanicBookingSerializer(data=request.data)
    if serializer.is_valid():
        booking = serializer.save()
        return Response(MechanicBookingSerializer(booking).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_booking_api(request, pk):
    """
    GET /api/booking/{id}/
    Retrieve live booking status and technician details.
    """
    booking = get_object_or_404(MechanicBooking, id=pk)
    serializer = MechanicBookingSerializer(booking)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def list_conversations_api(request):
    """
    GET /api/conversations/
    List past diagnostic chat sessions.
    """
    conversations = Conversation.objects.all().order_by('-updated_at')
    serializer = ConversationSerializer(conversations, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_conversation_api(request, pk):
    """
    GET /api/conversations/{id}/
    Get message history of a specific session.
    """
    conversation = get_object_or_404(Conversation, id=pk)
    serializer = ConversationSerializer(conversation, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)
