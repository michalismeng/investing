export { transform };

function transform(value: number, currencySymbol: string = "USD"): string {
    if (value == null)
        return "-"

    if (currencySymbol == "percent") {
        return Intl.NumberFormat("en-US", { style: "percent" }).format(value)
    }

    let sign = value < 0 ? "-" : ""
    if (value < 0)
        value = -value

    let valueStr = getNumber(value)

    if (sign == "-")
        return `(${valueStr})`
    return `${valueStr}`
}

function getNumber(value: number): string {
    const fraction = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
    });
    if (value < 1000)
        return fraction.format(value)
    if (value < 1000000)
        return fraction.format(value / 1000) + "K"
    if (value < 1000000000)
        return fraction.format(value / 1000000) + "M"
    else
        return fraction.format(value / 1000000000) + "B"
}
