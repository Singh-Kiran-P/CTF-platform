<template>
    <div id="Dashboard">
        <div class=header>
            <b-container class=info>
                <span class=teamname>{{team.name}}</span>
                <span class=placing>{{team.placement}} place</span>
                <span class=points>{{team.points}} points</span>
            </b-container>
        </div>

        <div class=buttons>
            <b-button-group>
                <b-button variant="outline-primary">
                    <b-icon icon="tools"></b-icon> Settings
                </b-button>
                <b-button variant="outline-primary">
                    <b-icon icon="envelope-fill"></b-icon> Invite
                </b-button>
                <b-button variant="outline-primary">
                    <b-icon icon="trash-fill"></b-icon> Delete
                </b-button>
            </b-button-group>
        </div>

        <div class=members>
            <b-table sticky-header striped :items="members" :fields="members_fields">
                <!--<template #cell(name)="data">-->
                    <!-- `data.value` is the value after formatted by the Formatter -->
                    <!--<a :href="`#${data.value}`">{{ data.value }}</a>
                </template>-->
            </b-table>
        </div>

        <div class=solves>
            <b-table sticky-header striped :items="solves" :fields="solves_fields">
                <template #cell(name)="data">
                    <!-- `data.value` is the value after formatted by the Formatter -->
                    <a :href="`#${data.value}`">{{ data.value }}</a>
                </template>
            </b-table>
        </div>
        
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

export default Vue.extend({
    name: 'Dashboard',
    data: () => ({
        team: {
            name: 'teamname',
            placement: 0,
            points: 0,
            uuid: 0
        },
        members_fields: [
            {key: 'name', sortable:true},
            {key: 'points', sortable: true}
        ],
        members: [] as { name: string, points: number }[],
        solves_fields: [
            { key: 'name', sortable: true},
            { key: 'category', sortable: true},
            { key: 'value', sortable: true},
            { key: 'date', sortable: true},
        ],
        solves: [] as { name: string, category: string, value: number, date: string} []
    }),
    computed: {

    },
    methods: {
        memberProvider() {

        },
        solvesProvider() {
            // Here we don't set isBusy prop, so busy state will be
            // handled by table itself
            // this.isBusy = true
            let promise = axios.get('/some/url')

            return promise.then((response) => {
            const items = response.data
            // Here we could override the busy state, setting isBusy to false
            // this.isBusy = false
            return(items)
            }).catch(error => {
            // Here we could override the busy state, setting isBusy to false
            // this.isBusy = false
            // Returning an empty array, allows table to correctly handle
            // internal busy state in case of error
            return []
            })
        } 
    },
    created() {
        this.members.push({name: 'lander', points: 1000});
        this.members.push({name: 'kiran', points: 1000});
        this.members.push({name: 'senn', points: 850});
        this.members.push({name: 'random', points: 11000});

        this.solves.push({name: 'challenge1', category:'find', value: 100, date: '10/2/2021'});
        this.solves.push({name: 'challenge2', category:'test', value: 100, date: '10/2/2021'});
        this.solves.push({name: 'challenge3', category:'lol', value: 100, date: '10/2/2021'});
        this.solves.push({name: 'challenge4', category:'find', value: 100, date: '10/2/2021'});
        this.solves.push({name: 'challenge1', category:'find', value: 100, date: '10/2/2021'});
        this.solves.push({name: 'challenge2', category:'test', value: 100, date: '10/2/2021'});
        this.solves.push({name: 'challenge3', category:'lol', value: 100, date: '10/2/2021'});
        this.solves.push({name: 'challenge4', category:'find', value: 100, date: '10/2/2021'});
    }
    
});
</script>

<style scoped lang="scss">
span {
    font-weight: bold;
    display: block;
}
.info {
    padding: 3rem;
    margin: auto;
}
.header {
    background-color: #343a40f3;
    color: var(--primary);
    width: 100%;
    text-align: center;
}
.buttons {
    padding: 1rem;
    margin: auto;
    display: flex;
    flex-direction: row;
    justify-content: center;
}
.solves, .members {    
    padding: 1rem;
}
table {
    border: 1px solid lightgray;
}
</style>
