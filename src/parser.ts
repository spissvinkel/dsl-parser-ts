import { Either, left, right } from './either';
import { Input } from './input';
import { maybe, Maybe, nothing } from './maybe';
import { fst, pair, Pair, snd } from './pair';
import { Failure, failure, Result, Success, success } from './result';
import { thunk, Thunk } from './thunk';

export abstract class Parser<S, T> {

    abstract parse(input: Input<S>): Result<S, T>;

    parseAll(input: Input<S>): Result<S, T> {
        const result = this.parse(input);
        const next = result.nextInput;
        if (result instanceof Success && next.length() > 0) return failure('Unparsed input remains', next);
        return result;
    }

    map        <U> (f: (t: T) => U)                           : Parser<S, U>            { return map(this, f); }
    tryMap     <U> (f: (t: T) => Result<S, U>)                : Parser<S, U>            { return tryMap(this, f); }
    recover    <U> (f: (errorMessage: string) => U)           : Parser<S, U>            { return recover(this, f); }
    tryRecover <U> (f: (errorMessage: string) => Result<S, U>): Parser<S, U>            { return tryRecover(this, f); }
    then       <U> (q: Parser<S, U>)                          : Parser<S, Pair<T, U>>   { return then(this, q); }
    thenSkip   <U> (q: Parser<S, U>)                          : Parser<S, T>            { return thenSkip(this, q); }
    skipThen   <U> (q: Parser<S, U>)                          : Parser<S, U>            { return skipThen(this, q); }
    or             (q: Parser<S, T>)                          : Parser<S, T>            { return or(this, q); }
    orEither   <U> (q: Parser<S, U>)                          : Parser<S, Either<T, U>> { return orEither(this, q); }
    opt            ()                                         : Parser<S, Maybe<T>>     { return opt(this); }
    seq            ()                                         : Parser<S, T[]>          { return seq(this); }
}

export abstract class TerminalParser<S, T> extends Parser<S, T> {
}

export abstract class DecoratorParser<S, T, U> extends Parser<S, U> {

    protected readonly p: Parser<S, T>;

    constructor(p: Parser<S, T>) {
        super();
        this.p = p;
    }

    abstract parse(input: Input<S>): Result<S, U>;
}

export abstract class CombinatorParser<S, T, U, V> extends DecoratorParser<S, T, V> {

    protected readonly q: Parser<S, U>;

    constructor(p: Parser<S, T>, q: Parser<S, U>) {
        super(p);
        this.q = q;
    }

    abstract parse(input: Input<S>): Result<S, V>;
}

export class MapParser<S, T, U> extends DecoratorParser<S, T, U> {

    private readonly f: (t: T) => U;

    constructor(p: Parser<S, T>, f: (t: T) => U) {
        super(p);
        this.f = f;
    }

    parse(input: Input<S>): Result<S, U> {
        const pResult = this.p.parse(input);
        if (pResult instanceof Success) return success(this.f(pResult.value), pResult.nextInput);
        if (pResult instanceof Failure) return pResult;
        return failure('Unknown result type', input);
    }
}

export class TryMapParser<S, T, U> extends DecoratorParser<S, T, U> {

    private readonly f: (t: T) => Result<S, U>;

    constructor(p: Parser<S, T>, f: (t: T) => Result<S, U>) {
        super(p);
        this.f = f;
    }

    parse(input: Input<S>): Result<S, U> {
        const pResult = this.p.parse(input);
        if (pResult instanceof Success) return this.f(pResult.value);
        if (pResult instanceof Failure) return pResult;
        return failure('Unknown result type', input);
    }
}

export class RecoverParser<S, T, U> extends DecoratorParser<S, T, U> {

    private readonly f: (errorMessage: string) => U;

    constructor(p: Parser<S, T>, f: (errorMessage: string) => U) {
        super(p);
        this.f = f;
    }

    parse(input: Input<S>): Result<S, U> {
        const pResult = this.p.parse(input);
        if (pResult instanceof Success) return pResult;
        if (pResult instanceof Failure) return success(this.f(pResult.errorMessage), pResult.nextInput);
        return failure('Unknown result type', input);
    }
}

export class TryRecoverParser<S, T, U> extends DecoratorParser<S, T, U> {

    private readonly f: (errorMessage: string) => Result<S, U>;

    constructor(p: Parser<S, T>, f: (errorMessage: string) => Result<S, U>) {
        super(p);
        this.f = f;
    }

    parse(input: Input<S>): Result<S, U> {
        const pResult = this.p.parse(input);
        if (pResult instanceof Success) return pResult;
        if (pResult instanceof Failure) return this.f(pResult.errorMessage);
        return failure('Unknown result type', input);
    }
}

export class ThenParser<S, T, U> extends CombinatorParser<S, T, U, Pair<T, U>> {

