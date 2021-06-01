<template>
    <Loading v-if="isLoading"/>
    <div v-else-if="error">
        <span class=top-error>Something went wrong, return to the <router-link :to="{ name: 'Teams' }">teams page</router-link></span>
    </div>
    <div v-else class=dashboard>
        <div>
            <span class=name>{{team.name}}</span>
            <div class=buttons v-if="isCaptain || isAdmin || isMember">
                <div v-if="isCaptain || isAdmin">
                    <b-button variant=primary @click="openInviteModal($event)"><font-awesome-icon icon=envelope /> Invite</b-button>
                    <b-button variant=danger @click="modal_delete.open=true"><font-awesome-icon icon=trash-alt /> Delete</b-button>
                </div>
                <div v-else-if="isMember">
                    <StatusButton variant=danger :state="leavingState" normal="Leave Team" loading=Leaving succes=Left @click="leaveTeam"/>
                </div>
            </div>
            
            <span class=place><font-awesome-icon icon=chart-bar class=icon-info /> Placed #{{team.placement}}</span>
            <span class=points><font-awesome-icon icon=check class=icon-primary /> {{team.points}} Point{{team.points == 1 ? '' : 's'}}</span>

            <div class=members>
                <label>Members</label>
                <span class=error v-if="membersLoadingError">{{membersLoadingError}}</span>
                <b-table fixed striped :items="members" :fields="members_fields" :busy="members_isLoading">
                    <template v-slot:cell(name)="row">
                        <span>{{row.item.name}}</span>
                        <Tooltip v-if="row.item.captain" :title="`${row.item.name} is the captain of ${team.name}`" content="The captain can delete the team, remove members and generate new invite links" class=captain-icon>
                            <font-awesome-icon icon=star />
                        </Tooltip>
                    </template>
                    <template v-if="isCaptain || isAdmin" v-slot:cell(remove)="row">
                        <StatusButton v-if="!row.item.captain" size=sm variant=danger :state="row.item.removingState" normal=Remove loading=Removing succes=Removed @click="removeMember(row.item, $event)"/>
                    </template>
                    <template #table-busy>
                        <div class="text-center text-primary">
                            <b-spinner variant=primary label=Loading />
                        </div>
                    </template>
                </b-table>
            </div>

            <div class=solves>
                <label>Solves</label>
                <span class=error v-if="solvesLoadingError">{{solvesLoadingError}}</span>
                <b-table fixed striped :items="solves" :fields="solves_fields" :busy="solves_isLoading">
                    <template v-slot:cell(challenge)="row">
                        <router-link :to="'/challenge/' + row.item.challenge.id">{{row.item.challenge.name}}</router-link>
                    </template>
                    <template v-slot:cell(time)="row">
                        <span>{{timeDisplay(row.item.time)}}</span>
                    </template>
                    <template #table-busy>
                        <div class="text-center text-primary">
                            <b-spinner variant=primary label=Loading />
                        </div>
                    </template>
                </b-table>
            </div>
            <div class=bottom-padding />

            <b-modal id=invite-modal centered v-model="modal_invite.open">
                <template #modal-title>Invite link</template>
                <div class=invite-modal-content>
                    <span>{{this.inviteLink}}</span>
                </div>
                <template #modal-footer id=invite-modal-footer>
                    <b-button class="clipboard-btn" variant="primary" @click="copyInvite($event)">
                        <template v-if="!modal_invite.copied">
                            <font-awesome-icon icon=clipboard /> Copy
                        </template>
                        <template v-else>
                            <font-awesome-icon icon=clipboard-check /> Copied
                        </template>
                    </b-button>
                    <StatusButton class=float-right variant=info :state="modal_invite.renewState" normal="Generate new link" loading=Generating succes=Generated @click="generateNewLink($event)"/>
                </template>
            </b-modal>
            <b-modal id=delete-modal centered v-model="modal_delete.open">
                <template #modal-title>Delete Team</template>
                <div class=invite-modal-content>
                    <span>Are you sure you want to delete your team?</span>
                </div>
                <template #modal-footer>
                    <StatusButton class="float-right" variant=danger :state="modal_delete.deletingState" normal="Confirm" loading="Deleting" succes="Deleted" @click="deleteTeam($event)"/>
                </template>
            </b-modal>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios, { AxiosResponse } from 'axios';
