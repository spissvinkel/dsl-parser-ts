export class Thunk<T> {

    private readonly f: () => T;
    private t: T | undefined = undefined;

    constructor(f: () => T) { this.f = f; }

    value(): T {
        if (this.t === undefined) this.t = this.f();
        return this.t;
    }
}

export const thunk = <T>(f: () => T): Thunk<T> => new Thunk(f);
