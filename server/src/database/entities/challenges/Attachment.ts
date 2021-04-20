import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Challenge } from '../../../database';

@Entity()
export class Attachment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Challenge, challenge => challenge.attachments, { nullable: false })
    challenge: Challenge;

    @Column()
    filename: string;

    constructor() {
        // TODO
    }
}
