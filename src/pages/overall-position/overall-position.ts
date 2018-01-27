import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HoldingsProvider } from '../../providers/holdings/holdings';


@IonicPage()
@Component({
  selector: 'page-overall-position',
  templateUrl: 'overall-position.html',
})
export class OverallPositionPage {

  constructor(private holdingsProvider: HoldingsProvider) {
  }

  getTotal(): number {
    return this.holdingsProvider.holdings.map(h => (h.price - h.value) * h.amount).reduce((a, b) => a + b, 0);
  }
}