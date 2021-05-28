<template>
    <Loading v-if="!loaded"/>
    <div v-else class=challenge>
        <div v-if="joinTeam">
            <span class=center>You have to be part of a team to join the competition</span>
            <router-link class=center :to="{ name: 'Team' }">Create or join a team</router-link>
        </div>
        <div v-else-if="notStarted">
            <span>This challenge is not yet available</span>
            <router-link class=center :to="{ name: 'Rounds' }">View available challenges</router-link>
        </div>
        <div v-else-if="locked">
            <span class=center>
                <font-awesome-icon icon=lock class=icon-info />
                This challenge is locked until <router-link :to="{ name: 'Challenge', params: { id: locked.id } }">{{locked.name}}</router-link> is solved
            </span>
        </div>
        <div v-else-if="!challenge">
            <span class=center>Could not load challenge</span>
        </div>
        <div v-else>
            <span class=name>{{challenge.name}}</span>
            <div class=round>
                <Tooltip :content="challenge.round.description" below center>
                    <span>{{challenge.round.name}}</span>
                </Tooltip>
            </div>
            <span class=duration>{{durationDisplay}}</span>
            <span class=time>{{countdownDisplay}}</span>
            <div class=info>
                <Tooltip :content="typeDescription" below center>
                    <span class=type>{{typeName}}</span>
                </Tooltip>
                <Tooltip content="TODO: points explanation" below center>
                    <span class=points>{{challenge.points}} Point{{challenge.points == 1 ? '' : 's'}}</span>
                </Tooltip>
                <Tooltip v-if="challenge.tag" :content="challenge.tag.description" below center>
                    <span class=tag>{{challenge.tag.name}}</span>
                </Tooltip>
                <Tooltip v-else content="This challenge has not been given a tag" below center>
                    <span class=tag>No tag</span>
                </Tooltip>
                <div v-if="solved || ended" class=solve>
                    <span v-if="!solved"><font-awesome-icon icon=times class=icon-danger /> Not solved</span>
                    <span v-else><font-awesome-icon icon=check class=icon-primary /> Solved by <b>{{solveNames}}</b> for <b>{{solvePoints}}</b></span>
                </div>
            </div>
            <span class=description><span v-if="challenge.description || challenge.attachment">{{challenge.description}}
                <span v-if="challenge.attachment" class=attachment>
                    <a :href="'/api/challenges/attachment/' + challenge.id" target=_blank><font-awesome-icon icon=download /> {{fileName}}</a>
                </span>
            </span></span>
            <template v-if="!solved && !ended">
                <div v-if="challenge.type == typeValues.INTERACTIVE" class=interactive>
                    <span v-if="startState != 'succes'">You can start your interactive environment below</span>
                    <span v-else><a :href="environment" target=_blank>Open your interactive environment</a></span>
                    <div class=controls>
                        <StatusButton variant=primary @click="!containerInit ? initContainer() : startContainer()" :disabled="resetState == 'loading'"
                            :state="!containerInit && startState != 'error' ? 'loading' : startState" normal=Start :loading="containerInit ? 'Starting' : 'Loading'" succes=Started />
                        <StatusButton variant=info @click="resetContainer()" :disabled="stopState != 'normal'" :state="resetState" normal=Reset loading=Resetting succes=Reset />
                        <StatusButton variant=danger @click="stopContainer()" :disabled="resetState == 'loading'" :state="stopState" normal=Stop loading=Stopping succes=Stopped />
                    </div>
                </div>
                <div class=submit>
                    <template v-if="challenge.type == typeValues.QUIZ">
                        <span class=question-number>Question {{questionNumber}}/{{challenge.questions.length}}</span>
                        <span class=question><span>{{question.question}}</span></span>
                    </template>
                    <b-input type=text trim v-model="input" :state="!incorrect" @input="incorrect = false; state = 'normal'" :placeholder="`Enter ${quiz ? 'answer' : 'challenge flag'}`"/>
                    <Tooltip :title="rateLimited ? 'Your team is being rate limited' : ''" :content="rateLimited ? 'Your last submission has not been checked' : ''" center show>
                        <StatusButton @click="submit()" :disabled="input.length == 0 || incorrect || rateLimited" :state="incorrect || rateLimited ? 'error' : (solved ? 'succes' : state)"
                            variant=primary normal=Submit loading=Submitting succes=Solved :error="rateLimited ? `Retry in ${rateLimit}` : (incorrect ? 'Incorrect' : undefined)"/>
                    </Tooltip>
                </div>
            </template>
            <Collapse v-if="usedHints.length > 0" label="Used hints" center noborder value class=used-hints>
                <div class=list-item v-for="hint in usedHints" :key="hint.order">
                    <div class=item-content>
                        <span class=item-name>{{hint.name}}</span>
                        <span class=hint-content>{{hint.content}}</span>
                    </div>
                    <Tooltip :title="hint.name" :content="`This hint costed you ${costName(hint).toLowerCase()}`" center>
                        <span class=hint-cost>-{{costName(hint)}}</span>
                    </Tooltip>
                </div>
            </Collapse>
            <Collapse v-if="hints.length > 0" label=Hints center noborder class=hints>
                <span>TODO: hints explanation</span>
                <div class=list-item v-for="hint in hints" :key="hint.order">
                    <span class="item-name item-content">{{hint.name}}</span>
                    <Tooltip :title="hint.name" :content="solved ? 'You did not use this hint' : `Using this hint will cost you ${costName(hint).toLowerCase()}`" center>
                        <StatusButton variant=danger size=sm @click="useHint(hint)" :state="hint.state || 'normal'" :disabled="solved"
                            :normal="'-' + costName(hint)" loading=Loading succes=Used />
                    </Tooltip>
                </div>
            </Collapse>
            <span>TODO: admin</span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Loading from '@/components/Loading.vue';
