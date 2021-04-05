import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    quiz: number; // fk

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
