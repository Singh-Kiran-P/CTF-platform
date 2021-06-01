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

    constructor(params? : { name: string, description: string, order: number, id? : number }) {
        if (!params) return;
        this.id = params.id;
        this.name = params.name;
        this.description = params.description;
        this.order = params.order;
    }
}
