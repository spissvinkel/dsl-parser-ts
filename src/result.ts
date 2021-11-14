import { Input } from './input';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class Result<S, T> {

    readonly nextInput: Input<S>;

    protected constructor(nextInput: Input<S>) {
        this.nextInput = nextInput;
    }

    isFailure(): boolean { return !this.isSuccess(); }

    abstract isSuccess(): boolean;
    abstract toString(): string;
}

export class Success<S, T> extends Result<S, T> {

    readonly value: T;

    constructor(value: T, nextInput: Input<S>) {
        super(nextInput);
        this.value = value;
    }

    isSuccess(): boolean { return true; }
    toString(): string { return `Success(${this.value})`; }
}

export class Failure<S, T> extends Result<S, T> {

    readonly errorMessage: string;

    constructor(errorMessage: string, nextInput: Input<S>) {
        super(nextInput);
        this.errorMessage = errorMessage;
    }

    fullErrorMessage(): string {
        const m = this.errorMessage;
        const i = this.nextInput.index;
        const e = i > 0 ? '... ' : '';
        const r = this.nextInput.remaining();
        return `${m} at ${i} ("${e}${r}")`;
    }

    isSuccess(): boolean { return false; }
    toString(): string { return `Failure(${this.fullErrorMessage()})`; }
}

export const success = <S, T>(value: T, nextInput: Input<S>): Result<S, T> => new Success(value, nextInput);
export const failure = <S, T>(errorMessage: string, nextInput: Input<S>): Result<S, T> => new Failure(errorMessage, nextInput);
