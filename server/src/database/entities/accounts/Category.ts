import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Account } from '../../../database';

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column()
    priority: number;

    @OneToMany(_ => Account, account => account.category)
    accounts: Account[];

    constructor(name: string, priority: number) {
        this.name = name;
        this.priority = priority;
    }
}
