# A very small in-memory session store.
#
# Each logged-in user gets a random token. That token maps to their own
# `vars` dictionary on the server, so an assignment like "x = 5" drawn in
# one request is remembered and can be reused in a later expression
# (e.g. "x + 2") without the browser having to resend it.
#
# NOTE: this is intentionally simple for learning purposes. Because it's
# just a Python dict, everyone's variables are wiped whenever the server
# restarts, and it won't work if you ever run more than one backend
# process. A real app would put this in Redis or a database table instead.

import uuid

SESSIONS: dict[str, dict] = {}


def create_session(user_id: int) -> str:
    token = str(uuid.uuid4())
    SESSIONS[token] = {"user_id": user_id, "vars": {}}
    return token


def get_session(token: str | None) -> dict | None:
    if not token:
        return None
    return SESSIONS.get(token)
