import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Hint, Challenge, Team } from '../../../database';

@Entity()
export class UsedHint {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Hint, hint => hint.usedHints, { nullable: false, eager: true })
    hint: Hint;

    @ManyToOne(_ => Challenge, challenge => challenge.usedHints, { nullable: false, eager: true })
    challenge: Challenge;

    @ManyToOne(_ => Team, team => team.usedHints, { nullable: false })
    team: Team;

    constructor(hint: Hint, challenge: Challenge, team: Team) {
        this.hint = hint;
        this.challenge = challenge;
        this.team = team;
    }
}
