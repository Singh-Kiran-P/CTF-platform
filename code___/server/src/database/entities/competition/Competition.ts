import { Entity, Column, PrimaryColumn, Repository, EntityRepository } from 'typeorm';

@Entity()
export class Competition {
    @PrimaryColumn()
    name: string;

    @Column()
    paused: boolean;

    @Column()
    flagFormat: string;

    constructor(name: string) {
        this.name = name;
        this.paused = false;
        this.flagFormat = '';
    }
}

@EntityRepository(Competition)
export class CompetitionRepo extends Repository<Competition> {
    instance() {
        return this.findOne();
    }

    setName(name: string) {
        return this.createQueryBuilder().update().set({ name: name }).execute();
    }
}
