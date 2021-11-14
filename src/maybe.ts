export const isNonNull = <T>(t: T): t is NonNullable<T> => !(t === null || t === undefined);

export abstract class Maybe<T> {

    isNothing(): boolean { return !this.isSomething(); }

    abstract isSomething(): boolean;
    abstract orDefault(defVal: T): T;
    abstract map<U>(f: (t: T) => U): Maybe<U>;
    abstract flatMap<U>(f: (t: T) => Maybe<U>): Maybe<U>;
    abstract filter(p: (t: T) => boolean): Maybe<T>;
    abstract toString(): string;
}

export class Something<T> extends Maybe<T> {

    readonly value: NonNullable<T>;

    constructor(value: NonNullable<T>) {
        super();
        this.value = value;
    }

    isSomething(): boolean { return true; }
    orDefault(): T { return this.value; }
    map<U>(f: (t: T) => U): Maybe<U> { return maybe(f(this.value)); }
    flatMap<U>(f: (t: T) => Maybe<U>): Maybe<U> { return f(this.value); }
    filter(p: (t: T) => boolean): Maybe<T> { return p(this.value) ? this : nothing(); }
    toString(): string { return `Something(${this.value})`; }
}

export class Nothing extends Maybe<never> {

    isSomething(): boolean { return false; }
    orDefault<T>(defVal: T): T { return defVal; }
    map<U>(): Maybe<U> { return this; }
    flatMap<U>(): Maybe<U> { return this; }
    filter<T>(): Maybe<T> { return this; }
    toString(): string { return 'Nothing'; }
}

export const something = <T>(value: NonNullable<T>): Maybe<T> => new Something(value);
export const nothing = (): Maybe<never> => new Nothing();
export const maybe = <T>(value: T): Maybe<T> => isNonNull(value) ? something(value) : nothing();
