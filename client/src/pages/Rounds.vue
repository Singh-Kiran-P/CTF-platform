<template>
    <div class=list-form>
        <b-form @submit="onSubmit($event)">
            <b-form-group :state="state(roundsFeedback)" :invalid-feedback="roundsFeedback">
            <div class="list-item nostyle round" v-for="(round, i) in form.rounds" :key="i">
                    <div class=item-content>
                        <template v-if="!round.editable">
                            <span class=item-name>{{round.name}}</span>
                            <span>{{timeDisplay(round)}}</span>
                        </template>
                        <template v-else>
                            <b-form-input type=text trim v-model="round.name" placeholder="Enter round name" :state="state(roundFeedback(round))"/>
                            <DateTimePicker v-model="round.start" :state="state(roundFeedback(round))" label="Starts at"/>
                            <DateTimePicker v-model="round.end" :state="state(roundFeedback(round))"  label="Ends at"/>
                            <b-form-invalid-feedback>{{roundFeedback(round)}}</b-form-invalid-feedback>
                        </template>
                    </div>
                    <IconButton class=info icon=pen icon2=save :toggled="round.editable" :disabled="round.editable && !state(roundFeedback(round))" @click="editRound(round)"/>
                    <IconButton class=danger icon=times @click="removeRound(round)"/>

                    <b-form-group class=challenges :state="state(challengesFeedback(round))" :invalid-feedback="challengesFeedback(round)">
                        <Collapse label=Challenges noborder v-model="round.challengesVisible" :loading="round.challengesLoading" @toggle="toggledChallenges(round)">
                            <div :class="['list-item', { nostyle: challenge.editable }]" v-for="challenge in round.challenges" :key="challenge.order">
                                <div class=item-content v-if="!challenge.editable">
                                    <span class=item-name>{{challenge.name}}</span>
                                    <span class="item-description nowrap">{{challenge.description}}</span>
                                    <span class=item-description v-if="challenge.tag">
                                        <span class=item-category>Tag</span>
                                        <span class=item-value>{{challenge.tag.name}}</span>
                                    </span>
                                    <span class=item-description>
                                        <span class=item-category>Points</span>
                                        <span class=item-value>{{challenge.points}}</span>
                                    </span>
                                    <span class=item-description>
                                        <span class=item-category>Type</span>
                                        <span class=item-value>{{typeText(challenge.type)}}</span>
                                    </span>
                                    <b-form-invalid-feedback :state="state(challengeFeedback(round, challenge))">{{challengeFeedback(round, challenge)}}</b-form-invalid-feedback>
                                </div>
                                <div :class="{ 'edit-challenge-header': challenge.editable }">
                                    <span v-if="challenge.editable">Editing challenge</span>
                                    <IconButton class=info icon=pen icon2=save :toggled="challenge.editable" @click="editChallenge(round, challenge)"
                                        :disabled="challenge.editable && !state(challengeFeedback(round, challenge))"/>
                                    <IconButton class=primary icon=chevron-down @click="challengeDown(round, challenge)"/>
                                    <IconButton class=danger icon=times @click="removeChallenge(round, challenge)"/>
                                </div>
                                <div v-if="challenge.editable" class=edit-item>
                                    <span class=input-tag>Name</span>
                                    <b-form-input type=text trim v-model="challenge.name" placeholder="Enter challenge name" :state="state(challengeFeedback(round, challenge))"/>
                                    <span class=input-tag>Description</span>
                                    <b-form-textarea max-rows="10" v-model="challenge.description" placeholder="Enter challenge description"
                                        :state="state(challengeFeedback(round, challenge))"/>
                                    <span class=input-tag>Tag</span>
                                    <b-form-select v-model="challenge.tag" :options="tags" :state="state(challengeFeedback(round, challenge))"/>
                                    <span class=input-tag>Points</span>
                                    <b-form-input type=number :number="true" v-model="challenge.points" placeholder="Enter challenge points"
                                        :state="state(challengeFeedback(round, challenge))"/>
                                    <span class=input-tag>Flag</span>
                                    <b-form-input type=text trim v-model="challenge.flag" placeholder="Enter challenge flag" :state="state(challengeFeedback(round, challenge))"/>
                                    <span class=input-tag>Attachment</span>
                                    <div class=challenge-attachment-input>
                                        <b-form-file v-model="challenge.attachFile" :placeholder="attachPlaceholder(challenge)" :state="state(challengeFeedback(round, challenge))"/>
                                        <b-button type=button variant=danger @click="removeAttachment(challenge)"><font-awesome-icon icon=times /></b-button>
                                    </div>
                                    <span class=input-tag>Previous TODO OTHER NAME</span>
                                    <b-form-select v-model="challenge.previous" :options="previousList(round, challenge)" :state="state(challengeFeedback(round, challenge))"/>
                                    <span class=input-tag>Type</span>
                                    <b-form-select v-model="challenge.type" :options="types" :state="state(challengeFeedback(round, challenge))" @input="changedType(challenge)"/>
                                    <template v-if="challenge.type == typeValues.INTERACTIVE">
                                        <span class=input-tag>Docker TODO HOW TO CALL THIS</span>
                                        <b-form-file accept=".zip" v-model="challenge.dockerFile" :placeholder="dockerPlaceholder(challenge)"
                                            :state="state(challengeFeedback(round, challenge))"/>
                                    </template>
                                    <b-form-invalid-feedback>{{challengeFeedback(round, challenge)}}</b-form-invalid-feedback>
                                    <b-form-group v-if="challenge.type == typeValues.QUIZ" :state="state(questionsFeedback(challenge))" :invalid-feedback="questionsFeedback(challenge)">
                                        <Collapse class=questions label=Questions noborder v-model="challenge.questionsVisible" :loading="challenge.questionsLoading"
                                            @toggle="toggledQuestions(challenge)">
                                            <div class=list-item v-for="question in challenge.questions" :key="question.order">
                                                <div :class="['item-content', { editable: question.editable }]">
                                                    <template v-if="!question.editable">
                                                        <span class=item-name>{{question.question}}</span>
                                                        <span class=item-description>{{question.answer}}</span>
                                                    </template>
                                                    <template v-else>
                                                        <b-form-textarea max-rows="10" v-model="question.question" placeholder="Enter quiz question"
                                                            :state="state(questionFeedback(question))"/>
                                                        <b-form-textarea max-rows="10" v-model="question.answer" placeholder="Enter question answer"
                                                            :state="state(questionFeedback(question))"/>
                                                    </template>
                                                    <b-form-invalid-feedback>{{questionFeedback(question)}}</b-form-invalid-feedback>
                                                </div>
                                                <IconButton class=info icon=pen icon2=save :toggled="question.editable" @click="editQuestion(question)"
                                                    :disabled="question.editable && !state(questionFeedback(question))"/>
                                                <IconButton class=primary icon=chevron-down @click="questionDown(challenge, question)"/>
                                                <IconButton class=danger icon=times @click="removeQuestion(challenge, question)"/>
                                            </div>
                                            <b-button class=add-list-item variant=primary @click="addQuestion(challenge)">Add a new question</b-button>
                                        </Collapse>
                                    </b-form-group>
                                    <b-form-group :state="state(hintsFeedback(challenge))" :invalid-feedback="hintsFeedback(challenge)">
                                        <Collapse class=hints label=Hints noborder v-model="challenge.hintsVisible" :loading="challenge.hintsLoading"
                                            @toggle="toggledHints(challenge)">
                                            <div class=list-item v-for="hint in challenge.hints" :key="hint.order">
                                                <div :class="['item-content', { editable: hint.editable }]">
                                                    <template v-if="!hint.editable">
                                                        <span class=item-name>{{hint.name}}</span>
                                                        <span class=item-description>{{hint.content}}</span>
                                                    </template>
                                                    <template v-else>
                                                        <b-form-input type=text trim v-model="hint.name" placeholder="Enter hint name" :state="state(hintFeedback(hint))"/>
                                                        <b-form-textarea max-rows="10" v-model="hint.content" placeholder="Enter hint content"
                                                            :state="state(hintFeedback(hint))"/>
                                                    </template>
                                                    <span class=item-description>
                                                        <span class=item-category>Cost</span>
                                                        <span v-if="!hint.editable" class=item-value>{{hint.cost}}</span>
                                                        <b-form-input v-else type=number :number="true" v-model="hint.cost" placeholder="Enter hint cost"
                                                            :state="state(hintFeedback(hint))"/>
                                                    </span>
                                                    <b-form-invalid-feedback>{{hintFeedback(hint)}}</b-form-invalid-feedback>
                                                </div>
                                                <IconButton class=info icon=pen icon2=save :toggled="hint.editable" @click="editHint(hint)"
                                                    :disabled="hint.editable && !state(hintFeedback(hint))"/>
                                                <IconButton class=primary icon=chevron-down @click="hintDown(challenge, hint)"/>
                                                <IconButton class=danger icon=times @click="removeHint(challenge, hint)"/>
                                            </div>
                                            <b-button class=add-list-item variant=primary @click="addHint(challenge)">Add a new hint</b-button>
                                        </Collapse>
                                    </b-form-group>
                                </div>
                            </div>
                            <b-button class=add-list-item variant=primary @click="addChallenge(round)">Add a new challenge</b-button>
                        </Collapse>
                    </b-form-group>
                </div>
                <Collapse label="Add a new round">
                    <div class=add-list-item>
                        <b-form-input type=text trim v-model="add.round.name" placeholder="Enter new round name" :state="state(newRoundFeedback)"/>
                        <b-button type=button variant=primary :disabled="!validNewRound" @click="addRound()"><font-awesome-icon icon=plus /></b-button>
                        <DateTimePicker v-model="add.round.start" :state="state(newRoundFeedback)" label="Starts at"/>
                        <DateTimePicker v-model="add.round.end" :state="state(newRoundFeedback)" label="Ends at"/>
                        <b-form-invalid-feedback>{{newRoundFeedback}}</b-form-invalid-feedback>
                    </div>
                </Collapse>
            </b-form-group>

            <StatusButton type=button variant=danger :state="cancelState" normal=Cancel loading=Loading succes=Loaded :disabled="saveState == 'loading'" @click="onCancel()"/>
            <StatusButton type=submit variant=primary :state="saveState" normal=Save loading=Saving succes=Saved :disabled="!validForm || cancelState == 'loading'"/>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Collapse from '@/components/Collapse.vue';
