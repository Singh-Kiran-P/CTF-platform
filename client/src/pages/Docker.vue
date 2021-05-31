<template>
    <div v-if="true" class=docker>
        <div>
            <div class=ports>
                <span>Ports</span>
                <Tooltip below class=info-tooltip
                    content="
                        Ports for interactive environments will be assigned within this range<br/><br/>
                        Adding exluded ports will prevent them from being assigned, you cannot undo this">
                    <font-awesome-icon icon=info-circle />
                </Tooltip>
                <label>Lower bound port
                    <b-input type=number number v-model="lowerbound" :state="portState" placeholder="Enter lower bound port" @input="portInput()"/>
                </label>
                <label>Upper bound port
                    <b-input type=number number v-model="upperbound" :state="portState" placeholder="Enter upper bound port" @input="portInput()"/>
                </label>
                <label>Add excluded ports
                    <b-input type=text trim v-model="excluded" :state="portState" placeholder="Enter excluded ports to be added" @input="portInput()"/>
                    <span>Multiple ports should be seperated with a comma, for example: '8080, 900'</span>
                </label>
                <b-form-invalid-feedback :state="state(validatePorts)">{{validatePorts}}</b-form-invalid-feedback>
                <div class=buttons>
                    <StatusButton variant=danger normal=Cancel loading=Loaded succes=Loaded :state="cancelState" @click="cancelPorts()" :disabled="cancelDisabled"/>
                    <StatusButton variant=primary normal=Save loading=Saving succes=Saved :state="saveState" @click="savePorts()" :disabled="saveDisabled"/>
                </div>
            </div>
        </div>
        <span class=info>You can view your docker images and containers below, and you can manage them <a :href="manage" target=_blank>here</a></span>
        <div class=images>
            <label>Images</label>
            <Tooltip below content="TODO: images explanation" class=info-tooltip>
                <font-awesome-icon icon=info-circle />
            </Tooltip>
            <b-table striped :busy="loadingImages" :fields="imageFields" :items="images">
                <template #table-busy>
                    <div class="text-center text-primary">
                        <b-spinner variant=primary label=Loading />
                    </div>
                </template>
            </b-table>
        </div>
        <div class=containers>
            <label>Containers</label>
            <Tooltip below content="TODO: containers explanation" class=info-tooltip>
                <font-awesome-icon icon=info-circle />
            </Tooltip>
            <b-table striped :busy="loadingContainers" :fields="containerFields" :items="containers">
                <template #table-busy>
                    <div class="text-center text-primary">
                        <b-spinner variant=primary label=Loading />
                    </div>
                </template>
            </b-table>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import Tooltip from '@/components/Tooltip.vue';
import StatusButton from '@/components/StatusButton.vue';
import { validateNumber, state } from '@shared/validation';
import ports from '@/assets/functions/ports';

type Container = {
    name: string,
    image: string,
    ports: String,
    state: string,
    status: string
};

type Image = {
    name: string,
    size: string
}

