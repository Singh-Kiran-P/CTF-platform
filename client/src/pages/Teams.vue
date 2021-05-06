<template>
    <div class="teams">
        <div class=top-table>
            <b-form-group>
                <label for="filter-input">Filter</label>
                <b-form-input 
                    size=sm
                    id="filter-input"
                    v-model="filter"
                    type="search"
                    placeholder="Search by name"
                    debounce="150"
                    @input="handleFilterChange"
                    trim
                ></b-form-input>
            </b-form-group>
            <b-form-group>
                <label for="per-page-select">Per page</label>
                <b-form-select 
                    @change="handlePerPageChange"
                    size=sm
                    id="per-page-select"
                    v-model="perPage"
                    :options="perPageOptions"
                ></b-form-select>
            </b-form-group>
            <b-form-group>
                <label for="category-select">Category</label>
                <b-form-select size=sm
                    id="category-select"
                    v-model="filterCategory"
                    :options="filterCategoryOptions"
                ></b-form-select>
            </b-form-group>
        </div>

        <b-pagination
            v-if="totalRows>0"
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
            align="fill"
            size="sm"
            class="my-0"
            @change="handleCurrentPageChange"
        ></b-pagination>

        <div class=table>
            <label for="teams-table">Teams</label>
            <span class=error :v-if="error != ''">{{error}}</span>
            <b-table id=teams-table sticky-header striped :busy="isLoading" :items="teams" :fields="teams_fields" :per-page="0" :filter="filter">
                <!--<template v-slot:cell(name)="row">
                    <a :href="`#${row.value.replace(/[^a-z]+/i,'-').toLowerCase()}`">{{ row.value }}</a>
                </template>-->
                <template #table-busy>
                    <div class="text-center text-primary my-2">
                        <b-spinner variant="primary" label="Spinning"></b-spinner>
                    </div>
                </template>
            </b-table>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

type Context = {currentPage: number, perPage: number, filter: string, sortBy: string, sortDesc: boolean};

export default Vue.extend({
    name: 'Teams',

    data: () => ({ 
        error: '',
        isLoading: true,
        no_provider_paging: false,
        filter: '',
        totalRows: 1,
        currentPage: 1,
        perPage: 1,
        perPageOptions: [1, 2, 5, 10, 15],
        filterCategoryOptions: [{ value: '', text: 'Select category', disabled: true }] as any[],
        filterCategory: '',
        teams_fields: [
            { key: 'name', sortable: true},
            { key: 'category', sortable: true},
            { key: 'points', sortable: true},
        ] as {key: string, sortable?: boolean, label?: string}[],
        teams: [] as {uuid: string, name: string, category: string, points: number} []
    }),
    created() {
        this.loadCategories();
        this.getData();
    },
    computed: {
    },
    methods: {
        handleCurrentPageChange(val: number) {
            this.currentPage = val;
            this.getData();
        },
        handlePerPageChange(val: number) {
            this.perPage = val;
            this.currentPage = 1;
            this.getData();
        },
        handleFilterChange(val: string) {
            this.currentPage = 1;
            this.filter = val;
            this.getData();
        },
        getData() {
            this.isLoading = true;
            axios.get('/api/team/getTeams/', {params: {perPage: this.perPage, currentPage: this.currentPage, filter: this.filter}})
            .then(response => {
                this.teams = response.data.teams;
                this.totalRows = response.data.amount;
                this.isLoading = false;
            }).catch((err)=>{this.isLoading = false; return this.error = err});
        },
        sortingChanged(ctx: Context) {
            // ctx.sortBy   ==> Field key for sorting by (or null for no sorting)
            // ctx.sortDesc ==> true if sorting descending, false otherwise
        },
        loadCategories(): void {
            axios.get('/api/competition/categories').then(response => {
                if (response.data.error) return this.error = response.data.error;
                this.filterCategoryOptions = this.filterCategoryOptions.concat(response.data);
            });
        }
    }
});
</script>

<style scoped lang="scss">
.teams {    
    padding: var(--double-margin);
    width: min(100%, 750px);
    margin: auto;
    /*display: flex;
    flex-direction: column;*/
}
.table {
    margin-top: 1rem;
}
.top-table {
    display: flex;
    flex-direction: row;
}
.form-group {
    width: 33%;
}
#filter-input, #category-select {
    width: 70%;
}
#per-page-select {
    width: 30%;
}
.error {
    color: red;
    margin-left: var(--margin);
}
table {
    border: 1px solid lightgray;
}
.top-table label {
    font-size: 1rem;
    font-weight: normal;
}
label {
    font-size: 1rem;
    font-weight: bold;
    margin-right: var(--margin);
}
</style>
