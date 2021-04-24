<template>
    <div id="Dashboard">
        <div class=header>
            <b-container class=info>
                <span class=teamname>{{team.name}}</span>
                <span class=placing>{{team.placement}} place</span>
                <span class=points>{{team.points}} points</span>
            </b-container>
        </div>

        <div class=buttons v-if="isCaptainOrAdmin">
            <b-button-group>
                <!--<b-button variant="outline-primary">
                    <b-icon icon="tools"></b-icon> Settings
                </b-button>-->
                <b-button variant="outline-primary" @click="openInviteModal($event)">
                    <b-icon icon="envelope-fill"></b-icon> Invite
                </b-button>
                <b-button variant="outline-primary" @click="modal_delete.open=true">
                    <b-icon icon="trash-fill"></b-icon> Delete
                </b-button>
            </b-button-group>
        </div>

        <div class=members>
            <label for="member-table">Members</label>
            <b-table id=member-table sticky-header striped :items="members" :fields="members_fields" :busy="members_isLoading">
                <template v-slot:cell(name)="row">
                    <span>{{row.item.name}}</span>
                    <b-icon-star id=captainIcon v-if="row.item.captain"></b-icon-star>
                </template>
                <template v-if="isCaptainOrAdmin" v-slot:cell(remove)="row">
                    <b-button v-if="!row.item.captain" :disabled="removingMember" size=sm variant="danger" @click="removeMember(row.item.name, $event)">
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
                <!--correctly loading info for category and description on hover-->
                <template v-slot:cell(category)="row">
                    <span v-b-tooltip.hover :title="row.item.category.description">{{row.item.category.name}}</span>
                </template>
                <template #table-busy>
                    <div class="text-center text-primary my-2">
                        <b-spinner class="align-middle"></b-spinner>
                        <strong>Loading...</strong>
                    </div>
                </template>
            </b-table>
        </div>

        <b-modal id="invite-modal" centered v-model="modal_invite.open" ok-only>
            <template #modal-title>
                Invite link
            </template>
            <div class=invite-modal-content>
                <span>{{generateInviteLink()}}</span>
                <b-button class="clipboard-btn" size=sm variant="primary" @click="copyInvite($event)" >
                        <b-icon-clipboard-check v-if="modal_invite.copied"></b-icon-clipboard-check>
                        <b-icon-clipboard v-else></b-icon-clipboard>
                </b-button>
            </div>
        </b-modal>
        <b-modal id="delete-modal" centered v-model="modal_delete.open">
            <template #modal-title>
                Delete Team
            </template>
            <div class=invite-modal-content>
                <span>Are you sure you want to delete your team?</span>
            </div>
            <template #modal-footer>
                <b-button class="float-right" @click="modal_delete.open=false"> Cancel </b-button>
                <b-button class="float-right" variant="danger" @click="deleteTeam($event)"> Confirm </b-button>
            </template>
        </b-modal>
        
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios, { AxiosResponse } from 'axios';

export default Vue.extend({
    name: 'Dashboard',
    data: () => ({
        team: {
            name: 'teamname',
            placement: 0,
            points: 0,
            uuid: '',
            inviteCode: ''            
        },
        isCaptainOrAdmin: false,
        removingMember: false,
        members_isLoading: true,
        members_fields: [
            {key: 'name', sortable:true},
            {key: 'points', sortable: true}
        ] as {key: string, sortable?: boolean, tdClass?: string}[],
        members: [] as { name: string, points: number, captain: boolean }[],
        solves_isLoading: true,
        solves_fields: [
            { key: 'name', sortable: true},
            { key: 'category', label: 'Category', sortable: true},
            { key: 'value', sortable: true},
            { key: 'date', sortable: true},
        ] as {key: string, sortable?: boolean, label?: string}[],
        solves: [] as { name: string, category: {name: string, description: string}, value: number, date: string} [],
        modal_invite: {
            open: false,
            copied: false
        },
        modal_delete: {
            open: false
        }
    }),
    computed: {
    },
    methods: {
        getMembers() {
            this.members_isLoading = true;
            axios.get('/api/team/getMembers/'+this.team.uuid).then((response)=>{
                    if(response.data.error) return alert(response.data.error);
                    this.members = response.data;
                    this.members_isLoading = false;
                }).catch((err)=>{alert(err)});
        },
        getSolves() {
            this.solves_isLoading = true;
            axios.get('/api/team/getSolves/'+this.team.uuid).then((response)=>{
                    if(response.data.error) return alert(response.data.error);
                    this.solves = response.data;
                    this.solves_isLoading = false;
                }).catch((err)=>{alert(err)});
        },
        removeMember(name:string, event: Event) {
            event.preventDefault();
            this.removingMember = true;
            axios.post(`/api/team/removeMember/${this.team.uuid}/${name}`).then((response)=>{
                if(response.data.error) return alert(response.data.error);
                this.getMembers();
                this.removingMember=false;
            }).catch((err)=>{alert(err)});
        },
        createdHandleResponse(response: AxiosResponse) {
            if(response.data.error) return alert(response.data.error);
            this.team = response.data.info;
            this.isCaptainOrAdmin = response.data.isCaptainOrAdmin;
            if(this.isCaptainOrAdmin) this.members_fields.push({ key: 'remove', sortable: false, tdClass: 'text-center' }); //add remove field if captain or admin
            this.getMembers();
            this.getSolves();
        },
        openInviteModal(e:Event) {
            e.preventDefault();
            this.modal_invite.copied = false;
            this.modal_invite.open = true;
        },
        copyInvite(e:Event) {
            e.preventDefault();
            this.copyTextToClipboard(this.generateInviteLink());
            this.modal_invite.copied = true;
        },
        generateInviteLink(): string {
            console.log()
            if(this.team.inviteCode != '') return window.location.origin + '/team/join/' + this.team.inviteCode;
            return '';
        },
        deleteTeam(e:Event) {
            e.preventDefault();
            axios.post('/api/team/delete/'+this.team.uuid).then((response)=>{
                    if(response.data.error) return alert(response.data.error);
                    this.$router.go(0); //reload
                }).catch((err)=>{alert(err)});
        },
        fallbackCopyTextToClipboard(text: string) {
            var textArea = document.createElement("textarea");
            textArea.value = text;
            
            // Avoid scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                var successful = document.execCommand('copy');
                if(!successful) alert('Error copying to clipboard');
            } catch (err) {
                alert('Error copying to clipboard');
            }

            document.body.removeChild(textArea);
        },
        copyTextToClipboard(text: string) {
            if (!navigator.clipboard) {
                this.fallbackCopyTextToClipboard(text);
                return;
            }
            navigator.clipboard.writeText(text).then(()=>{return;}).catch((err)=>{alert('Error copying to clipboard')});
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
        if(this.$route.params.uuid) axios.get('/api/team/infoDashboard/'+this.$route.params.uuid).then((response) => this.createdHandleResponse(response)).catch((err)=>{alert(err)});
        else axios.get('/api/team/infoDashboard').then((response) => this.createdHandleResponse(response)).catch((err)=>{alert(err)});
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
#captainIcon, .clipboard-btn {
    margin-left: var(--margin);
}
.invite-modal-content {
    word-wrap: break-word;
}
</style>
