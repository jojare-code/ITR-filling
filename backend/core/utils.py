import resend
from django.conf import settings

resend.api_key = getattr(settings, 'RESEND_API_KEY', 're_dummy_key_1234')

def send_notification_email(to_email, subject, html_content):
    if not getattr(settings, 'RESEND_API_KEY', None):
        print(f"[Email Stub] To: {to_email} | Subject: {subject} | Content: {html_content}")
        return
        
    try:
        r = resend.Emails.send({
            "from": "onboarding@resend.dev", # Replace with verified domain in production
            "to": to_email,
            "subject": subject,
            "html": html_content
        })
        return r
    except Exception as e:
        print(f"Failed to send email: {e}")
        return None
