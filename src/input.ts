export abstract class Input<S> {

    readonly source: S;
    readonly index: number;

    protected constructor(source: S, index = 0) {
        this.source = source;
        this.index = index;
    }

    abstract forward(length: number): Input<S>;
    abstract remaining(length?: number): S;
    abstract length(): number;
}
