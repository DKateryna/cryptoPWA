import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { HoldingsProvider } from '../../providers/holdings/holdings';
import { Holding } from '../../providers/holdings/holdings';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';


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

  getTotal(holdings: Holding[], currency: string): number {
    return holdings
      .filter(h => h.currency.toUpperCase() === currency)
      .map(h => (h.value - h.price) * h.amount)
      .reduce((a, b) => a + b, 0);
  }

  getCurrencies(holdings: Holding[]): Array<string> {
    let currencies = holdings.map(h => h.currency.toUpperCase());
    return Array.from(new Set<string>(currencies));
  }


  getOverallPositions1(holdings: Holding[]): OverallPosition[] {
    return this.getCurrencies(holdings).map(cur => ({
      currency: cur,
      total: this.getTotal(holdings, cur)
    }));
  }


  getOverallPositions(): Observable<OverallPosition[]> {
    return this.holdingsProvider.priceObservable.map((h) => this.getOverallPositions1(h));
    // return Observable.of();

  }

}