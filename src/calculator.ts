import { Pair } from './pair';
import { Parser, ref, seq } from './parser';
import { Failure, Success } from './result';
import { integer, lit, parseAll } from './string-parser';

type Op = (n: number) => number;

const add: (arg: number) => Op = arg => acc => acc + arg;
const sub: (arg: number) => Op = arg => acc => acc - arg;
const mul: (arg: number) => Op = arg => acc => acc * arg;
const div: (arg: number) => Op = arg => acc => Math.floor(acc / arg);

const evaluate: (arg: number, op: Op) => number = (acc, f) => f(acc);

const calculate: (initAndOps: Pair<number, Op[]>) => number = ({ fst: init, snd: ops }) => ops.reduce(evaluate, init);

const expr: Parser<string, number> = ref(() => term.then(seq(addTerm.or(subTerm))).map(calculate));
const term: Parser<string, number> = ref(() => factor.then(seq(mulFactor.or(divFactor))).map(calculate));

const factor: Parser<string, number> = integer.or(lit('(').skipThen(expr).thenSkip(lit(')')));

const addTerm  : Parser<string, Op> = lit('+').skipThen(term).map(add);
const subTerm  : Parser<string, Op> = lit('-').skipThen(term).map(sub);
const mulFactor: Parser<string, Op> = lit('*').skipThen(factor).map(mul);
const divFactor: Parser<string, Op> = lit('/').skipThen(factor).map(div);

const parse = (s: string): string => {
    const result = parseAll(s, expr);
    if (result instanceof Success) return `${result.value}`;
    if (result instanceof Failure) return `Error: ${result.fullErrorMessage()}`;
    return 'Error: Unknown result type';
};

const ss = [
    '2*3',
    '2*3+7',
    '2*3-7',
    '2*3-7/2',
    '(23)+7',
    '(2*3)+7',
    '2*(3+7)',
    '2*(3+7)/3',
    '2*(3+7))',
    '2*((3+7)+3',
    '(2*(3+7)',
    '2+3-7',
    '2+3-',
    'x',
    '2+',
    '+2',
    '-2',
    '2*-3',
    '2+-3',
    '2--3',
    '2++3',
    '',
    '2-3*7',
];

ss.forEach(s => console.log(`${s} = ${parse(s)}`));
