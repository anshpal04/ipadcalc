# This file hashes and checks passwords using bcrypt directly.
#
# (We used to go through the "passlib" library, but passlib 1.7.4 is
# broken with modern versions of bcrypt - it crashes trying to read a
# version attribute that no longer exists. bcrypt on its own does the
# same job in a few lines with no compatibility issues.)
import bcrypt


def hash_password(plain_password: str) -> str:
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )
