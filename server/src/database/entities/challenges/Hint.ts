import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { UsedHint, Challenge } from '../../../database';

@Entity()
export class Hint {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Challenge, challenge => challenge.hints, { nullable: false })
    challenge: Challenge;

    @OneToMany(_ => UsedHint, usedHint => usedHint.hint)
    usedHints: UsedHint[];

    @Column()
    name: string;

    @Column()
    content: string;

    @Column()
    cost: number;

    constructor() {
        // TODO
    }
}
