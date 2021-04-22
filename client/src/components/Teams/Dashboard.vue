<template>
    <div id="Dashboard">
        <div class=header>
            <b-container class=info>
                <span class=teamname>{{team.name}}</span>
                <span class=placing>{{team.placement}} place</span>
                <span class=points>{{team.points}} points</span>
            </b-container>
        </div>

        <div class=buttons v-if="isCaptain">
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
            <label for="member-table">Members</label>
            <b-table id=member-table sticky-header striped :items="members" :fields="members_fields" :busy="members_isLoading">
                <!--<template #cell(name)="data">-->
                    <!-- `data.value` is the value after formatted by the Formatter -->
                    <!--<a :href="`#${data.value}`">{{ data.value }}</a>
                </template>-->
                <template v-slot:cell(name)="row">
                    <span>{{row.item.name}}</span>
                    <b-icon-star v-if="row.item.captain"></b-icon-star>
                </template>
                <template v-if="isCaptain" v-slot:cell(remove)="row">
                    <b-button class=mx-auto size=sm variant="danger">
                        <b-icon-trash></b-icon-trash>
                    </b-button>
                </template>
                <template #table-busy>
                    <div class="text-center text-primary my-2">
                        <b-spinner class="align-middle"></b-spinner>
                        <strong>Loading...</strong>
                    </div>
                </template>
            </b-table>
        </div>

        <div class=solves>
            <label for="solves-table">Solves</label>
            <b-table id=solves-table sticky-header striped :items="solves" :fields="solves_fields" :busy="solves_isLoading">
                <!--<template #cell(name)="data">
                    `data.value` is the value after formatted by the Formatter
                    <a :href="`#${data.value}`">{{ data.value }}</a>
                </template>-->
                <!--correctly loading info for category and description on hover-->
                <template v-slot:cell(category)="row">
                    <span v-b-tooltip.hover :title="row.item.category.description">{{row.item.category.name}}</span>
                </template>
                <!--define table busy state spinner-->
                <template #table-busy>
                    <div class="text-center text-primary my-2">
                        <b-spinner class="align-middle"></b-spinner>
                        <strong>Loading...</strong>
                    </div>
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
        isCaptain: false,
        members_isLoading: true,
        members_fields: [
            {key: 'name', sortable:true},
            {key: 'points', sortable: true}
        ],
        members: [] as { name: string, points: number, captain: boolean }[],
        solves_isLoading: true,
        solves_fields: [
            { key: 'name', sortable: true},
            { key: 'category', label: 'Category', sortable: true},
            { key: 'value', sortable: true},
            { key: 'date', sortable: true},
        ],
        solves: [] as { name: string, category: {name: string, description: string}, value: number, date: string} []
    }),
    computed: {
    },
    methods: {
        memberEx() {
            console.log(this.members);
            console.log(this.members.some(item=>item.name == "kiran"));
        },
        getMembers() {
            axios.get('/api/team/getMembers/'+this.team.uuid).then((response)=>{
                    if(response.data.error) return alert(response.data.error);
                    this.members = response.data;
                    this.members_isLoading = false;
                }).catch((err)=>{alert(err)});
        },
        getSolves() {
            axios.get('/api/team/getSolves/'+this.team.uuid).then((response)=>{
                    if(response.data.error) return alert(response.data.error);
                    this.solves = response.data;
                    this.solves_isLoading = false;
                }).catch((err)=>{alert(err)});
        }
    },
    created() {
        //Testdata when not using axios
        /*this.members.push({name: 'lander', points: 1000, captain: false});
        this.members.push({name: 'kiran', points: 1000, captain: true});
        this.members.push({name: 'senn', points: 850, captain: false});
        this.members.push({name: 'random', points: 11000, captain: false});
        this.members_isLoading = false;
        this.memberEx();
        this.solves.push({name: 'challenge1', category:{name:'find', description:'finding'}, value: 100, date: '10/2/2021'});
        this.solves.push({name: 'challenge2', category:{name:'find', description:'finding'}, value: 100, date: '10/2/2021'});
        this.solves.push({name: 'challenge3', category:{name:'find', description:'finding'}, value: 100, date: '10/2/2021'})
        this.solves_isLoading = false;
        */
        //Todo get uuid via link if given
        //else -> get uuid with get request
        axios.get('/api/team/infoDashboard').then((response) => {
            if(response.data.error) return alert(response.data.error);
            this.team = response.data.info;
            this.isCaptain = response.data.isCaptain;
            if(this.isCaptain) this.members_fields.push({ key: 'remove', sortable: false });
            this.getMembers();
            this.getSolves();            
        }).catch((err)=>{alert(err)});
    }
});
</script>

<style scoped lang="scss">
.info span {
    font-weight: bold;
    
}
.info {
    padding: var(--triple-margin);
    margin: auto;
    display: flex;
    flex-direction: column;
}
.header {
    background-color: #343a40f3;
    color: var(--primary);
    width: 100%;
    text-align: center;
    margin-bottom: var(--margin);
}
.buttons {
    padding: var(--margin);
    margin: auto;
    display: flex;
    flex-direction: row;
    justify-content: center;
}
.solves, .members {    
    padding: var(--margin);
    width: min(100%, 750px);
    margin: auto;
}
table {
    border: 1px solid lightgray;
}
label {
    size: 3rem;
    font-weight: bold;
}
td > .b-icon {
    margin-left: var(--margin);
}
</style>
