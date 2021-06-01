import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Challenge } from "../challenges/Challenge";
import { Team } from "../accounts/Team";

/**
 * One dockerChallenge is made only for one team
 */
@Entity()
export class DockerChallengeContainer {
    @PrimaryColumn()
    name: string

    @Column("int", { array: true })
    ports: number[];

    @ManyToOne(() => Challenge, { nullable: false, onDelete: 'CASCADE'})
    @JoinColumn({ name: "challenge" })
    challenge: Challenge;

    @ManyToOne(() => Team, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: "team" })
    team: Team;

    @CreateDateColumn()
    createdAt: string

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: number

    constructor(name: string, ports: number[], team: Team, challenge: Challenge) {
        this.name = name;
        this.ports = ports;
        this.team = team;
        this.challenge = challenge
    }
}
