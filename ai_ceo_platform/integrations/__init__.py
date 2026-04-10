import requests
import smtplib
from email.message import EmailMessage
from config import Config

def test_wa(token, phone, to):
    if not token or not phone:
        return {"error": "Missing config"}
    try:
        return requests.post(
            f"https://graph.facebook.com/v17.0/{phone}/messages",
            json={
                "messaging_product": "whatsapp",
                "to": to,
                "text": {"body": "Test from AI CEO"}
            },
            headers={"Authorization": f"Bearer {token}"}
        ).json()
    except Exception as e:
        return {"error": str(e)}

def test_tg(token, chat_id):
    if not token or not chat_id:
        return {"error": "Missing config"}
    try:
        return requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": "Test from AI CEO"}
        ).json()
    except Exception as e:
        return {"error": str(e)}

def test_email(user, pwd, host, port, to):
    try:
        m = EmailMessage()
        m.set_content("Test from AI CEO")
        m["Subject"] = "Test"
        m["From"] = user
        m["To"] = to
        with smtplib.SMTP_SSL(host, int(port)) as s:
            s.login(user, pwd)
            s.send_message(m)
        return {"status": "success"}
    except Exception as e:
        return {"error": str(e)}
