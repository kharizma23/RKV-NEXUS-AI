import logging
import re
import sys

SENSITIVE_KEYS = {"password", "token", "access_token", "refresh_token", "secret", "authorization", "csrf"}

class SensitiveDataFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        original = super().format(record)
        # Redact JWT tokens & sensitive patterns if present
        redacted = re.sub(r'(bearer\s+)[A-Za-z0-9\-\._~\+\/]+=*', r'\1[REDACTED]', original, flags=re.IGNORECASE)
        return redacted

def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(SensitiveDataFormatter('%(asctime)s [%(levelname)s] %(name)s - %(message)s'))
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger

logger = get_logger("assessment_platform")
