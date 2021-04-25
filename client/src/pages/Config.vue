<template>
    <div class=config>
        <b-form @submit="onSubmit($event)">
            <b-form-group>
                <label for=competition-name>Competition name</label>
                <b-form-input type=text id=competition-name v-model="form.name" placeholder="Enter competition name" :state="state(nameFeedback)"/>
                <b-form-invalid-feedback>{{nameFeedback}}</b-form-invalid-feedback>
            </b-form-group>

            <b-form-group :state="state(categoriesFeedback)" :invalid-feedback="categoriesFeedback">
                <Collapse label="Participant categories">
                    <span>The lowest category takes priority when deciding the category of a team.</span>
                    <div class=list-item v-for="category in form.categories" :key="category.order">
                        <div class=item-content>
                            <span v-if="!category.editable" class=item-name>{{category.name}}</span>
                            <b-form-input v-else type=text v-model="category.name" placeholder="Enter category name" :state="state(categoryFeedback(category))"/>
                            <b-form-invalid-feedback>{{categoryFeedback(category)}}</b-form-invalid-feedback>
                        </div>
                        <IconButton class=info icon=pen icon2=save :toggled="category.editable" :disabled="category.editable && !state(categoryFeedback(category))" @click="editCategory(category)"/>
                        <IconButton class=primary icon=chevron-down @click="categoryDown(category)"/>
                        <IconButton class=danger icon=times @click="removeCategory(category)"/>
                    </div>
                    <div class=add-list-item>
                        <b-form-input type=text v-model="add.category" placeholder="Enter new category" :state="state(newCategoryFeedback)"/>
                        <b-button type=button variant=primary :disabled="!validNewCategory" @click="addCategory()"><font-awesome-icon icon=plus /></b-button>
                        <b-form-invalid-feedback>{{newCategoryFeedback}}</b-form-invalid-feedback>
                    </div>
                </Collapse>
            </b-form-group>

            <b-form-group :state="state(tagsFeedback)" :invalid-feedback="tagsFeedback">
                <Collapse label="Challenge tags">
                    <div class=list-item v-for="tag in form.tags" :key="tag.order">
                        <div class=item-content>
                            <template v-if="!tag.editable">
                                <span class=item-name>{{tag.name}}</span>
                                <span class=item-description>{{tag.description}}</span>
                            </template>
                            <template v-else>
                                <b-form-input type=text v-model="tag.name" placeholder="Enter tag name" :state="state(tagFeedback(tag))"/>
                                <b-form-textarea max-rows="10" v-model="tag.description" placeholder="Enter tag description" :state="state(tagFeedback(tag))"/>
                                <b-form-invalid-feedback>{{tagFeedback(tag)}}</b-form-invalid-feedback>
                            </template>
                        </div>
                        <IconButton class=info icon=pen icon2=save :toggled="tag.editable" :disabled="tag.editable && !state(tagFeedback(tag))" @click="editTag(tag)"/>
                        <IconButton class=primary icon=chevron-down @click="tagDown(tag)"/>
                        <IconButton class=danger icon=times @click="removeTag(tag)"/>
                    </div>
                    <div class=add-list-item>
                        <b-form-input type=text v-model="add.tag.name" placeholder="Enter new tag name" :state="state(newTagFeedback)"/>
                        <b-button type=button variant=primary :disabled="!validNewTag" @click="addTag()"><font-awesome-icon icon=plus /></b-button>
                        <b-form-textarea max-rows="10" v-model="add.tag.description" placeholder="Enter new tag description" :state="state(newTagFeedback)"/>
                        <b-form-invalid-feedback>{{newTagFeedback}}</b-form-invalid-feedback>
                    </div>
                </Collapse>
            </b-form-group>

            <b-form-group :state="state(pagesFeedback)" :invalid-feedback="pagesFeedback">
                <Collapse label="Available pages">
                    <span>Pages are ordered as shown below.</span>
                    <div class=list-item v-for="page in form.pages" :key="page.order">
                        <div class=item-content>
                            <span v-if="!page.editable" class=item-name>{{page.name}}</span>
                            <b-form-input v-else type=text v-model="page.name" placeholder="Enter page name" :state="state(pageFeedback(page))"/>
                            <span :class="['item-description', { marginTop: page.editable }]">
                                <span class=item-category>Path</span>
                                <span v-if="!page.editable" class=item-value>{{page.path}}</span>
                                <b-form-input v-else type=text v-model="page.path" placeholder="Enter page path" :state="state(pageFeedback(page))"/>
                            </span>
                            <span :class="['item-description', { marginTop: page.editable }]">
                                <span class=item-category>Source</span>
                                <span v-if="!page.editable" class=item-value>{{source(page)}}</span>
                                <template v-else>
                                    <b-form-file class=half accept=".html" v-model="page.html" :placeholder="htmlPlaceholder(page)" :state="state(pageFeedback(page))"/>
                                    <b-form-file class=half accept=".zip" v-model="page.zip" :placeholder="zipPlaceholder(page)" :state="state(pageFeedback(page))"/>
                                    <b-form-invalid-feedback>{{pageFeedback(page)}}</b-form-invalid-feedback>
                                    <span v-if="page.html && page.source" class=info>You are uploading a new page, any old depencies will be removed</span>
                                </template>
                            </span>
                        </div>
                        <IconButton class=info icon=pen icon2=save :toggled="page.editable" :disabled="page.editable && !state(pageFeedback(page))" @click="editPage(page)"/>
                        <IconButton class=primary icon=chevron-down @click="pageDown(page)"/>
                        <IconButton class=danger icon=times @click="removePage(page)"/>
                    </div>
                    <div class=add-list-item>
                        <b-form-input type=text v-model="add.page.name" placeholder="Enter new page name" :state="state(newPageFeedback)"/>
                        <b-button type=button variant=primary :disabled="!validNewPage" @click="addPage()"><font-awesome-icon icon=plus /></b-button>
                        <b-form-input type=text v-model="add.page.path" placeholder="Enter new page path" :state="state(newPageFeedback)"/>
                        <b-form-file class=half accept=".html" v-model="add.page.html" :placeholder="htmlPlaceholder()" :state="state(newPageFeedback)"/>
                        <b-form-file class=half accept=".zip" v-model="add.page.zip" :placeholder="zipPlaceholder()" :state="state(newPageFeedback)"/>
                        <b-form-invalid-feedback>{{newPageFeedback}}</b-form-invalid-feedback>
                        <span class=info>Page dependencies are unzipped inside the same folder as the page HTML</span>
                    </div>
                </Collapse>
            </b-form-group>

            <b-form-group :state="state(sponsorsFeedback)" :invalid-feedback="sponsorsFeedback">
                <Collapse label="Competition sponsors">
                    <div class=list-item v-for="sponsor in form.sponsors" :key="sponsor.order">
                        <div class=item-content>
                            <span v-if="!sponsor.editable" class=item-name>{{sponsor.name}}</span>
                            <b-form-input v-else type=text v-model="sponsor.name" placeholder="Enter sponsor name" :state="state(sponsorFeedback(sponsor))"/>
                            <span :class="['item-description', { marginTop: sponsor.editable }]">
                                <span class=item-category>Link</span>
                                <span v-if="!sponsor.editable" class=item-value>{{sponsor.link}}</span>
                                <b-form-input v-else type=text v-model="sponsor.link" placeholder="Enter sponsor link" :state="state(sponsorFeedback(sponsor))"/>
                            </span>
                            <span :class="['item-description', { marginTop: sponsor.editable }]">
                                <span class=item-category>Icon</span>
                                <span v-if="!sponsor.editable" class=item-value>{{icon(sponsor)}}</span>
                                <b-form-file v-else accept=".jpg, .jpeg, .png" v-model="sponsor.img" :placeholder="imgPlaceholder(sponsor)" :state="state(sponsorFeedback(sponsor))"/>
                                <b-form-invalid-feedback>{{sponsorFeedback(sponsor)}}</b-form-invalid-feedback>
                            </span>
                        </div>
                        <IconButton class=info icon=pen icon2=save :toggled="sponsor.editable" :disabled="sponsor.editable && !state(sponsorFeedback(sponsor))" @click="editSponsor(sponsor)"/>
                        <IconButton class=primary icon=chevron-down @click="sponsorDown(sponsor)"/>
                        <IconButton class=danger icon=times @click="removeSponsor(sponsor)"/>
                    </div>
                    <div class=add-list-item>
                        <b-form-input type=text v-model="add.sponsor.name" placeholder="Enter new sponsor name" :state="state(newSponsorFeedback)"/>
                        <b-button type=button variant=primary :disabled="!validNewSponsor" @click="addSponsor()"><font-awesome-icon icon=plus /></b-button>
                        <b-form-input type=text v-model="add.sponsor.link" placeholder="Enter new sponsor link" :state="state(newSponsorFeedback)"/>
                        <b-form-file accept=".jpg, .jpeg, .png" v-model="add.sponsor.img" placeholder="Upload sponsor icon" :state="state(newSponsorFeedback)"/>
                        <b-form-invalid-feedback>{{newSponsorFeedback}}</b-form-invalid-feedback>
                    </div>
                </Collapse>
            </b-form-group>

            <StatusButton type=button variant=danger :state="cancelState" normal=Cancel loading=Loading succes=Loaded :disabled="saveState == 'loading'" @click="onCancel()"/>
            <StatusButton type=submit variant=primary :state="saveState" normal=Save loading=Saving succes=Saved :disabled="!validForm || cancelState == 'loading'"/>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Collapse from '@/components/Collapse.vue';
