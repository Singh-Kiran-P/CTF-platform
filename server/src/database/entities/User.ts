import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
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

    constructor(name: string, password: string, category: number, team: number, salt: string) {
        this.name = name;
        this.password = password;
        this.category = category;
        this.team = team;
        this.salt = salt;
    }
}
