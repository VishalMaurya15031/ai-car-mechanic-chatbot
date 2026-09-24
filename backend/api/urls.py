from django.urls import path
from . import views

urlpatterns = [
    # API Index & Health Check
    path('', views.health_check, name='api_index'),
    path('health/', views.health_check, name='health_check'),
    path('chat/', views.chat_api, name='chat_api'),
    path('upload/', views.upload_api, name='upload_api'),
    path('diagnosis/', views.generate_diagnosis_api, name='generate_diagnosis_api'),
    path('booking/', views.create_booking_api, name='create_booking_api'),
    path('booking/<uuid:pk>/', views.get_booking_api, name='get_booking_api'),
    
    # Session History APIs
    path('conversations/', views.list_conversations_api, name='list_conversations_api'),
    path('conversations/<uuid:pk>/', views.get_conversation_api, name='get_conversation_api'),
]
