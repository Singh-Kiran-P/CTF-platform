<template>
    <div class="users">
        <div class=top-table>
            <b-form-group>
                <label for="filter-input">Filter</label>
                <b-form-input
                    @input="handleFilterChange"
                    size=sm
                    id="filter-input"
                    v-model="filter"
                    type="search"
                    placeholder="Search by name"
                    debounce="150"
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
                <b-form-select 
                    @change="handleCategoryChange"
                    size=sm
                    id="category-select"
                    v-model="filterCategory"
                    :options="filterCategoryOptions"
                ></b-form-select>
            </b-form-group>
        </div>

        <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
            align="fill"
            size="sm"
            class="my-0"
            @change="handleCurrentPageChange"
        ></b-pagination>

        <div class=table>
            <label for="users-table">Users</label>
            <span class=error :v-if="error != ''">{{error}}</span>
            <b-table id=users-table sticky-header striped :busy="isLoading" :items="users" :fields="users_fields" :sort-by.sync="sortBy" sort-desc.sync="sortDesc" :per-page="0" :no-local-sorting="true" @sort-changed="sortingChanged">
                <template v-slot:cell(team)="row">
                    <a v-if="row.item.team != 'None'" :href="`${home}/team/${row.item.teamUuid}`">{{ row.item.team }}</a>
                    <span v-else>{{ row.item.team }}</span>
                </template>
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
    name: 'Users',

    data: () => ({ 
        error: '',
        isLoading: true,
        filter: '',
        sortBy: 'name',
        sortDesc: false,
        totalRows: 1,
        currentPage: 1,
        perPage: 5,
        perPageOptions: [1, 2, 5, 10, 15],
        filterCategoryOptions: [{ value: '', text: 'All categories'}] as any[],
        filterCategory: '',
        users_fields: [
            { key: 'name', sortable: true},
            { key: 'team', sortable: false},
            { key: 'category', sortable: false},
            { key: 'points', sortable: true},
        ] as {key: string, sortable?: boolean, label?: string}[],
        users: [] as {id: number, name: string, category: string, points: number, team: string, teamUuid: string} [],
        home: ''
    }),
    created() {
        this.loadCategories();
        this.getData();
        this.home = window.location.origin;
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
        handleCategoryChange(val: string) {
            this.currentPage = 1;
            this.filterCategory = val;
            this.getData();
        },
        handleFilterChange(val: string) {
            this.currentPage = 1;
            this.filter = val;
            this.getData();
        },
        sortingChanged(ctx: Context) {
            this.sortBy = ctx.sortBy;
            this.sortDesc = ctx.sortDesc;
            this.getData();
        },
        getData() {
            this.isLoading = true;
            axios.get('/api/account/getUsers/', {params: {perPage: this.perPage, currentPage: this.currentPage, filter: this.filter, category: this.filterCategory, sortBy: this.sortBy, sortDirection: this.sortDesc ? 'DESC' : 'ASC'}})
            .then(response => {
                if (response.data.error) {this.isLoading=false; return this.error = response.data.error;}
                this.users = response.data.users;
                this.totalRows = response.data.amount;
                this.isLoading = false;
            }).catch((err)=>{this.isLoading = false; return this.error = err});
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
.users {    
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
@media (max-width: 775px) {
    ::v-deep .form-group div {
        display: flex;
        flex-direction: column;
    }
}

@media (max-width: 600px) {
    .top-table {
        flex-direction: column;
    }
}
.form-control {
    display: inline-block;
}
#filter-input, #category-select {
    width: 70%;
    min-width: 9rem;
}
#per-page-select {
    width: 30%;
    min-width: 3rem;
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