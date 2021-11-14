export abstract class Either<L, R> {

    abstract readonly value: L | R;

    isRight(): boolean { return !this.isLeft(); }

    abstract isLeft(): boolean;
    abstract toString(): string;
}

export class Left<L, R> extends Either<L, R> {

    readonly value: L;

    constructor(value: L) {
        super();
        this.value = value;
    }

    isLeft(): boolean { return true; }
    toString(): string { return `Left(${this.value})`; }
}

export class Right<L, R> extends Either<L, R> {

    readonly value: R;

    constructor(value: R) {
        super();
        this.value = value;
    }

    isLeft(): boolean { return false; }
    toString(): string { return `Right(${this.value})`; }
}

export const left = <L, R>(value: L): Either<L, R> => new Left(value);
export const right = <L, R>(value: R): Either<L, R> => new Right(value);
export const valueOf = <T>(e: Either<T, T>): T => e.value;
