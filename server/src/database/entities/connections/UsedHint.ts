import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UsedHint {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    hint: number; // fk

    @Column()
    solve: number; // fk

    constructor() {
        // TODO
    }
}
