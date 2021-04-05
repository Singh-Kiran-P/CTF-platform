import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Round {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    start: number;

    @Column()
    end: number;

    constructor() {
        // TODO
    }
}
