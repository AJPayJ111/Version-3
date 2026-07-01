"""
Security-focused SQL examples for defending login and user-management flows.

These helpers demonstrate parameterized SQL, least-privilege access patterns,
and audit logging for failed login attempts.
"""

import sqlite3
from typing import Optional


def get_user_by_email(conn: sqlite3.Connection, email: str) -> Optional[dict]:
    normalized_email = email.strip().lower()
    cursor = conn.execute(
        "SELECT id, email, password_hash FROM users WHERE lower(email) = ? LIMIT 1",
        (normalized_email,),
    )
    row = cursor.fetchone()
    return {"id": row[0], "email": row[1], "password_hash": row[2]} if row else None


def create_user(conn: sqlite3.Connection, name: str, email: str, password_hash: str) -> int:
    cursor = conn.execute(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        (name.strip(), email.strip().lower(), password_hash),
    )
    conn.commit()
    return cursor.lastrowid


def record_failed_login(conn: sqlite3.Connection, email: str, reason: str) -> None:
    conn.execute(
        "INSERT INTO auth_events (email, event_type, details) VALUES (?, 'failed_login', ?)",
        (email.strip().lower(), reason),
    )
    conn.commit()


def is_rate_limited(conn: sqlite3.Connection, email: str, max_attempts: int = 5, window_seconds: int = 300) -> bool:
    cursor = conn.execute(
        """
        SELECT COUNT(*) FROM auth_events
        WHERE email = ?
        AND event_type = 'failed_login'
        AND created_at >= datetime('now', ?)
        """,
        (email.strip().lower(), f"-{window_seconds} seconds"),
    )
    count = cursor.fetchone()[0]
    return count >= max_attempts


def audit_login_attempt(conn: sqlite3.Connection, email: str, success: bool) -> None:
    conn.execute(
        "INSERT INTO auth_events (email, event_type, details) VALUES (?, ?, ?)",
        (email.strip().lower(), "login_success" if success else "login_failure", "authenticated" if success else "blocked"),
    )
    conn.commit()