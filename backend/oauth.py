"""
Google OAuth 2.0 integration using authlib + httpx.
Handles the full OAuth flow: redirect to Google, callback handling, and user creation.
"""

import os
from authlib.integrations.httpx_client import AsyncOAuth2Client
from dotenv import load_dotenv

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def get_google_client() -> AsyncOAuth2Client:
    """Create a fresh Google OAuth2 client instance."""
    return AsyncOAuth2Client(
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        redirect_uri=GOOGLE_REDIRECT_URI,
    )


def get_google_auth_url() -> str:
    """
    Generate the Google OAuth consent screen URL.
    Requests email and profile scopes.
    """
    client = get_google_client()
    uri, _ = client.create_authorization_url(
        GOOGLE_AUTH_URL,
        scope="openid email profile",
        access_type="offline",
        prompt="consent",
    )
    return uri


async def get_google_user_info(code: str) -> dict:
    """
    Exchange the authorization code for tokens, then fetch the user's
    Google profile info (email, name, picture, Google ID).

    Returns a dict with keys: sub, email, name, picture.
    """
    client = get_google_client()

    token = await client.fetch_token(
        GOOGLE_TOKEN_URL,
        code=code,
    )

    # Use the access token to fetch user info
    client.token = token
    resp = await client.get(GOOGLE_USERINFO_URL)
    resp.raise_for_status()

    user_info = resp.json()
    return {
        "google_id": user_info.get("sub"),
        "email": user_info.get("email"),
        "name": user_info.get("name", user_info.get("email", "").split("@")[0]),
        "picture": user_info.get("picture"),
    }
