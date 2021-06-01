<template>
    <span v-if="error" class=error>Something went wrong</span>
    <Loading v-else-if="loading"/>
    <div v-else class=leaderboard>
        <div>
            <div class=scoreboards>
                <Slider animation="fade" :interval="10000" :speed="1000" stopOnHover :indicators="false">
                    <SliderItem v-for="category in categories" :key="category">
                        <Scoreboard :category="category"/>
                    </SliderItem>
                </Slider>
            </div>
            <div class=sponsors>
                <Carousel autoplay loop centerMode :paginationEnabled="false" :autoplayTimeout="10000" :speed="1000" easing=linear :perPageCustom="perPageCustom">
                    <Slide v-for="sponsor in sponsors" :key="sponsor.id" class=sponsor>
                        <div class=list-item>
                            <a :href="sponsor.link" target="_blank" rel="noopener noreferrer">
                                <b-img :alt="sponsor.name" :src="'/api' + sponsor.icon"/>
                            </a>
                        </div>
                    </Slide>
                </Carousel>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Loading from '@/components/Loading.vue';
import { Carousel, Slide } from 'vue-carousel';
import { Slider, SliderItem } from 'vue-easy-slider';
import { Sponsor } from '@shared/validation/configForm';
import Scoreboard from '@/components/Scoreboard.vue';

export default Vue.extend({
    name: 'Leaderboard',
    components: {
        Loading,
        Scoreboard,
        SliderItem,
        Carousel,
        Slider,
        Slide
    },
    data: () => ({
        error: false,
        categories: [] as String[],
        sponsors: [] as Sponsor[]
    }),
    created() {
        const error = () => this.error = true;

        axios.get('/api/competition/categories').then(res => {
            if (res.data.error) return error();
            this.categories = this.categories.concat(res.data);
        }).catch(() => error());

        axios.get('/api/leaderboard/sponsors').then(res => {
            if (res.data.error) return error();
            this.sponsors = res.data.sponsors;
        }).catch(() => error());
    },
    computed: {
        loading(): boolean { return this.categories.length == 0; },
        perPageCustom() { return [...Array(6).keys()].map(n => [300 * (n == 0 ? 0.5 : n), Math.max(n, 1)]); }
    }
});
</script>

<style scoped lang="scss">
@import '@/assets/css/listform.scss';

.error {
    width: 100%;
    display: block;
    text-align: center;
    margin-top: var(--double-margin);
}

.leaderboard {
    display: flex;
    justify-content: center;
    overflow-y: scroll !important;
    padding: var(--double-margin);
    padding-bottom: 0;

    & > div {
        width: min(100%, 1600px);
        flex-direction: column;
        display: flex;
    }

    .scoreboards {
        height: 0;
        flex-grow: 1;

        .slider {
            height: 100% !important;
        }
    }

    .sponsors {
        padding: var(--double-margin) 0;

        .list-item {
            padding: 0;
            margin: 0 var(--double-margin);

            &:hover {
                background-color: var(--gray-lightest-c);
            }

            a {
                width: 100%;
                display: flex;
                justify-content: center;
                padding: var(--double-margin);

                img {
                    height: 50px;
                    max-width: 100%;
                }
            }
        }
    }
}
</style>
