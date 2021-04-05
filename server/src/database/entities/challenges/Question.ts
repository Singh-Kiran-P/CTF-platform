import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Challenge } from './Challenge';

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Challenge, challenge => challenge.questions, { nullable: false })
    quiz: Challenge;

    @Column()
    question: string;

    @Column()
    answer: string;

    @Column()
    order: number;

    constructor() {
        // TODO
    }
}
