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
                <Tooltip :title="challenge.round.name" :content="challenge.round.description" below center>
                    <span>{{challenge.round.name}}</span>
                </Tooltip>
            </div>
            <span class=duration>{{durationDisplay}}</span>
            <span class=time>{{countdownDisplay}}</span>
            <div class=info>
                <Tooltip :title="typeName" :content="typeDescription" below center>
                    <span class=type>{{typeName}}</span>
                </Tooltip>
                <Tooltip content="TODO: points explanation" below center>
                    <span class=points>{{challenge.points}} Point{{challenge.points == 1 ? '' : 's'}}</span>
                </Tooltip>
                <Tooltip v-if="challenge.tag" :title="challenge.tag.name" :content="challenge.tag.description" below center>
                    <span class=tag>{{challenge.tag.name}}</span>
                </Tooltip>
                <Tooltip v-else title="No tag" content="This challenge has not been given a tag" below center>
                    <span class=tag>No tag</span>
                </Tooltip>
                <div v-if="solved || ended" class=solve>
                    <span v-if="!solved"><font-awesome-icon icon=times class=icon-danger /> Not solved</span>
                    <span v-else><font-awesome-icon icon=check class=icon-primary /> Solved by <b>{{solveNames}}</b> for <b>{{solvePoints}}</b></span>
                </div>
            </div>
            <span class=description><span>{{challenge.description}}
                <span v-if="challenge.attachment" class=attachment>
                    <a :href="'/api/challenges/attachment/' + challenge.id" target=_blank><font-awesome-icon icon=download /> {{fileName}}</a>
                </span>
            </span></span>
            <span v-if="false">TODO: quiz and interactive challenge extras</span>
            <div v-if="!solved && !ended && challenge.type != typeValues.QUIZ" class=submit>
                <b-input type=text trim v-model="flag" placeholder="Challenge flag" :state="!incorrect" @input="incorrect = false; state = 'normal'"/>
                <StatusButton type=button variant=primary @click="submit()" :disabled="incorrect" :state="solved ? 'succes' : state"
                    normal=Submit loading=Submitting succes=Solved :error="incorrect ? 'Incorrect' : undefined"/>
            </div>
            <Collapse v-if="usedHints.length > 0" label="Used hints" center noborder value class=used-hints>
                <div class=list-item v-for="hint in usedHints" :key="hint.order">
                    <span>{{hint.cost}}</span>
                    <span>{{hint.name}}</span>
                    <span>{{hint.content}}</span>
                </div>
            </Collapse>
            <Collapse v-if="hints.length > 0" label=Hints center noborder class=hints>
                <span>TODO: hints explanation</span>
                <div class=list-item v-for="hint in hints" :key="hint.order">
                    <span class=item-name>{{hint.name}}</span>
                    <StatusButton type=button variant=primary @click="useHint(hint)" :state="hint.state || 'normal'"
                        :normal="`- ${hint.cost} TODODISPLAY`" loading=Loading succes=Used />
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
import { validChallenge, typeName, typeDescription, solvePoints, solveNames, durationDisplay, countdownDisplay } from '@shared/validation/roundsForm';
import { is } from '@shared/validation';
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
            else if (validChallenge(res.data)) this.challenge = res.data;

            setTimeout(() => this.time = new Date(), 1000);
            this.loaded = true;
        });
    },
    data: () => ({
        typeValues: { BASIC: ChallengeType.BASIC, QUIZ: ChallengeType.QUIZ, INTERACTIVE: ChallengeType.INTERACTIVE },
        challenge: undefined as Challenge | undefined,
        flag: '',

        state: 'normal',
        incorrect: false,

        loaded: false,
        time: new Date(),
        joinTeam: false,
        notStarted: false,
        locked: undefined as { id: number, name: string } | undefined
    }),
    computed: {
        durationDisplay() { return this.challenge?.round ? durationDisplay(this.challenge.round) : ''; },
        countdownDisplay(): string { return this.challenge?.round ? countdownDisplay(this.time, this.challenge.round) : ''; },

        typeName(): string { return typeName(this.challenge?.type || ''); },
        typeDescription(): string { return typeDescription(this.challenge?.type || ''); },
        fileName(): string { return path.basename(this.challenge?.attachment || ''); },
        solvePoints(): string { return solvePoints(this.challenge?.solves || []); },
        solveNames(): string { return solveNames(this.challenge?.solves || []); },
        hints(): Hint[] { return (this.challenge?.hints || []).filter(h => !h.content); },
        usedHints(): Hint[] { return (this.challenge?.hints || []).filter(h => h.content); },
        
        solved(): boolean { return (this.challenge?.solves || []).length > 0; },
        ended(): boolean { return this.challenge?.round ? new Date(this.challenge.round.end) < this.time : false; }
    },
    methods: {
        submit(): void {
            if (!this.flag) return;
            this.state = 'loading';
            const error = () => this.state = 'error';
            axios.put(`/api/challenges/solve/${this.challenge?.id || -1}/` + this.flag).then(res => {
                if (res.data.error || !res.data.solved) error();
                if (!res.data.solved) this.incorrect = true;
                if (res.data.solved) {
                    if (is.object(res.data.solved) && this.challenge)
                        this.challenge.solves = (this.challenge.solves || []).concat(res.data.solved);
                    this.state = 'succes';
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

    .submit {
        display: flex;
        margin-top: var(--double-margin);

        button {
            flex-shrink: 0;
            margin-left: var(--margin);
        }
    }

    .used-hints, .hints {
        margin-top: var(--double-margin);
        
        .item-name {
            flex-grow: 1;
        }
    }

    .used-hints .list-item {
        display: block;
    }
}

.icon-primary {
    color: var(--primary);
}

.icon-danger {
    color: var(--danger);
}
</style>
