import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Account } from '../../../database';

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    order: number;

    @OneToMany(_ => Account, account => account.category)
    accounts: Account[];

    constructor(params?: { name: string, order: number, id?: number }) {
        if (!params) return;
        this.id = params.id;
        this.name = params.name;
        this.order = params.order;
    }
}
