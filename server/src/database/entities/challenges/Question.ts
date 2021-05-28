import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Challenge } from '../../../database';

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Challenge, challenge => challenge.questions, { nullable: false,  onDelete: 'CASCADE' })
    quiz: Challenge;

    @Column()
    question: string;

    @Column()
    answer: string;

    @Column()
    accuracy: number;

    @Column()
    order: number;

    constructor(params?: { quiz: Challenge, question: string, answer: string, accuracy: number, order: number, id?: number }) {
        if (!params) return;
        this.id = params.id;
        this.quiz = params.quiz;
        this.question = params.question;
        this.answer = params.answer;
        this.accuracy = params.accuracy;
        this.order = params.order;
    }
}