import Loading from '@/components/Loading.vue'
import Tooltip from '@/components/Tooltip.vue';
import StatusButton from '@/components/StatusButton.vue';
import { shortTimeDisplay } from '@/assets/functions/strings';

export default Vue.extend({
    name: 'Dashboard',
    components: {
        StatusButton,
        Tooltip,
        Loading
    },
    data: () => ({
        error: '',
        isLoading: true,
        team: {
            name: 'teamname',
            placement: 0,
            points: 0,
            uuid: '',
        },
        inviteLink: '',         
        isAdmin: false,
        isCaptain: false,
        isMember: false,
        removingMember: false,
        members_isLoading: true,
        membersLoadingError: '',
        members_fields: [
            { key: 'name', sortable:true },
            { key: 'points', sortable: true }
        ] as {key: string, sortable?: boolean, tdClass?: string}[],
        members: [] as { name: string, points: number, captain: boolean, removingState: 'normal' }[],
        solves_isLoading: true,
        solvesLoadingError: '',
        solves_fields: [
            { key: 'challenge', sortable: true },
            { key: 'solvedBy', label: 'Solved by', sortable: true },
            { key: 'points', sortable: true },
            { key: 'time', sortable: true }
        ] as {key: string, sortable?: boolean, label?: string}[],
        solves: [] as { challenge: { name: string, id: number }, solvedBy: string, points: number, time: string} [],
        modal_invite: {
            open: false,
            copied: false,
            renewState: 'normal'
        },
        modal_delete: {
            open: false,
            deletingState: 'normal'
        },
        leavingState: 'normal'
    }),
    methods: {
        timeDisplay(time: string): string { return shortTimeDisplay(time); },
        
        getMembers() {
            this.members_isLoading = true;
            axios.get('/api/team/getMembers/'+this.team.uuid).then((response)=>{
                    if(response.data.error) { this.membersLoadingError = response.data.error; this.members_isLoading = false; return; }
                    this.members = response.data;
                    this.members_isLoading = false;
                }).catch((err)=>{this.membersLoadingError = err; this.members_isLoading = false; return;});
        },
        getSolves() {
            this.solves_isLoading = true;
            axios.get('/api/team/getSolves/'+this.team.uuid).then((response)=>{
                    if(response.data.error) { this.solvesLoadingError = response.data.error; this.solves_isLoading = false; return; }
                    this.solves = response.data;
                    this.solves_isLoading = false;
                }).catch((err)=>{this.solvesLoadingError = err; this.solves_isLoading = false; return;});
        },
        removeMember(member: { name: string, points: number, captain: boolean, removingState: string }, event: Event) {
            event.preventDefault();
            member.removingState = 'loading';
            axios.post(`/api/team/removeMember/${this.team.uuid}/${member.name}`).then((response)=>{
                if(response.data.error) {member.removingState = 'error'; return;};
                this.getMembers();
            }).catch((err)=>{member.removingState = 'error'; return;});
        },
        createdHandleResponse(response: AxiosResponse) {
            if(response.data.error) return this.error = response.data.error;
            this.team = response.data.info;
            this.inviteLink = this.generateInviteLink(response.data.info.inviteCode);
            this.isAdmin = response.data.isAdmin;
            this.isCaptain = response.data.isCaptain;
            this.isMember = response.data.isMember;
            if(this.isCaptain||this.isAdmin) this.members_fields.push({ key: 'remove', sortable: false, tdClass: '' });
            this.getMembers();
            this.getSolves();
        },
        openInviteModal(e:Event) {
            e.preventDefault();
            this.modal_invite.copied = false;
            this.modal_invite.open = true;
            this.modal_invite.renewState = 'normal'
        },
        copyInvite(e:Event) {
            e.preventDefault();
            this.copyTextToClipboard(this.inviteLink);
            this.modal_invite.copied = true;
        },
        generateInviteLink(inviteCode: string): string {
            return window.location.origin + '/team/join/' + inviteCode;
        },
        generateNewLink(e:Event) {
            e.preventDefault();
            this.modal_invite.renewState = 'loading'
            axios.post('/api/team/newInviteLink/'+this.team.uuid).then((response)=>{
                if(response.data.error) return this.modal_invite.renewState = 'error';
                this.inviteLink = this.generateInviteLink(response.data.inviteCode);
                this.modal_invite.renewState = 'succes';
                this.modal_invite.copied = false;
            }).catch((err)=>{this.modal_invite.renewState = 'error'});
        },
        deleteTeam(e:Event) {
            e.preventDefault();
            this.modal_delete.deletingState = 'loading'
            axios.post('/api/team/delete/'+this.team.uuid).then((response)=>{
                    if(response.data.error) return this.modal_delete.deletingState = 'error';
                    if(this.isAdmin) {this.$router.replace({name: 'Teams'}); return;}
                    this.$router.go(0); //reload
                }).catch((err)=>{this.modal_delete.deletingState = 'error'});
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
            } catch (err) {}

            document.body.removeChild(textArea);
        },
        copyTextToClipboard(text: string) {
            if (!navigator.clipboard) {
                this.fallbackCopyTextToClipboard(text);
                return;
            }
            navigator.clipboard.writeText(text).then(()=>{return;}).catch((err)=>{alert('Error copying to clipboard')});
        },
        leaveTeam() {
            this.leavingState = 'loading';
            axios.post('/api/account/leaveTeam').then((response)=>{
                    if(response.data.error) return this.leavingState = 'error';
                    this.$router.go(0); //reload
                }).catch((err)=>{this.leavingState = 'error'});
        }
    },
    created() {
        if(this.$route.params.uuid) {
            axios.get('/api/team/infoDashboard/'+this.$route.params.uuid).then((response) => {
                if(response.data.error) {
                    this.error = response.data.error;
                    this.isLoading = false;
                    return;
                } 
                this.isLoading = false;
                this.createdHandleResponse(response)})
            .catch((err)=>{this.error = err; this.isLoading = false;});
        } else {
             axios.get('/api/team/infoDashboard').then((response) => {
                this.isLoading = false;
                this.createdHandleResponse(response);
             })
             .catch((err)=>{this.error = err; this.isLoading = false;});
        }
    }
});
</script>

<style scoped lang="scss">
.dashboard {
    display: flex;
    justify-content: center;
    overflow-y: scroll !important;
    padding: var(--double-margin);
    padding-bottom: 0;

    & > div {
        width: min(100%, var(--breakpoint-lg));
    }
}

.name {
    display: block;
    font-weight: bold;
    text-align: center;
    font-size: var(--font-massive);
    margin-bottom: var(--double-margin);
}

.buttons {
    display: flex;
    justify-content: center;
    margin-bottom: var(--double-margin);

    button + button {
        margin-left: var(--double-margin);
    }
}

.points, .place {
    display: block;
    font-weight: bold;
    text-align: center;
}

.icon-primary {
    color: var(--primary);
}

.icon-info {
    color: var(--info);
}

.top-error {
    display: block;
    text-align: center;
    margin-top: var(--double-margin);
}

.error {
    color: red;
    margin-left: var(--margin);
}

label {
    font-weight: bold;
    font-size: var(--font-large);
    margin-top: var(--double-margin);
}

.captain-icon {
    display: inline-block;
    margin-left: var(--margin);
}
</style>
