import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from './User';

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    priority: number;

    @OneToMany(_ => User, user => user.category)
    users: User[];

    constructor() {
        // TODO
    }
}
