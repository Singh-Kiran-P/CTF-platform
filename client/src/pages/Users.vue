<template>
    <div class=users>
        <div>
            <div class=top-table>
                <div>
                    <label for=filter-input>Filter</label>
                    <b-form-input type=text trim size=sm id=filter-input v-model="filter" @input="handleFilterChange" placeholder="Search by name" debounce="150"/>
                </div>
                <div>
                    <label for=per-page-select>Per page</label>
                    <b-form-select size=sm id=per-page-select v-model="perPage" :options="perPageOptions" @change="handlePerPageChange"/>
                </div>
                <div>
                    <label for=category-select>Category</label>
                    <b-form-select size=sm id=category-select v-model="filterCategory" :options="filterCategoryOptions" @change="handleCategoryChange"/>
                </div>
            </div>

            <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align=fill size=sm @change="handleCurrentPageChange"/>

            <div class=table>
                <label for=users-table>Users</label>
                <span class=error v-if="error">{{error}}</span>
                <b-table id=users-table striped :busy="isLoading" :items="users" :fields="users_fields" :sort-by.sync="sortBy" sort-desc.sync="sortDesc" :per-page="0" no-local-sorting @sort-changed="sortingChanged">
                    <template v-slot:cell(team)="row">
                        <router-link v-if="row.item.team" :to="'/team/' + row.item.teamUuid">{{row.item.team}}</router-link>
                        <span v-else>{{ row.item.team }}</span>
                    </template>
                    <template #table-busy>
                        <div class="text-center text-primary">
                            <b-spinner variant=primary label=Loading />
                        </div>
                    </template>
                </b-table>
                <div class=bottom-padding />
            </div>
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
        perPage: 25,
        perPageOptions: [10, 25, 50],
        filterCategoryOptions: [{ value: '', text: 'All categories'}] as any[],
        filterCategory: '',
        users_fields: [
            { key: 'name', sortable: true},
            { key: 'team', sortable: false},
            { key: 'category', sortable: false},
            { key: 'points', sortable: true},
        ] as {key: string, sortable?: boolean, label?: string}[],
        users: [] as {id: number, name: string, category: string, points: number, team: string, teamUuid: string} [],
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
    display: flex;
    justify-content: center;
    padding: var(--double-margin);
    padding-bottom: 0;

    & > div {
        width: min(100%, var(--breakpoint-lg));
    }
}

label {
    margin-right: var(--margin);
    margin-bottom: 0;
}

.top-table {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--double-margin);

    & > div {
        width: 0;
        flex-grow: 1;
        display: flex;
        padding: 0 var(--double-margin);

        &:first-of-type {
            padding-left: 0;
        }

        &:last-of-type {
            padding-right: 0;
        }

        select, input {
            width: 0;
            flex-grow: 1;
        }
    }
}

$breakpoint-sm: 576px;
@media (max-width: $breakpoint-sm) {
    .top-table {
        flex-direction: column;

        & > div {
            width: 100%;
            padding: 0;
            flex-direction: row;

            label {
                min-width: 5rem;
            }

            &:not(:last-of-type) {
                margin-bottom: var(--double-margin);
            }
        }
    }
}

.error {
    color: red;
    margin-left: var(--margin);
}

.table {
    margin-bottom: 0;
    
    label {
        font-weight: bold;
        font-size: var(--font-large);
        margin-bottom: var(--margin);
    }
}
</style>
