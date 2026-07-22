"""
SIEM Analytics System - Feature Engineering Module

Converts raw security log events into numeric feature vectors for machine learning training and real-time inference.
"""
import pandas as pd
import numpy as np

# Encoding maps for categorical variables
EVENT_TYPE_MAP = {
    "login_success": 0,
    "login_failure": 1,
    "file_access": 2,
    "network_connection": 3,
    "system_alert": 4,
    "privilege_change": 5,
    "data_transfer": 6,
}

PROTOCOL_MAP = {
    "TCP": 0, "UDP": 1, "SSH": 2, "HTTP": 3, "HTTPS": 4,
    "FTP": 5, "DNS": 6, "SMB": 7, "RDP": 8, "ICMP": 9,
}

DEVICE_TYPE_MAP = {
    "server": 0, "workstation": 1, "firewall": 2,
    "router": 3, "database": 4, "iot_sensor": 5,
}

# High-risk origin countries according to threat intelligence
HIGH_RISK_COUNTRIES = {"CN": 3.0, "RU": 3.5, "IR": 3.5, "KP": 4.0, "RO": 2.5}


def extract_features_single(event_dict: dict) -> list[float]:
    """
    Extract a single numerical feature vector from an event dictionary for inference.

    Features (8-dimensional):
      0: failed_attempts
      1: destination_port
      2: log10(bytes_transferred + 1)
      3: country_risk_score (0.0 to 4.0)
      4: event_type_encoded
      5: protocol_encoded
      6: device_type_encoded
      7: is_failed_login (0 or 1)
    """
    failed_attempts = float(event_dict.get("failed_attempts", 0))
    port = float(event_dict.get("destination_port", 80) or 80)
    bytes_trans = float(event_dict.get("bytes_transferred", 0) or 0)
    log_bytes = np.log10(bytes_trans + 1.0)

    country = str(event_dict.get("country", "US")).upper()
    country_risk = HIGH_RISK_COUNTRIES.get(country, 1.0)

    event_type = str(event_dict.get("event_type", "network_connection")).lower()
    event_type_enc = float(EVENT_TYPE_MAP.get(event_type, 3))

    protocol = str(event_dict.get("protocol", "TCP")).upper()
    protocol_enc = float(PROTOCOL_MAP.get(protocol, 0))

    device = str(event_dict.get("device_type", "workstation")).lower()
    device_enc = float(DEVICE_TYPE_MAP.get(device, 1))

    is_failed_login = 1.0 if (event_type == "login_failure" or failed_attempts > 0) else 0.0

    return [
        failed_attempts,
        port,
        log_bytes,
        country_risk,
        event_type_enc,
        protocol_enc,
        device_enc,
        is_failed_login,
    ]


def prepare_features_df(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    """
    Transform a pandas DataFrame of security events into X (features) and y (target).

    Target mapping:
      'Normal' -> 0 (normal)
      'Brute Force', 'Port Scan', 'Malware', 'Data Exfiltration', 'Suspicious Login', 'Privilege Escalation' -> 1 (malicious)
    """
    feature_rows = []
    for _, row in df.iterrows():
        feature_rows.append(extract_features_single(row.to_dict()))

    feature_cols = [
        "failed_attempts",
        "destination_port",
        "log_bytes_transferred",
        "country_risk",
        "event_type_encoded",
        "protocol_encoded",
        "device_type_encoded",
        "is_failed_login",
    ]

    X = pd.DataFrame(feature_rows, columns=feature_cols)

    # Convert binary target: 0 for Normal, 1 for malicious attacks
    if "label" in df.columns:
        y = (df["label"] != "Normal").astype(int)
    elif "ml_prediction" in df.columns:
        y = (df["ml_prediction"] == "malicious").astype(int)
    else:
        y = pd.Series([0] * len(df))

    return X, y