import Tooltip from '@/components/Tooltip.vue';
import Collapse from '@/components/Collapse.vue';
import StatusButton from '@/components/StatusButton.vue';
import { Challenge, ChallengeType, Hint, Question } from '@shared/validation/roundsForm';
import { validChallenge, typeName, typeDescription, solvePoints, solveNames, durationDisplay, countdownDisplay, timeDisplay } from '@shared/validation/roundsForm';
import path from 'path';

export default Vue.extend({
    name: 'RoundsAdmin',
    components: {
        Loading,
        Tooltip,
        Collapse,
        StatusButton
    },
    created() {
        axios.get('/api/challenges/' + this.$route.params.id).then(res => {
            if (res.data.joinTeam) this.joinTeam = true;
            else if (res.data.notStarted) this.notStarted = true;
            else if (res.data.locked) this.locked = res.data.locked;
            else if (validChallenge(res.data)) {
                this.challenge = res.data;
                this.initContainer();
            }

            setInterval(() => this.time = new Date(), 1000);
            this.loaded = true;
        });
    },
    data: () => ({
        typeValues: { BASIC: ChallengeType.BASIC, QUIZ: ChallengeType.QUIZ, INTERACTIVE: ChallengeType.INTERACTIVE },
        challenge: undefined as Challenge | undefined,
        input: '',

        loaded: false,
        time: new Date(),
        joinTeam: false,
        notStarted: false,
        locked: undefined as { id: number, name: string } | undefined,

        state: 'normal',
        incorrect: false,
        rateLimitTime: 0,

        containerInit: false,
        startState: 'normal',
        resetState: 'normal',
        stopState: 'succes',

        answer: ''
    }),
    computed: {
        solved(): boolean { return (this.challenge?.solves || []).length > 0; },
        ended(): boolean { return this.challenge?.round ? new Date(this.challenge.round.end) < this.time : false; },

        durationDisplay() { return this.challenge?.round ? durationDisplay(this.challenge.round) : ''; },
        countdownDisplay(): string { return this.challenge?.round ? countdownDisplay(this.time, this.challenge.round) : ''; },

        typeName(): string { return typeName(this.challenge?.type || ''); },
        typeDescription(): string { return typeDescription(this.challenge?.type || ''); },
        fileName(): string { return path.basename(this.challenge?.attachment || ''); },
        solvePoints(): string { return solvePoints(this.challenge?.solves || []); },
        solveNames(): string { return solveNames(this.challenge?.solves || []); },

        hints(): Hint[] { return (this.challenge?.hints || []).filter(h => !h.content); },
        usedHints(): Hint[] { return (this.challenge?.hints || []).filter(h => h.content); },
        rateLimit(): string { return this.rateLimitTime <= this.time.getTime() ? '' : timeDisplay(this.rateLimitTime - this.time.getTime(), true); },
        rateLimited(): boolean { return this.rateLimit.length > 0; },

        environment(): string { return '/TODO'; },

        quiz(): boolean { return this.challenge?.type == ChallengeType.QUIZ; },
        questionNumber(): number { return this.challenge?.questions?.filter(q => q.question).length || 0; },
        question(): Question | undefined { return this.challenge?.questions?.reduce((acc, cur) => cur.question ? cur : acc); }
    },
    methods: {
        submit(): void {
            if (!this.input) return;
            this.state = 'loading';
            const error = () => this.state = 'error';
            let params = this.quiz ? { answer: this.input } : { flag: this.input };
            axios.post(`/api/challenges/${this.quiz ? 'answer' : 'solve'}/${this.challenge?.id || -1}${this.quiz ? `/${this.question?.order || -1}` : ''}`, params).then(res => {
                this.state = 'normal';
                if (res.data.rateLimit) this.rateLimitTime = res.data.rateLimit;
                else if (res.data.error) error();
                else if (!res.data.solved) this.incorrect = true;
                else if (this.challenge && (!this.quiz || this.challenge.questions)) {
                    this.input = '';
                    if (res.data.solved !== true) this.challenge.solves = (this.challenge.solves || []).concat(res.data.solved);
                    else if (this.quiz && res.data.next && (this.challenge.questions?.length || -1) > this.questionNumber)
                        this.$set(this.challenge.questions!, this.questionNumber, res.data.next);
                    else this.state = 'succes';
                }
            }).catch(() => error());
        },

        useHint(hint: Hint & { state?: string }): void {
            Vue.set(hint, 'state', 'loading');
            const error = () => hint.state = 'error';
            axios.put('/api/challenges/hint/' + hint.id).then(res => {
                if (res.data.error) return error();
                hint.content = res.data;
                hint.state = 'succes';
            }).catch(() => error());
        },

        costName(hint: Hint): string { return `${hint.cost} Point${hint.cost == 1 ? '' : 's'}`; },

        initContainer(): void {
            this.startState = 'normal';
            setTimeout(() => {
                let error = false;
                let started = false;
                if (error) return this.startState = 'error';
                if (started) this.startState = 'succes';
                this.containerInit = true;
            }, 1000);
        },

        startContainer(): void {
            this.startState = 'loading';

            setTimeout(() => {
                let error = false;
                if (error) return this.startState = 'error';
                this.startState = 'succes';
                this.stopState = 'normal';
            }, 1000);
        },
        resetContainer(): void {
            this.resetState = 'loading';

            setTimeout(() => {
                let error = false;
                if (error) return this.resetState = 'error';
                this.resetState = 'normal';
            }, 1000);
        },
        stopContainer(): void {
            this.stopState = 'loading';

            setTimeout(() => {
                let error = false;
                if (error) return this.stopState = 'error';
                this.stopState = 'succes';
                this.startState = 'normal';
            }, 1000);
        }
    }
});
</script>

