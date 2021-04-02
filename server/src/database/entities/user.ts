import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('text')
    password: string;

    @Column('text')
    salt: string;

    @Column()
    category: number;

    @Column()
    team: number;

    constructor(name: string, password: string, category: number, team: number) {
        this.name = name;
        this.password = password;
        this.category = category;
        this.team = team;
    }
}
