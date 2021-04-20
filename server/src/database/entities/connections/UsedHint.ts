import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Hint, Solve } from '../../../database';

@Entity()
export class UsedHint {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Hint, hint => hint.usedHints, { nullable: false })
    hint: Hint;

    @ManyToOne(_ => Solve, solve => solve.usedHints, { nullable: false })
    solve: Solve;

    constructor() {
        // TODO
    }
}
