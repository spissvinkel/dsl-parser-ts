import { Input } from './input';
import { fail, Parser, TerminalParser } from './parser';
import { failure, Result, success } from './result';

export class StringInput extends Input<string> {

    constructor(source: string, index = 0) {
        super(source, index);
    }

    forward(length: number): Input<string> {
        return new StringInput(this.source, this.index + length);
    }

    remaining(length?: number): string {
        if (length === undefined) return this.source.substring(this.index);
        return this.source.substr(this.index, length);
    }

    length(): number {
        return this.source.length - this.index;
    }
}

export class LitParser extends TerminalParser<string, string> {

    private readonly literal: string;
    private readonly n: number;

    constructor(literal: string) {
        super();
        this.literal = literal;
        this.n = literal.length;
    }

    parse(input: Input<string>): Result<string, string> {
        const { literal, n } = this;
        if (input.length() >= n && input.remaining(n) === literal) return success(literal, input.forward(n));
        return failure(`Expected string literal "${literal}"`, input);
    }
}

export class ReParser extends TerminalParser<string, string> {

    private readonly re: RegExp;

    constructor(regex: string) {
        super();
        this.re = new RegExp(regex.startsWith('^') ? regex : `^${regex}`);
    }

    parse(input: Input<string>): Result<string, string> {
        const match = this.re.exec(input.remaining());
        if (match === null) return failure(`No match for regex "${this.re.source}"`, input);
        return success(match[0], input.forward(match[0].length));
    }
}

export const lit     = (literal: string): Parser<string, string> => new LitParser(literal);
export const re      = (regex: string)  : Parser<string, string> => new ReParser(regex);

export const strFail = (message: string): Parser<string, string> => fail(message);

export const digitStr  : Parser<string, string> = re('[0-9]').or(strFail('Digit expected'));
export const digit     : Parser<string, number> = digitStr.map(Number.parseInt);
export const integerStr: Parser<string, string> = re('[+-]?(?:0|[1-9]\\d*)').or(strFail('Integer expected'));
export const integer   : Parser<string, number> = integerStr.map(Number.parseInt);
export const floatStr  : Parser<string, string> = re('[+-]?(?:0|[1-9]\\d*)(?:\\.\\d+)?').or(strFail('Number expected'));
export const float     : Parser<string, number> = floatStr.map(Number.parseFloat);

export const parseAll = <T>(s: string, p: Parser<string, T>): Result<string, T> => p.parseAll(new StringInput(s));