import IconButton from '@/components/IconButton.vue';
import StatusButton from '@/components/StatusButton.vue';
import DateTimePicker from '@/components/DateTimePicker.vue';
import { nextOrder, moveDown } from '@/assets/listFunctions';
import { Question, Hint, Challenge, Round, Form, ChallengeType } from '@shared/validation/roundsForm';
import { state, validate, validInput, sortRounds, validForm, validChallenges, validHints, validQuestions } from '@shared/validation/roundsForm';
import { Tag } from '@shared/validation/competitionForm';
import { serialize } from '@shared/objectFormdata';
import { is } from '@shared/validation';
import path from 'path';

type Editable = { editable?: boolean };
type ChallengesVisible = { challengesVisible?: boolean };
type HintsVisible = { hintsVisible?: boolean };
type QuestionsVisible = { questionsVisible?: boolean };

export default Vue.extend({
    name: 'Rounds',
    components: {
        Collapse,
        IconButton,
        StatusButton,
        DateTimePicker
    },
    created() {
        this.types = Object.values(this.typeValues).map(type => ({ value: type, text: this.typeText(type) }))
        axios.get('/api/competition/tags').then(res => {
            this.tags = this.tags.concat(res.data.map((tag: Tag) => ({ value: tag, text: tag.name })));
            this.loadFormData();
        });
    },
    data: () => ({
        form: {
            rounds: [] as (Round & ChallengesVisible)[]
        },
        add: {
            round: { name: '', start: '', end: '' }
        },

        types: [] as { value: string, text: string }[],
        typeValues: { BASIC: ChallengeType.BASIC, QUIZ: ChallengeType.QUIZ, INTERACTIVE: ChallengeType.INTERACTIVE }, // make enum available in the html
        tags: [{ value: null, text: 'No tag' }] as { value: Tag | null, text: string }[],

        loaded: false,
        saveState: 'normal',
        cancelState: 'normal'
    }),
    computed: {
        newRound(): Round { return Object.assign({}, this.add.round, { folder: '', challenges: [] }); },

        newRoundFeedback(): string { return this.roundFeedback(this.newRound, true); },
        validNewRound(): boolean { return validInput(this.newRoundFeedback, this.newRound.name, this.newRound.start, this.newRound.end); },

        roundsFeedback(): string { return validate.rounds(this.form.rounds); },

        validForm(): boolean { return validForm(this.form); }
    },
    watch: {
        form: { deep: true, handler() {
            let state = 'normal';
            if (this.loaded) {
                state = 'succes';
                this.loaded = false;
            }
            this.saveState = state;
            this.cancelState = state;
        }}
    },
    methods: {
        state, // make the state function available in the html

        loadFormData(close: boolean = true): void {
            this.cancelState = 'loading';
            if (close) this.add.round = { name: '', start: '', end: '' };
            const error = () => {
                this.cancelState = 'error';
                this.saveState = 'normal';
            }
            axios.get('/api/rounds/data').then(res => {
                let data: Form = res.data;
                if (!validForm(data)) return error();
                let rounds = data.rounds.map((round, i) => Object.assign({}, round, { challengesVisible: close ? false : this.form.rounds[i]?.challengesVisible }));
                Promise.all(rounds.filter(round => round.challengesVisible).map(round => this.loadChallenges(round))).then(() => {
                    this.loaded = true;
                    this.form.rounds = rounds;
                });
            }).catch(() => error());
        },
        onCancel(): void {
            this.loadFormData();
        },
        onSubmit(e: Event): void {
            e.preventDefault();
            this.saveState = 'loading';
            const error = () => this.saveState = 'error';
            axios.put('/api/rounds/save', serialize(this.form)).then(res => {
                res.data.error ? error() : this.loadFormData(false);
            }).catch(() => error());
        },

        toggledItems<C>(container: C & Object, loading: string, getVisible: (c: C) => boolean | undefined, getItems: (c: C) => any[] | undefined, loadItems: (c: C) => any): void {
            if (getVisible(container) && getItems(container) == undefined) {
                Vue.set(container, loading, true);
                loadItems(container);
            }
        },
        loadItems(container: { id?: number, }, list: string, loading: string, visible: string, request: string, getValid: (data: any) => boolean): Promise<void> {
            return new Promise<void>(resolve => {
                const setItems = (items?: any[]) => {
                    Vue.set(container, list, items);
                    Vue.set(container, loading, false);
                    resolve();
                }
                if (!container.id) setItems([]);
                else axios.get(request + container.id).then(res => {
                    if (res.data.error || (!is.array(res.data, _ => false) && !getValid(res.data))) {
                        Vue.set(container, visible, false);
                        setItems(undefined);
                    } else setItems(res.data);
                });
            });
        },

        timeDisplay(round: Round): string {
            let [start, end] = [round.start, round.end].map(time => new Date(time));
            let [startday, endday] = [start, end].map(time => time.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
            let [starttime, endtime] = [start, end].map(time => time.toLocaleString('nl-BE', { hour: 'numeric', minute: 'numeric' }));
            return `${startday}, ${starttime} - ${startday == endday ? '' : endday + ', '}${endtime}`;
        },
        roundFeedback(round: Round, add: boolean = false): string { return validate.round(round, this.form.rounds, add); },
        removeRound(round: Round): void { this.form.rounds = this.form.rounds.filter(x => x != round); },
        editRound(round: Round & Editable): void {
            if (round.editable && !state(this.roundFeedback(round))) return;
            if (round.editable) this.form.rounds = sortRounds(this.form.rounds);
            Vue.set(round, 'editable', !round.editable);
        },
        addRound(): void {
            if (!this.validNewRound) return;
            this.form.rounds = sortRounds(this.form.rounds.concat(this.newRound));
            this.add.round = { name: '', start: '', end: '' };
        },
        toggledChallenges(round: Round & ChallengesVisible): void {
            this.toggledItems(round, 'challengesLoading', r => r.challengesVisible, r => r.challenges, r => this.loadChallenges(r));
        },
        loadChallenges(round: Round): Promise<void> {
            return this.loadItems(round, 'challenges', 'challengesLoading', 'challengesVisible', '/api/rounds/challenges/', (data: any) => validChallenges(data));
        },

        typeText(type: string): string { return type == ChallengeType.INTERACTIVE ? 'Interactive' : (type == ChallengeType.QUIZ ? 'Quiz' : 'Basic'); },
        docker(challenge: Challenge): string { return challenge.dockerFile ? challenge.dockerFile.name || '' : path.basename(challenge.docker); },
        attachment(challenge: Challenge): string { return challenge.attachFile ? challenge.attachFile.name || '' : path.basename(challenge.attachment); },
        dockerPlaceholder(challenge?: Challenge): string { return (challenge?.dockerFile || challenge?.docker) ? this.docker(challenge) : 'Upload challenge docker TODO HOW CALL THIS'; },
        attachPlaceholder(challenge?: Challenge): string { return (challenge?.attachFile || challenge?.attachment) ? this.attachment(challenge) : 'Upload challenge attachment'; },
        removeAttachment(challenge: Challenge): void { Vue.set(challenge, 'attachment', ''); Vue.set(challenge, 'attachFile', null); },
        challengesFeedback(round: Round): string { return validate.challenges(round.challenges); },
        challengeFeedback(round: Round, challenge: Challenge, add: boolean = false): string { return validate.challenge(challenge, round.challenges, add); },
        removeChallenge(round: Round, challenge: Challenge): void { round.challenges = round.challenges?.filter(x => x.order != challenge.order) || []; },
        challengeDown(round: Round, challenge: Challenge): void {
            let order = challenge.order;
            moveDown(round.challenges || [], challenge.order);
            let next = round.challenges?.find(c => c.order > order)?.order || -1;
            if (next > -1 && order > -1) round.challenges?.forEach(c => {
                let set = c.previous == order ? next : (c.previous == next ? order : c.previous);
                if (set != c.previous) Vue.set(c, 'previous', set);
            });
        },
        editChallenge(round: Round, challenge: Challenge & Editable): void {
            if (!challenge.editable || state(this.challengeFeedback(round, challenge))) Vue.set(challenge, 'editable', !challenge.editable);
        },
        addChallenge(round: Round): void {
            if (round.challenges == undefined) round.challenges = [];
            let add = { order: nextOrder(round.challenges), type: ChallengeType.BASIC, editable: true, attachFile: null, dockerFile: null, previous: -1 };
            round.challenges.push(Object.assign({}, add, { name: '', description: '', tag: null, points: NaN, flag: '', attachment: '', docker: '', hints: [], questions: undefined }));
        },
        previousList(round: Round, challenge: Challenge){
            return [{ value: -1, text: 'No previous TODO NAME' }].concat(round.challenges?.filter(c => c.order < challenge.order).map(c => ({ value: c.order, text: c.name })) || []);
        },
        changedType(challenge: Challenge) {
            if (challenge.type == ChallengeType.QUIZ && challenge.questions == undefined) this.toggledQuestions(challenge, true);
        },
        toggledHints(challenge: Challenge & HintsVisible): void {
            this.toggledItems(challenge, 'hintsLoading', c => c.hintsVisible, c => c.hints, c => this.loadHints(c));
        },
        loadHints(challenge: Challenge): Promise<void> {
            return this.loadItems(challenge, 'hints', 'hintsLoading', 'hintsVisible', '/api/rounds/challenge/hints/', data => validHints(data));
        },
        toggledQuestions(challenge: Challenge & QuestionsVisible, visible?: boolean): void {
            this.toggledItems(challenge, 'questionsLoading', c => visible || c.questionsVisible, c => c.questions, c => this.loadQuestions(c));
        },
        loadQuestions(challenge: Challenge): Promise<void> {
            return this.loadItems(challenge, 'questions', 'questionsLoading', 'questionsVisible', '/api/rounds/challenge/questions/', data => validQuestions(data));
        },

        hintsFeedback(challenge: Challenge): string { return validate.hints(challenge.hints); },
        hintFeedback(hint: Hint, add: boolean = false): string { return validate.hint(hint, add); },
        hintDown(challenge: Challenge, hint: Hint): void { moveDown(challenge.hints || [], hint.order); },
        removeHint(challenge: Challenge, hint: Hint): void { challenge.hints = challenge.hints?.filter(x => x.order != hint.order) || []; },
        editHint(hint: Hint & Editable): void { if (!hint.editable || state(this.hintFeedback(hint))) Vue.set(hint, 'editable', !hint.editable); },
        addHint(challenge: Challenge): void {
            if (challenge.hints == undefined) challenge.hints = [];
            let add = { order: nextOrder(challenge.hints), editable: true };
            challenge.hints.push(Object.assign({}, add, { name: '', content: '', cost: NaN }));
        },

        questionsFeedback(challenge: Challenge): string { return validate.questions(challenge.questions); },
        questionFeedback(question: Question, add: boolean = false): string { return validate.question(question, add); },
        questionDown(challenge: Challenge, question: Question): void { moveDown(challenge.questions || [], question.order); },
        removeQuestion(challenge: Challenge, question: Question): void { challenge.questions = challenge.questions?.filter(x => x.order != question.order) || []; },
        editQuestion(question: Question & Editable): void { if (!question.editable || state(this.questionFeedback(question))) Vue.set(question, 'editable', !question.editable); },
        addQuestion(challenge: Challenge): void {
            if (challenge.questions == undefined) challenge.questions = [];
            let add = { order: nextOrder(challenge.questions), editable: true };
            challenge.questions.push(Object.assign({}, add, { question: '', answer: '' }));
        }
    }
});
</script>

<style scoped lang="scss">
@import '@/assets/css/listform.scss';

.round {
    flex-wrap: wrap;
    border-bottom: 2px solid black;
    
    & > button {
        background-color: var(--white);
    }

    &:not(:last-of-type) {
        margin-bottom: var(--double-margin);
    }
    
    .item-name {
        font-size: var(--font-large);
    }

    .date-time-picker {
        margin-top: var(--margin);
    }
}

.challenges {
    width: 100%;
    margin: var(--margin) 0;

    .list-item {
        .item-description.nowrap {
            display: block;
            overflow-x: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        &.nostyle {
            display: block;
        }
    }

    .edit-challenge-header {
        display: flex;
        padding: var(--margin);
        padding-bottom: 0;

        span {
            font-weight: bold;
            flex-grow: 1;
        }

        button {
            background-color: var(--white);
        }
    }

    .edit-item {
        border: 2px solid black;
        border-radius: var(--border-radius);
        padding: var(--margin);

        .input-tag {
            display: block;
            font-weight: bold;
            
            &:not(:first-child) {
                margin-top: var(--margin);
            }
        }

        .challenge-attachment-input {
            display: flex;
            
            button {
                margin-left: var(--margin);
            }
        }

        .form-group {
            margin: 0;
        }

        .hints, .questions {
            margin-top: var(--margin);
        }

        .questions {
            .item-content span {
                white-space: pre-wrap;
            }

            textarea:first-of-type {
                margin-top: 0;
            }
        }
    }

    .add-list-item {
        display: block;
        margin-bottom: 0;
    }
}
</style>
