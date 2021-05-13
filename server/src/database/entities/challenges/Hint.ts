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

    @Column()
    order: number;

    constructor(params?: { challenge: Challenge, name: string, content: string, cost: number, order: number, id?: number }) {
        if (!params) return;
        this.id = params.id;
        this.challenge = params.challenge;
        this.name = params.name;
        this.content = params.content;
        this.cost = params.cost;
        this.order = params.order;
    }
}