    parse(input: Input<S>): Result<S, Pair<T, U>> {
        const pResult = this.p.parse(input);
        if (pResult instanceof Success) {
            const qResult = this.q.parse(pResult.nextInput);
            if (qResult instanceof Success) return success(pair(pResult.value, qResult.value), qResult.nextInput);
            if (qResult instanceof Failure) return qResult;
            return failure('Unknown result type', pResult.nextInput);
        }
        if (pResult instanceof Failure) return pResult;
        return failure('Unknown result type', input);
    }
}

export class OrParser<S, T> extends CombinatorParser<S, T, T, T> {

    parse(input: Input<S>): Result<S, T> {
        const pResult = this.p.parse(input);
        if (pResult instanceof Success) return pResult;
        if (pResult instanceof Failure) {
            const qResult = this.q.parse(input);
            if (qResult instanceof Success) return qResult;
            if (qResult instanceof Failure) return qResult;
            return failure('Unknown result type', input);
        }
        return failure('Unknown result type', input);
    }
}

export class OrEitherParser<S, T, U> extends CombinatorParser<S, T, U, Either<T, U>> {

    parse(input: Input<S>): Result<S, Either<T, U>> {
        const pResult = this.p.parse(input);
        if (pResult instanceof Success) return success(left(pResult.value), pResult.nextInput);
        if (pResult instanceof Failure) {
            const qResult = this.q.parse(input);
            if (qResult instanceof Success) return success(right(qResult.value), qResult.nextInput);
            if (qResult instanceof Failure) return qResult;
            return failure('Unknown result type', input);
        }
        return failure('Unknown result type', input);
    }
}

export class SeqParser<S, T> extends DecoratorParser<S, T, T[]> {

    parse(input: Input<S>): Result<S, T[]> {
        const ts: T[] = [];
        let nextInput = input;
        let r: Result<S, T>;
        while ((r = this.p.parse(nextInput)) instanceof Success) {
            ts.push(r.value);
            nextInput = r.nextInput;
        }
        return success(ts, nextInput);
    }
}

export class SucceedParser<S, T> extends TerminalParser<S, T> {

    private readonly t: T;

    constructor(t: T) {
        super();
        this.t = t;
    }

    parse(input: Input<S>): Result<S, T> {
        return success(this.t, input);
    }
}

export class FailParser<S, T> extends TerminalParser<S, T> {

    private readonly errorMessage: string;

    constructor(errorMessage: string) {
        super();
        this.errorMessage = errorMessage;
    }

    parse(input: Input<S>): Result<S, T> {
        return failure(this.errorMessage, input);
    }
}


export const map        = <S, T, U> (p: Parser<S, T>, f: (t: T) => U)                           : Parser<S, U>            => new MapParser(p, f);
export const tryMap     = <S, T, U> (p: Parser<S, T>, f: (t: T) => Result<S, U>)                : Parser<S, U>            => new TryMapParser(p, f);
export const recover    = <S, T, U> (p: Parser<S, T>, f: (errorMessage: string) => U)           : Parser<S, U>            => new RecoverParser(p, f);
export const tryRecover = <S, T, U> (p: Parser<S, T>, f: (errorMessage: string) => Result<S, U>): Parser<S, U>            => new TryRecoverParser(p, f);
export const then       = <S, T, U> (p: Parser<S, T>, q: Parser<S, U>)                          : Parser<S, Pair<T, U>>   => new ThenParser(p, q);
export const or         = <S, T>    (p: Parser<S, T>, q: Parser<S, T>)                          : Parser<S, T>            => new OrParser(p, q);
export const orEither   = <S, T, U> (p: Parser<S, T>, q: Parser<S, U>)                          : Parser<S, Either<T, U>> => new OrEitherParser(p, q);
export const seq        = <S, T>    (p: Parser<S, T>)                                           : Parser<S, T[]>          => new SeqParser(p);

export const thenSkip   = <S, T, U> (p: Parser<S, T>, q: Parser<S, U>)                          : Parser<S, T>            => p.then(q).map(fst);
export const skipThen   = <S, T, U> (p: Parser<S, T>, q: Parser<S, U>)                          : Parser<S, U>            => p.then(q).map(snd);
export const opt        = <S, T>    (p: Parser<S, T>)                                           : Parser<S, Maybe<T>>     => p.map(maybe).recover(nothing);

export const succeed    = <S, T>    (t: T)                                                      : Parser<S, T>            => new SucceedParser(t);
export const fail       = <S, T>    (errorMessage: string)                                      : Parser<S, T>            => new FailParser(errorMessage);


export type ParserRef<S, T> = Thunk<Parser<S, T>>;

export class RefParser<S, T> extends Parser<S, T> {

    protected readonly pRef: ParserRef<S, T>;

    constructor(pRef: ParserRef<S, T>) {
        super();
        this.pRef = pRef;
    }

    parse(input: Input<S>): Result<S, T> {
        return this.pRef.value().parse(input);
    }
}

export const ref = <S, T>(f: () => Parser<S, T>): Parser<S, T> => new RefParser(thunk(f));
