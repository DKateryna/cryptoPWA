import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import { ConnectableObservable } from 'rxjs/observable/ConnectableObservable';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/observable/interval';



export interface Holding {
    crypto: string,
    currency: string,
    amount: number,
    price: number,
    value?: number
}

@Injectable()
export class HoldingsProvider {

    public holdings: Holding[] = [];
    priceObservable: Observable<Holding[]>;
    priceObserver: Observer<Holding[]>;
    interval: Observable<any>;


    constructor(private http: HttpClient, private storage: Storage) {

        let connectable: ConnectableObservable<Holding[]> = Observable.create((observer) => {
            this.priceObserver = observer;
        }).mergeMap((holdings: Holding[]) => this.fetchPrices(holdings)).publishReplay(1);

        connectable.connect();
        this.priceObservable = connectable;
        this.loadHoldings();

        this.interval = Observable.interval(5000);
        this.interval.subscribe(() => this.priceObserver.next(this.holdings));

    }

    addHolding(holding: Holding): void {

        this.holdings.push(holding);
        this.saveHoldings();
        this.priceObserver.next(this.holdings);

    }

    removeHolding(holding): void {

        this.holdings.splice(this.holdings.indexOf(holding), 1);
        this.saveHoldings();
        this.priceObserver.next(this.holdings);

    }

    saveHoldings(): void {
        this.storage.set('cryptoHoldings', this.holdings);
    }

    loadHoldings(): void {

        this.storage.get('cryptoHoldings').then(holdings => {

            if (holdings !== null) {
                this.holdings = holdings;
                this.priceObserver.next(this.holdings);
            }
        });

    }

    verifyHolding(holding): Observable<any> {
        return this.http.get('https://api.cryptonator.com/api/ticker/' + holding.crypto + '-' + holding.currency);
    }


    createRequests(holdings: Holding[]): Observable<any>[] {

        let requests = [];

        for (let holding of this.holdings) {
            let url = 'https://api.cryptonator.com/api/ticker/' + holding.crypto + '-' + holding.currency;
            let request = this.http.get(url);
            requests.push(request);
        }
        return requests;

    }

    fetchPrices(holdings: Holding[]): Observable<Holding[]> {

        let requests = this.createRequests(holdings);

        return forkJoin(requests).map(results => {

            results.forEach((result: any, index) => {

                holdings[index].value = result.ticker.price;

            });

            return holdings;
        });

    }
}