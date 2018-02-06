import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { Chart } from 'chart.js';
import { HoldingsProvider } from '../../providers/holdings/holdings';


@IonicPage()
@Component({
    selector: 'page-chart',
    templateUrl: 'chart.html',
})
export class ChartPage {

 
    @ViewChild('barCanvas') barCanvas;
 
    barChart: Chart;
 
    constructor(public navCtrl: NavController, private holdingsProvider: HoldingsProvider) {
 
    }
 
    ionViewDidLoad() {
 
        let holdings = this.holdingsProvider.priceObservable.subscribe(holdings => {
            this.barChart = new Chart(this.barCanvas.nativeElement, {
 
                type: 'bar',
                data: {
                    labels: holdings.map(h => h.crypto + '(' + h.currency + ')'),
                    datasets: [{
                        label: 'Profit/loss per holdings',
                        data: holdings.map(h => ((h.currentPrice - h.buyingPrice) * h.amount)),
                        backgroundColor: holdings.map(h => h.currentPrice - h.buyingPrice > 0? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.3)')
                    }],
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true
                            }
                        }]
                    }
                }
     
            });
        });

    }
}
