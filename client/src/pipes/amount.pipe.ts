import { formatNumber, formatPercent, getCurrencySymbol } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'amount'})
export class AmountPipe implements PipeTransform {
  transform(value: number, currencySymbol: string = "USD"): string {
    if (value == null)
      return "-"

    if (currencySymbol == "percent") {
      return `${formatPercent(value, "en-US", ".1-1")}`
    }

    let sign = value < 0 ? "-" : ""
    if (value < 0)
        value = -value
    
    let valueStr = this.getNumber(value)
    // let currency = currencySymbol == "shares" ? "" : getCurrencySymbol(currencySymbol, "wide", "en-US")

    if (sign == "-")
      return `(${valueStr})`
    return `${valueStr}`
  }

  private getNumber(value: number): string {
    if (value < 1000)
        return formatNumber(value, "en-US", ".2-2")
    if (value < 1000000)
        return formatNumber(value / 1000, "en-US", ".2-2") + "K"
    if (value < 1000000000)
        return formatNumber(value / 1000000, "en-US", ".2-2") + "M"
    else
        return formatNumber(value / 1000000000, "en-US", ".2-2") + "B"
  }

}