export default Vue.extend({
    name: 'Docker',
    components: {
        StatusButton,
        Tooltip
    },
    created() {
        this.getContainers();
        this.getImages();
        this.cancelPorts();
    },
    data: () => ({
        images: [] as Image[],
        containers: [] as Container[],
        loadingImages: false,
        loadingContainers: false,

        imageFields: [
            { key: 'name', sortable: true },
            { key: 'size', sortable: true }
        ],
        containerFields: [
            { key: 'name', sortable: true },
            { key: 'image', sortable: true },
            { key: 'ports', sortable: true },
            { key: 'state', sortable: true },
            { key: 'status', sortable: true }
        ],
        
        upperbound: NaN,
        lowerbound: NaN,
        excluded: '',
        
        portState: true,
        saveState: 'normal',
        cancelState: 'normal',

        manage: window.location.origin + ':9000'
    }),
    computed: {
        empty(): boolean { return !this.lowerbound || !this.upperbound },
        cancelDisabled(): boolean { return this.empty },
        saveDisabled(): boolean { return this.empty || !state(this.validatePorts) },
        validatePorts(): string {
            let minPort = 1000;
            let maxPort = Math.pow(2, 16) - 1;
            let v = validateNumber(this.lowerbound, 'Lower bound', false, minPort, maxPort);
            if (!v) v = validateNumber(this.upperbound, 'Upper bound', false, this.lowerbound, maxPort);
            if (!v && this.excluded)
                v = this.excluded.split(',').map(p => p.trim()).reduce((acc, cur) => acc + validateNumber(Number.parseInt(cur), 'Excluded ports', false, 1, maxPort), '');
            return v;
        }
    },
    methods: {
        state,

        portInput(): void {
            this.saveState = 'normal';
            this.cancelState = 'normal';
        },

        cancelPorts(): void {
            this.cancelState = 'loading';
            const error = () => this.cancelState = 'error';
            axios.get('/api/docker/dockerConfigPorts').then(res => {
                if (!res.data) return error();
                this.excluded = '';
                this.lowerbound = Number(res.data.lowerBoundPort);
                this.upperbound = Number(res.data.upperBoundPort);
                this.cancelState = 'succes';
            }).catch(() => error());
        },
        savePorts(): void {
            this.saveState = 'loading';
            const error = () => this.saveState = 'error';
            let bounds = axios.post('/api/docker/dockerConfigPorts', { lowerBoundPort: this.lowerbound.toString(), upperBoundPort: this.upperbound.toString() });
            let exclude = axios.post('/api/docker/usedPorts', { ports: this.excluded });
            Promise.all([bounds, exclude]).then(([res1, res2]) => {
                if (res1.data.statusCode == 404 || res2.data.statusCode == 404)return error();
                this.saveState = 'succes';
                this.excluded = '';
            }).catch(() => error());
        },

        getImages(): void {
            this.loadingImages = true;
            axios.get('/api/docker/images').then(res => {
                this.loadingImages = false;
                if (!res.data) return;
                this.images = res.data.map((item: any) => ({
                    name: item.RepoTags[0],
                    size: (item.Size / Math.pow(1024, 2)).toFixed(2) + ' MB'
                }));
            }).catch(() => this.loadingImages = false);
        },
        getContainers(): void {
            this.loadingContainers = true;
            axios.get('/api/docker/containers').then(res => {
                this.loadingContainers = false;
                if (!res.data) return;
                this.containers = res.data.map((item: any) => ({
                    name: item.names[0], // TODO: slice(1)? waarom
                    image: item.image,
                    ports: ports(item.ports).reduce((acc, cur, i) => acc + (i == 0 ? '' : ', ') + cur, ''),
                    state: item.state,
                    status: item.status,
                }));
            }).catch(() => this.loadingContainers = false);
        }
    }
});
</script>

<style scoped lang="scss">
.docker {    
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: var(--double-margin);
    padding-bottom: 0;

    & > div:first-child {
        width: min(100%, var(--breakpoint-sm));
    }

    .images {
        width: min(100%, var(--breakpoint-md));
    }

    .containers {
        width: min(100%, var(--breakpoint-lg));
    }
}

.info-tooltip {
    color: var(--info);
    display: inline-block;
    margin-left: var(--margin);
}

.info {
    margin-bottom: var(--margin);
    margin-top: var(--double-margin);

    a {
        font-weight: bold;
    }
}

.ports > span, .images > label, .containers > label {
    font-weight: bold;
    font-size: var(--font-large);
    margin-bottom: var(--margin);
}

label span {
    font-size: var(--font-small);
}

.ports {
    label {
        display: block;
    }
    
    .buttons {
        display: flex;
        margin-top: var(--double-margin);

        button {
            width: 0;
            flex-grow: 1;

            &:first-of-type {
                margin-right: var(--double-margin);
            }
        }
    }
}
</style>