import IconButton from '@/components/IconButton.vue';
import StatusButton from '@/components/StatusButton.vue';
import { state, validInput, validForm, validate, Category, Tag, Page, Sponsor, Form } from '@shared/validation/competitionForm';
import { serialize } from '@shared/objectFormdata';
import path from 'path';

type Edit = { editable?: boolean };

export default Vue.extend({
    name: 'Config',
    components: {
        Collapse,
        IconButton,
        StatusButton
    },
    created() {
        this.loadFormData();
    },
    data: () => ({
        form: {
            name: '',
            categories: [],
            tags: [],
            pages: [],
            sponsors: []
        } as Form & { [name in 'categories' | 'tags' | 'pages' | 'sponsors']: Edit[] },
        add: {
            category: '',
            tag: { name: '', description: '' },
            page: { name: '', path: '', html: null as File | null, zip: null as File | null },
            sponsor: { name: '', link: '', img: null as File | null }
        },
        loaded: false,
        saveState: 'normal',
        cancelState: 'normal'
    }),
    computed: {
        name(): string { return this.form.name.trim(); },
        nameFeedback(): string { return validate.name(this.name); },

        newCategory(): Category { return this.cval({ name: this.add.category, order: this.nextOrder(this.form.categories) }); },
        newTag(): Tag { return this.tval(Object.assign({}, this.add.tag, { order: this.nextOrder(this.form.tags) })); },
        newPage(): Page { return this.pval(Object.assign({}, this.add.page, { source: '', order: this.nextOrder(this.form.pages) } )); },
        newSponsor(): Sponsor { return this.sval(Object.assign({}, this.add.sponsor, { icon: '', order: this.nextOrder(this.form.sponsors) } )); },

        newCategoryFeedback(): string { return this.categoryFeedback(this.newCategory, true); },
        validNewCategory(): boolean { return validInput(this.newCategoryFeedback, this.newCategory.name); },
        newTagFeedback(): string { return this.tagFeedback(this.newTag, true); },
        validNewTag(): boolean { return validInput(this.newTagFeedback, this.newTag.name); },
        newPageFeedback(): string { return this.pageFeedback(this.newPage, true); },
        validNewPage(): boolean { return validInput(this.newPageFeedback, this.newPage.name, this.newPage.path) && this.newPage.html != null; },
        newSponsorFeedback(): string { return this.sponsorFeedback(this.newSponsor, true); },
        validNewSponsor(): boolean { return validInput(this.newSponsorFeedback, this.newSponsor.link) && this.newSponsor.img != null; },

        categoriesFeedback(): string { return validate.categories(this.formData.categories); },
        tagsFeedback(): string { return validate.tags(this.formData.tags); },
        pagesFeedback(): string { return validate.pages(this.formData.pages); },
        sponsorsFeedback(): string { return validate.sponsors(this.formData.sponsors); },

        formData(): Form { return {
            name: this.name,
            categories: this.form.categories.map(category => this.cval(category)),
            tags: this.form.tags.map(tag => this.tval(tag)),
            pages: this.form.pages.map(page => this.pval(page)),
            sponsors: this.form.sponsors.map(sponsor => this.sval(sponsor))
        } },
        validForm(): boolean { return validForm(this.formData, false); }
    },
    watch: {
        form: { deep: true, handler() {
            let state = 'normal';
            if (this.loaded) {
                state = 'succes';
                this.loaded = false;
            }
            this.saveState = state;
            this.cancelState = state;
        }}
    },
    methods: {
        state, // make the state function available in the html

        loadFormData(): void {
            this.cancelState = 'loading';
            this.add.category = '';
            this.add.tag = { name: '', description: '' };
            this.add.page = { name: '', path: '', html: null, zip: null };
            this.add.sponsor = { name: '', link: '', img: null };
            axios.get('/api/competition/data').then(res => {
                let data: Form = res.data;
                if (!validForm(data)) return this.cancelState = 'error';
                this.loaded = true;
                this.form = data;
            }).catch(() => this.cancelState = 'error');
        },
        onCancel(): void {
            this.loadFormData();
        },
        onSubmit(e: Event): void {
            e.preventDefault();
            this.saveState = 'loading';
            const error = () => this.saveState = 'error';
            axios.put('/api/competition/save', serialize(this.formData)).then(res => {
                res.data.error ? error() : this.loadFormData();
            }).catch(() => error());
        },

        nextOrder(list: any[]): number { return list.reduce((x, y) => Math.max(x, y.order), 0) + 1; },
        moveDown(list: any[], predicate: (x: any) => boolean): void {
            let i = list.findIndex(x => predicate(x));
            if (i < 0 || i >= list.length - 1) return;
            let temp = list[i];
            let set = (x: any, y: any) => Object.assign({}, y, { order: x.order });
            Vue.set(list, i, set(list[i], list[i + 1]));
            Vue.set(list, i + 1, set(list[i + 1], temp));
        },

        cval(category: Category): Category { return Object.assign({}, category, { name: category.name.trim() }); },
        categoryFeedback(category: Category, add: boolean = false): string { return validate.category(this.cval(category), this.form.categories, add); },
        categoryDown(category: Category): void { this.moveDown(this.form.categories, x => x.name == category.name); },
        removeCategory(category: Category): void { this.form.categories = this.form.categories.filter((x: Category) => x.name != category.name); },
        editCategory(category: Category & Edit): void { if (!category.editable || state(this.categoryFeedback(category))) Vue.set(category, 'editable', !category.editable); },
        addCategory(): void {
            if (!this.validNewCategory) return;
            this.form.categories.push(this.newCategory);
            this.add.category = '';
        },

        tval(tag: Tag): Tag { return Object.assign({}, tag, { name: tag.name.trim() }); },
        tagFeedback(tag: Tag, add: boolean = false): string { return validate.tag(this.tval(tag), this.formData.tags, add); },
        tagDown(tag: Tag): void { this.moveDown(this.form.tags, x => x.name == tag.name); },
        removeTag(tag: Tag): void { this.form.tags = this.form.tags.filter((x: Tag) => x.name != tag.name); },
        editTag(tag: Tag & Edit): void { if (!tag.editable || state(this.tagFeedback(tag))) Vue.set(tag, 'editable', !tag.editable); },
        addTag(): void {
            if (!this.validNewTag) return;
            this.form.tags.push(this.newTag);
            this.add.tag = { name: '', description: '' };
        },

        source(page: Page): string { return page.html ? page.html.name || '' : path.basename(page.source); },
        htmlPlaceholder(page: Page): string { return page && (page.html || page.source) ? this.source(page) : 'Upload page HTML'; },
        zipPlaceholder(page?: Page): string { return page?.zip ? page.zip.name || '' : (page?.source ? 'New page dependencies' : 'Upload page dependencies') },
        pval(page: Page): Page { return Object.assign({}, page, { name: page.name.trim(), path: page.path.trim() } )},
        pageFeedback(page: Page, add: boolean = false): string { return validate.page(this.pval(page), this.formData.pages, add); },
        pageDown(page: Page): void { this.moveDown(this.form.pages, x => x.path == page.path); },
        removePage(page: Page): void { this.form.pages = this.form.pages.filter((x: Page) => x.path != page.path); },
        editPage(page: Page & Edit): void { if (!page.editable || state(this.pageFeedback(page))) Vue.set(page, 'editable', !page.editable); },
        addPage(): void {
            if (!this.validNewPage) return;
            this.form.pages.push(this.newPage);
            this.add.page = { name: '', path: '', html: null, zip: null };
        },

        icon(sponsor: Sponsor): string { return sponsor.img ? sponsor.img.name || '' : path.basename(sponsor.icon); },
        imgPlaceholder(sponsor?: Sponsor): string { return sponsor && (sponsor.img || sponsor.icon) ? this.icon(sponsor) : 'Upload sponsor icon'; },
        sval(sponsor: Sponsor): Sponsor { return Object.assign({}, sponsor, { name: sponsor.name.trim(), link: sponsor.link.trim() }); },
        sponsorFeedback(sponsor: Sponsor, add: boolean = false): string { return validate.sponsor(this.sval(sponsor), this.formData.sponsors, add); },
        sponsorDown(sponsor: Sponsor): void { this.moveDown(this.form.sponsors, x => x.link == sponsor.link); },
        removeSponsor(sponsor: Sponsor): void { this.form.sponsors = this.form.sponsors.filter((x: Sponsor) => x.link != sponsor.link); },
        editSponsor(sponsor: Sponsor & Edit): void { if (!sponsor.editable || state(this.sponsorFeedback(sponsor))) Vue.set(sponsor, 'editable', !sponsor.editable); },
        addSponsor(): void {
            if (!this.validNewSponsor) return;
            this.form.sponsors.push(this.newSponsor);
            this.add.sponsor = { name: '', link: '', img: null };
        },
    }
});
</script>

