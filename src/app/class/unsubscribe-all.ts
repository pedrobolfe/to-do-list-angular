import { Injectable } from "@angular/core";
import { Subscription } from "rxjs";

@Injectable()
export abstract class UnsubscribeAll {
    public subs: Subscription[];
    constructor() {
        this.subs = [];
    }

    unsubscribeAll() {
        this.subs.forEach(sub => {
            if (sub && sub instanceof Subscription) {
                sub.unsubscribe();
            } else {
                this.subs.splice(this.subs.indexOf(sub), 1);
            }
        });
    }

    /**
     * ```
     * ngOnDestroy(): void {
     *     this.unsubscribeAll();
     * }
     * ```
     * */
    abstract ngOnDestroy(): void;

}
