import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Environment, Solve, Question, Round, Hint, Tag } from '../../../database';

export enum ChallengeType {
    QUIZ = 'quiz',
    BASIC = 'basic',
    INTERACTIVE = 'interactive'
}

@Entity()
export class Challenge {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Challenge, challenge => challenge.following, { nullable: true })
    previous: Challenge;

    @OneToMany(_ => Challenge, challenge => challenge.previous)
    following: Challenge[]

    @ManyToOne(_ => Tag, tag => tag.challenges, { nullable: true })
    tag: Tag;

    @ManyToOne(_ => Round, round => round.challenges, { nullable: false, onDelete: 'CASCADE' })
    round: Round;

    @OneToMany(_ => Hint, hint => hint.challenge)
    hints: Hint[];

    @OneToMany(_ => Question, question => question.quiz)
    questions: Question[];

    @OneToMany(_ => Environment, environment => environment.challenge)
    environments: Environment[];

    @OneToMany(_ => Solve, solve => solve.challenge)
    solves: Solve[];

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    points: number;

    @Column({ type: 'enum', enum: ChallengeType })
    type: ChallengeType;

    @Column()
    flag: string;

    @Column()
    order: number;

    @Column()
    attachments: string;

    @Column()
    dockerfile: string;

    @Column()
    visibility: boolean; // TODO: remove this?

    constructor(params?: { round: Round, name: string, description: string, points: number, flag: string, attachments: string, order: number }) {
        if (!params) return;

        // TODO
        this.type = ChallengeType.BASIC;
        this.dockerfile = '';
        this.visibility = false;
        
        this.round = params.round;
        this.name = params.name;
        this.description = params.description;
        this.points = params.points;
        this.flag = params.flag;
        this.attachments = params.attachments;
        this.order = params.order;
    }
}
