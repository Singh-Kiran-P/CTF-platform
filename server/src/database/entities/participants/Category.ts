import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Participant } from './Participant';

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    priority: number;

    @OneToMany(_ => Participant, participant => participant.category)
    participants: Participant[];

    constructor() {
        // TODO
    }
}
