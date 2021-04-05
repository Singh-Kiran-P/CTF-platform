import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Hint {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    challenge: number; // fk

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