<style scoped lang="scss">
.config {
    display: flex;
    justify-content: center;
    overflow-y: scroll !important;
    padding: var(--double-margin);
    padding-bottom: 0;
}

form {
    width: min(100%, var(--breakpoint-md));
}

form label {
    font-weight: bold;
    margin-bottom: 0;
}

span.info {
    width: 100%;
    font-size: var(--font-small);
    margin-top: var(--half-margin);
}

.list-item, .add-list-item {
    margin-top: var(--margin);
}

.list-item {
    padding: var(--margin);
    border-radius: var(--border-radius);
    background-color: var(--gray-light);
    display: flex;
}

.list-item {
    .item-content {
        margin-right: var(--margin);
        flex-grow: 1;
        width: 0;
    }
    
    .item-name {
        display: block;
        font-weight: bold;
    }
    
    .item-description {
        display: flex;
        flex-wrap: wrap;
    }
    
    .item-category {
        width: 5rem;
        color: var(--gray);
        display: inline-block;
    }
    
    .item-category ~ * {
        width: 0;
        flex-grow: 1;
    }

    .item-category ~ span:not(.item-value), .item-category ~ .invalid-feedback {
        width: 100%;
    }
    
    .item-description.marginTop {
        margin-top: var(--margin);
    }
    
    textarea {
        margin-top: var(--margin);
    }

    .b-form-file.half:first-of-type {
        margin-right: var(--margin);
    }

}

.add-list-item {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: var(--double-margin);
}

.add-list-item {
    input, textarea, .b-form-file {
        width: 100%;
        margin-top: var(--margin);
    }
    
    input:first-of-type {
        width: 0;
        flex-grow: 1;
        margin-top: 0;
        margin-right: var(--margin);
    }

    .b-form-file.half {
        width: 0;
        flex-grow: 1;
        margin-top: var(--margin);
    }

    .b-form-file.half:first-of-type {
        margin-right: var(--margin);
    }
}

$breakpoint-sm: 576px;
@media (max-width: $breakpoint-sm) {
    .list-item {
        .item-description {
            flex-wrap: wrap;
        }

        .item-category ~ *:not(span) {
            width: 100%;
        }

        .b-form-file.half:first-of-type {
            margin-right: 0;
        }

        .b-form-file.half:not(:first-of-type) {
            margin-top: var(--half-margin);
        }
    }

    .add-list-item {
        .b-form-file.half {
            width: 100%;
        }

        .b-form-file.half:first-of-type {
            margin-right: 0;
        }
    }
}

form > button {
    width: calc(50% - var(--margin) / 2);
    margin-bottom: var(--double-margin);
}

form > .btn-danger {
    margin-right: var(--margin);
}
</style>
