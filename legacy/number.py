class Amount:
    """Holds a non-negative number."""

    def __init__(self, value):
        if value is not None and value < 0:
            raise ValueError("A Number cannot be negative.")
        self.value = value

    def __str__(self):
        if self.value is None:
            return "-"
        if self.value < 1000000:
            return "%.2fK" % (self.value / 1000)
        elif self.value < 1000000000:
            return "%.2fM" % (self.value / 1000000)
        else:
            return "%.2fB" % (self.value / 1000000000)


class Currency:
    """Holds a currency number."""

    def __init__(self, value, currency_symbol="$"):
        self.value = value
        self.currency_symbol = currency_symbol

    def __sub__(self, other):
        return Currency(self.value - other.value)

    def __add__(self, other):
        return Currency(self.value + other.value)

    def __truediv__(self, other):
        if isinstance(other, Currency):
            return Currency(self.value / other.value)
        else:
            return Currency(self.value / other)

    def __str__(self):
        if self.value is None:
            return "-"
        sign = "-" if self.value < 0 else ""
        value = -self.value if self.value < 0 else self.value
        value = Amount(value)
        return "%s%s%s" % (sign, self.currency_symbol, str(value))


class Number:
    """Holds a relatively small number."""

    def __init__(self, value, places=2):
        self.value = value
        self.places = places

    def __str__(self):
        if self.value is None:
            return "-"
        return ("%." + str(self.places) + "f") % self.value


class Percent:
    """Holds a percentage."""

    def __init__(self, value):
        self.value = value

    def __str__(self):
        if self.value is None:
            return "-"
        return "%.1f%%" % (self.value * 100)


class Date:
    """Holds a date."""

    def __init__(self, value):
        self.value = value

    def __lt__(self, other):
        return self.__str__() < other.__str__()

    def __str__(self):
        if self.value is None:
            return "-"
        elif self.value == "TTM":
            return self.value
        return self.value.strftime('%Y-%m-%d')

