import { Entity, PrimaryColumn, ManyToOne } from 'typeorm';
import { Challenge, Team } from '../../../database';

@Entity()
export class Environment {
    @PrimaryColumn()
    id: number;

    @Column()
    containerId: number;

    @Column()
    removed: boolean;


    @ManyToOne(_ => Team, team => team.environments, { nullable: false })
    team: Team;

    @ManyToOne(_ => Challenge, challenge => challenge.environments, { nullable: false })
    challenge: Challenge;

    constructor() {
        // TODO
    }
}
