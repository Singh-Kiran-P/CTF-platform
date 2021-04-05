import { Entity, PrimaryColumn, ManyToOne } from 'typeorm';
import { Challenge } from '../challenges/Challenge';
import { Team } from '../users/Team';

@Entity()
export class Environment {
    @PrimaryColumn()
    environment: number;

    @ManyToOne(_ => Team, team => team.environments, { nullable: false })
    team: Team;

    @ManyToOne(_ => Challenge, challenge => challenge.environments, { nullable: false })
    challenge: Challenge;

    constructor() {
        // TODO
    }
}
