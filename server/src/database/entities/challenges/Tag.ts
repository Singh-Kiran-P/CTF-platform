import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Challenge } from '../../../database';

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    order: number;

    @OneToMany(_ => Challenge, challenge => challenge.tag)
    challenges: Challenge[];

    constructor(name: string, description: string, order: number) {
        this.name = name;
        this.description = description;
        this.order = order;
    }
}
