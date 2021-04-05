import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column()
    salt: string;

    @Column()
    category: number; // fk

    @Column()
    team: number; // fk

    constructor(name: string, password: string, category: number, team: number) {
        this.name = name;
        this.password = password;
        this.salt = 'randomly generated salt';
        this.category = category;
        this.team = team;
        // TODO
    }
}
