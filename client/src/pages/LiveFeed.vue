<template>
    <div class=live-feed>
        <div>
            <div class=disclaimer>
                <span>Showing live data</span>
                <Tooltip below class=disclaimer-tooltip title="Showing used hints, attempts and solves"
                    content="
                    The data being shown will be lost upon reloading or leaving this page<br/><br/>
                    Any item links you click will automatically open in a new page to prevent this from happening<br/><br/>
                    Dismissing an item does not undo the action">
                    <font-awesome-icon icon=info-circle />
                </Tooltip>
            </div>
            <div v-if="feed.length == 0" class=empty>
                <span>Nothing has happened yet...</span>
            </div>
            <div class="list-item card" v-for="(item, i) in [...feed].reverse()" :key="`${item.time}-${i}`">
                <div class=content>
                    <span>
                        <b>{{item.account}}</b>
                        <template v-if="item.team"> from <a :href="'/team/' + item.team.id" target=_blank>{{item.team.name}} </a></template>
                        <span class=inline v-html="action(item)"/>
                        <template v-if="item.question"> question {{item.question.i}} / {{item.question.length}} from</template>
                        <a :href="'/challenge/' + item.challenge.id" target=_blank> {{item.challenge.name}}</a>
                        <template v-if="item.points"> for <b>{{(item.type == typeValues.HINT ? '-' : '') + item.points}}</b> point{{item.points == 1 ? '' : 's'}}</template>
                        <span v-if="item.content && item.type != typeValues.HINT">'{{item.content}}'</span>
                    </span>
                </div>
                <div class=footer>
                    <span>{{timeDisplay(item)}}</span>
                    <b-button type=button variant=danger @click="dismiss(i)">Dismiss</b-button>
                </div>
            </div>
            <div class=bottom-padding />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { is } from '@/shared/src/validation';
import Tooltip from '@/components/Tooltip.vue';
import { timeDisplay } from'@/assets/functions/strings';

enum Type {
    ATTEMPT = 'attempt',
    SOLVE = 'solve',
    HINT = 'hint'
}

type Item = {
    question: { i: number, length: number } | undefined,
    challenge: { name: string, id: number },
    team: { name: string, id: string } | undefined,
    account: string,
    content: string,
    points: number | undefined,
    time: string,
    type: Type
}

export default Vue.extend({
    name: 'LiveFeed',
    components: {
        Tooltip
    },
    created() {
        this.$socket.$subscribe('attempted', (data: any) => this.add(data, Type.ATTEMPT));
        this.$socket.$subscribe('solved', (data: any) => this.add(data, Type.SOLVE));
        this.$socket.$subscribe('hintUsed', (data: any) => this.add(data, Type.HINT));
    },
    data: () => ({
        feed: [] as Item[]
    }),
    computed: {
        typeValues() { return { ATTEMPT: Type.ATTEMPT, SOLVE: Type.SOLVE, HINT: Type.HINT } }
    },
    methods: {
        add(data: any, type: Type): void { if (this.validate(data)) this.feed.push(Object.assign({}, data, { type: type })); },
        validate(data: any): boolean {
            let v = is.object(data) && (!data.question || is.object(data.question)) && is.object(data.challenge) && (!data.team || is.object(data.team));
            v = v && (!data.question || (is.number(data.question.i) && is.number(data.question.length)));
            v = v && is.string(data.challenge.name) && is.number(data.challenge.id);
            v = v && (!data.team || (is.string(data.team.name) && is.string(data.team.id)));
            return v && is.string(data.account) && is.string(data.content) && (!data.points || is.number(data.points)) && is.date(data.time);
        },
        dismiss(i: number) {
            i = this.feed.length - i - 1;
            this.feed = this.feed.slice(0, i).concat(this.feed.slice(i + 1));
        },

        timeDisplay(item: Item): string { return timeDisplay(item.time); },
        action(item: Item) { return item.type == Type.SOLVE ? 'solved' : (item.type == Type.ATTEMPT ? 'attempted to solve' : `used <b>${item.content}</b> from`) }
    }
});
</script>

<style scoped lang="scss">
@import '@/assets/css/listform.scss';

.live-feed {
    display: flex;
    justify-content: center;
    overflow-y: scroll !important;
    padding: var(--double-margin);
    padding-bottom: 0;

    & > div {
        width: min(100%, var(--breakpoint-sm));
    }
}

.disclaimer {
    padding-bottom: var(--double-margin);
    border-bottom: var(--border-c) solid var(--black-c);

    span {
        font-weight: bold;
        margin-right: var(--margin);
    }

    .disclaimer-tooltip {
        display: inline-block;
        color: var(--info);
        flex-shrink: 0;
    }
}

.empty {
    margin-top: var(--margin);
    text-align: center;
}

.icon-info {
    color: var(--info);
}

.content {
    * {
        word-break: normal;
    }

    span .inline {
        display: inline-block !important;
    }
}
</style>