<style scoped lang="scss">
@import '@/assets/css/listform.scss';

:not(span) > span, :not(span) > a {
    display: block;
}

.challenge {
    display: flex;
    justify-content: center;
    overflow-y: scroll !important;
    padding: var(--double-margin);
    padding-bottom: 0;

    & > * {
        width: min(100%, var(--breakpoint-md));
    }

    .name, .round, .duration, .time, .solve, .description {
        text-align: center;
    }

    .name {
        display: block;
        font-weight: bold;
        font-size: var(--font-massive);
    }

    .round {
        font-weight: bold;
        user-select: none;

        * {
            display: inline-block;
        }
    }

    .info {
        display: flex;
        justify-content: space-around;
        margin: var(--margin) 0;
        padding-bottom: var(--margin);
        border-bottom: 2px solid black;
        flex-wrap: wrap;

        .type, .points, .tag {
            font-weight: bold;
            user-select: none;
        }

        .type, .tag {
            color: var(--info);
        }

        .solve {
            width: 100%;
            flex-shrink: 0;
            margin-top: var(--margin);
        }
    }

    .description {
        white-space: pre-wrap;

        & > span {
            text-align: initial;
            display: inline-block;
        }
    }

    .attachment {
        display: block;
        margin-top: var(--double-margin);
    }

    .interactive {
        margin-top: var(--double-margin);

        span {
            text-align: center;
            margin-bottom: var(--margin);

            a {
                font-weight: bold;
            }
        }

        .controls {
            display: flex;

            button {
                width: 0;
                flex-grow: 1;

                &:not(:last-of-type) {
                    margin-right: var(--double-margin);
                }
            }
        }
    }

    .submit {
        display: flex;
        flex-wrap: wrap;
        margin-top: var(--double-margin);

        span {
            width: 100%;
            text-align: center;
        }

        .question-number, .question {
            font-weight: bold;
        }

        .question {
            white-space: pre-wrap;
            font-size: var(--font-large);
            margin: var(--margin) 0;

            & > span {
                width: initial;
                text-align: initial;
                display: inline-block;
            }
        }

        input, textarea {
            width: 0;
            flex-grow: 1;
            margin-right: var(--margin);
        }
    }

    .hints .list-item {
        align-items: center;

        .item-name {
            margin-right: var(--margin);
        }
    }

    .used-hints .list-item {
        flex-wrap: wrap;
    }

    .used-hints, .hints {
        margin-top: var(--double-margin);

        .list-item {
            *:not(.item-name) {
                flex-shrink: 0;
            }

            button {
                margin-left: var(--margin);
            }

            .hint-cost {
                font-weight: bold;
                color: var(--danger);
                user-select: none;
            }

            .hint-content {
                width: 100%;
            }
        }
    }
}

.icon-primary {
    color: var(--primary);
}

.icon-danger {
    color: var(--danger);
}
</style>
