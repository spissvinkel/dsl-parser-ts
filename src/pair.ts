export class Pair<T, U> {

    readonly fst: T;
    readonly snd: U;

    constructor(fst: T, snd: U) {
        this.fst = fst;
        this.snd = snd;
    }
}

export const pair = <T, U>(fst: T, snd: U): Pair<T, U> => new Pair(fst, snd);

export const fst: <T, U>(p: Pair<T, U>) => T = ({ fst }) => fst;
export const snd: <T, U>(p: Pair<T, U>) => U = ({ snd }) => snd;
