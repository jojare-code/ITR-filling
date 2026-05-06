import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def get_encryption_key():
    # Key must be 32 bytes for AES-256. Using a fixed dev key if ENV is missing.
    key = os.environ.get('AES_256_KEY', '0123456789abcdef0123456789abcdef')
    if len(key) != 32:
        key = key.ljust(32, '0')[:32]
    return key.encode('utf-8')

def encrypt_data(data: str) -> str:
    if not data:
        return data
    aesgcm = AESGCM(get_encryption_key())
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, data.encode('utf-8'), None)
    return base64.b64encode(nonce + ciphertext).decode('utf-8')

def decrypt_data(token: str) -> str:
    if not token:
        return token
    try:
        decoded = base64.b64decode(token.encode('utf-8'))
        nonce = decoded[:12]
        ciphertext = decoded[12:]
        aesgcm = AESGCM(get_encryption_key())
        return aesgcm.decrypt(nonce, ciphertext, None).decode('utf-8')
    except Exception:
        return None
