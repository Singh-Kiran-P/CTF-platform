import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Solve, Question, Round, Hint, Tag, UsedHint } from '../../../database';
import { ChallengeType } from '@/shared/src/validation/roundsForm';

export { ChallengeType };

@Entity()
export class Challenge {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Round, round => round.challenges, { nullable: false, onDelete: 'CASCADE' })
    round: Round;

    @Column()
    name: string;

    @Column()
    description: string;

    @ManyToOne(_ => Tag, tag => tag.challenges, { nullable: true, onDelete: 'SET NULL', eager: true })
    tag: Tag;

    @Column()
    points: number;

    @Column()
    flag: string;

    @Column()
    attachment: string;

    @OneToMany(_ => Hint, hint => hint.challenge)
    hints: Hint[];

    @Column()
    lock: number;

    @Column()
    order: number;

    @Column({ type: 'enum', enum: ChallengeType })
    type: ChallengeType;

    @Column()
    docker: string;

    @Column()
    dockerImageId: string;

    @Column()
    innerPorts: string;

    @OneToMany(_ => Question, question => question.quiz)
    questions: Question[];

    @OneToMany(_ => UsedHint, usedHint => usedHint.challenge)
    usedHints: UsedHint[];

    @OneToMany(_ => Solve, solve => solve.challenge)
    solves: Solve[];

    constructor(params?: { round: Round, name: string, description: string, tag: Tag | null, points: number, flag: string, order: number, type: ChallengeType, id?: number,
        attachment: string, docker: string, innerPorts: string, dockerImageId: string, lock: number }) {
        if (!params) return;
        let docker = params.type == ChallengeType.INTERACTIVE;
        this.id = params.id;
        this.round = params.round;
        this.name = params.name;
        this.description = params.description;
        this.tag = params.tag;
        this.points = params.points;
        this.flag = params.flag;
        this.attachment = params.attachment;
        this.docker = docker ? params.docker : '';
        this.dockerImageId = docker ? params.dockerImageId : '';
        this.innerPorts = docker ? params.innerPorts : '';
        this.order = params.order;
        this.lock = params.lock;
        this.type = params.type;
    }
}
