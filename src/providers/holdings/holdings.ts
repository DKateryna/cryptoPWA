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


interface StoredHolding {
    crypto: string,
    currency: string,
    amount: number,
    buyingPrice: number
}


export interface Holding extends StoredHolding {
    currentPrice?: number
}

@Injectable()
export class HoldingsProvider {

    public holdings: StoredHolding[] = [];
    priceObservable: Observable<Holding[]>;
    priceObserver: Observer<StoredHolding[]>;
    interval: Observable<any>;


    constructor(private http: HttpClient, private storage: Storage) {

        let connectable: ConnectableObservable<Holding[]> = Observable.create((observer) => {
            this.priceObserver = observer;
        }).mergeMap((storedHoldings: StoredHolding[]) => this.fetchPrices(storedHoldings)).publishReplay(1);

        connectable.connect();
        this.priceObservable = connectable;
        this.loadHoldings();

        this.interval = Observable.interval(5000);
        this.interval.subscribe(() => this.priceObserver.next(this.holdings));

    }

    addHolding(holding: StoredHolding): void {

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

        this.storage.get('cryptoHoldings').then(storedHoldings => {

            if (storedHoldings !== null) {
                this.holdings = storedHoldings;
                this.priceObserver.next(this.holdings);
            }
        });

    }

    verifyHolding(holding): Observable<any> {
        return this.http.get('https://api.cryptonator.com/api/ticker/' + holding.crypto + '-' + holding.currency);
    }


    createRequests(storedHoldings: StoredHolding[]): Observable<any>[] {

        let requests = [];

        for (let holding of storedHoldings) {
            let url = 'https://api.cryptonator.com/api/ticker/' + holding.crypto + '-' + holding.currency;
            let request = this.http.get(url);
            requests.push(request);
        }
        return requests;

    }

    fetchPrices(storedHoldings: StoredHolding[]): Observable<Holding[]> {

        let requests = this.createRequests(storedHoldings);
        let holdings: Holding[] = storedHoldings.map(holding => ({ ...holding }));


        return forkJoin(requests).map(results => {

            results.forEach((result: any, index) => {

                holdings[index].currentPrice = result.ticker.price;

            });

            return holdings;
        });

    }
}