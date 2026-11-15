"""Shared permission helpers."""


class _NoPermission:
    """Stand-in for a Permisions row when a user has no role / no row.

    Every permission flag reads as False and the object itself is falsy, so
    `get_role == "User" and perm.<flag> == True` cleanly evaluates to False
    (-> "un-authenticate" response) instead of crashing with NameError /
    UnboundLocalError when `perm` was never assigned.
    """

    def __getattr__(self, name):
        if name.startswith("__"):
            raise AttributeError(name)
        return False

    def __bool__(self):
        return False

    def __repr__(self):
        return "<NO_PERMISSION>"


NO_PERMISSION = _NoPermission()
