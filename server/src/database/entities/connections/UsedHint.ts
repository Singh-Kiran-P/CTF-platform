import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Hint, Challenge, Team } from '../../../database';

@Entity()
export class UsedHint {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Hint, hint => hint.usedHints, { nullable: false, eager: true, onDelete: 'CASCADE' })
    hint: Hint;

    @ManyToOne(_ => Challenge, challenge => challenge.usedHints, { nullable: false, eager: true, onDelete: 'CASCADE' })
    challenge: Challenge;

    @ManyToOne(_ => Team, team => team.usedHints, { nullable: false, onDelete: 'CASCADE' })
    team: Team;

    constructor(hint: Hint, challenge: Challenge, team: Team) {
        this.hint = hint;
        this.challenge = challenge;
        this.team = team;
    }
}
