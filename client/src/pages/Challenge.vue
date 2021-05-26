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
                <Tooltip :title="challenge.round.name" :content="challenge.round.description" :below="true" :center="true">
                    <span>{{challenge.round.name}}</span>
                </Tooltip>
            </div>
            <span class=duration>{{durationDisplay(challenge)}}</span>
            <span class=time>{{countdownDisplay(challenge)}}</span>
            <div class=info>
                <Tooltip :title="typeName(challenge)" :content="typeDescription(challenge)" :below="true" :center="true">
                    <span class=type>{{typeName(challenge.type)}}</span>
                </Tooltip>
                <Tooltip content="TODO: points explanation" :below="true" :center="true">
                    <span class=points>{{challenge.points}} Points</span>
                </Tooltip>
                <Tooltip :title="challenge.tag.name" :content="challenge.tag.description" :below="true" :center="true">
                    <span class=tag>{{challenge.tag.name}}</span>
                </Tooltip>
            </div>
            <span class=description>{{challenge.description}}</span>
            <span v-if="challenge.attachment">TODO: attachment {{challenge.attachment}}</span>
            <span>TODO: quiz and interactive challenge extras</span>
            <span>TODO: submit flag</span>
            <span>TODO: hints</span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Loading from '@/components/Loading.vue';
import Tooltip from '@/components/Tooltip.vue';
import Collapse from '@/components/Collapse.vue';
import { Challenge, ChallengeType, Hint, Question, validChallenge, typeName, typeDescription, durationDisplay, countdownDisplay } from '@shared/validation/roundsForm';

export default Vue.extend({
    name: 'RoundsAdmin',
    components: {
        Loading,
        Tooltip,
        Collapse
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
        challenge: undefined as Challenge | undefined,
        
        loaded: false,
        time: new Date(),
        joinTeam: false,
        notStarted: false,
        locked: undefined as { id: number, name: string } | undefined
    }),
    methods: {
        durationDisplay(challenge: Challenge) { return challenge.round ? durationDisplay(challenge.round) : ''; },
        countdownDisplay(challenge: Challenge): string { return challenge.round ? countdownDisplay(this.time, challenge.round) : ''; },

        typeName(challenge: Challenge): string { return typeName(challenge.type); },
        typeDescription(challenge: Challenge): string { return typeDescription(challenge.type); }
    }
});
</script>

<style scoped lang="scss">
span, :not(span) > a {
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

    .name, .round, .duration, .time, .description {
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

        .type, .points, .tag {
            font-weight: bold;
            user-select: none;
        }

        .type, .tag {
            color: var(--info);
        }
    }

    .description {
        white-space: pre-wrap;
    }
}
</style>
