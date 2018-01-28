import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { HoldingsProvider } from '../../providers/holdings/holdings';


interface OverallPosition {
  currency: string,
  total: number
}

@IonicPage()
@Component({
  selector: 'page-overall-position',
  templateUrl: 'overall-position.html',
})
export class OverallPositionPage {

  constructor(private holdingsProvider: HoldingsProvider) {
  }

  getTotal(currency: string): number {
    return this.holdingsProvider.holdings
    .filter(h => h.currency.toUpperCase() === currency)
    .map(h => (h.value - h.price) * h.amount)
      .reduce((a, b) => a + b, 0);
  }

  getCurrencies(): Array<string>{
    let currencies = this.holdingsProvider.holdings.map(h => h.currency.toUpperCase());
    return Array.from(new Set<string>(currencies)); 
  }

  getOverallPositions(): Array<OverallPosition>{
    return this.getCurrencies().map(cur => ({
        currency: cur,
        total: this.getTotal(cur)
      }));
  }
}