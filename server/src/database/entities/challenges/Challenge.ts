import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Environment, Solve, Attachment, Question, Round, Hint, Tag } from '../../../database';

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

    @ManyToOne(_ => Round, round => round.challenges, { nullable: false })
    round: Round;

    @OneToMany(_ => Attachment, attachment => attachment.challenge)
    attachments: Attachment[];

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
    dockerfile: string;

    @Column()
    visibility: boolean;

    constructor(round: Round, name: string, description: string, points: number, flag: string, order: number) {
        this.type = ChallengeType.BASIC;
        this.dockerfile = 'TODO';
        this.visibility = false;
        
        this.name = name;
        this.description = description;
        this.points = points;
        this.flag = flag;
        this.order = order;
        if (!round) return;
        this.round = round;
        // TODO
    }
}
