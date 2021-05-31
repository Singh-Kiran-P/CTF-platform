<template>
    <div class=leaderboard>
        <div class=scoreboards>
            <div class=scoreboards-container>
                <Slider animation="fade" :interval="10000" :speed="2000" stopOnHover :indicators="false" class=chart-slider>
                    <SliderItem v-for="category in categories" :key="category" class=chart-cell>
                        <Scoreboard :category="category"/>
                    </SliderItem>
                </Slider>
            </div> 
        </div>
        <div class=sponsors>
            <Carousel class=sponsor-slider autoplay autoplayHoverPause loop paginationEnabled centerMode :autoplayTimeout="5000" :speed="1000" easing="linear"
                :perPageCustom="[[1024, 4], [750, 3], [550, 2], [350, 1]]">
                    <Slide v-for="sponsor in sponsors" :key="sponsor.id" class=sponsor-cell>
                        <div class=sponsor-cell-content>
                            <a :href="sponsor.link" target="_blank" rel="noopener noreferrer">
                                <b-img :alt="sponsor.name" :src="'/api'+sponsor.icon"/>
                            </a>
                        </div>
                    </Slide>
            </Carousel>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import { Carousel, Slide } from 'vue-carousel';
import { Slider, SliderItem } from 'vue-easy-slider';
import { Sponsor } from '@shared/validation/configForm';
import Scoreboard from '@/components/Scoreboard.vue';

export default Vue.extend({
    name: 'Leaderboard',
    components: {
        Scoreboard,
        SliderItem,
        Carousel,
        Slider,
        Slide
    },
    data: () => ({
        categories: [] as String[],
        sponsors: [] as Sponsor[], 
    }),
    created() {
        this.loadCategories();
        this.loadSponsors();
    },
    methods: {
        loadCategories(): void {
            axios.get('/api/competition/categories').then(res => {
                if (res.data.error) return console.log(res.data.error); // TODO: this.error = res.data.error;
                this.categories = this.categories.concat(res.data);
            });
        },
        loadSponsors() {
            axios.get('/api/leaderboard/sponsors').then(res => {
                if (res.data.error) return console.log(res.data.error); // TODO: this.error = res.data.error;
                this.sponsors = res.data.sponsors;
                console.log(this.sponsors);
            });
        }
    }
});
</script>

<style scoped lang="scss">



/*TODO: Align items vertically when smaller then 750px;*/
.scoreboards {
    height: 85%;
    display: flex;
    justify-content: center;
}
.scoreboards-container {
    width: 100%;
}
.chart-slider {
    width: 100% !important;
    height: 100% !important;
}
.chart-cell {
    display: flex;
    justify-content: center;
    width: 100%;
}
.scoreboard {
    width: 95%;
}
.sponsor-slider{
    width:100%;
    height: 100%;
    display: flex;
    justify-content: center;
}
.sponsor-cell {
    height: 12vh;
    display: flex;
    justify-content: center;
}
.sponsor-cell-content{
    margin: 0px var(--margin);
    background: var(--white-c);
    border-radius: 20px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.sponsor-cell-content a {
    display: flex;
    justify-content: center;
    align-items: center;
}
img {
    flex-shrink:0;
    -webkit-flex-shrink: 0;
    max-width:70%;
    max-height:90%;
}
.lists {
    width: 35%;
}
.sponsors{
    height: 15%;
    display: flex;
    justify-content: center;
}
body {
    overflow-y: scroll
}
@media (max-width: 800px) {
  .scoreboards {
    height: 1350px;
  }
  .sponsors{
    margin-right:17px;
    position: fixed;
    bottom: 0;
    z-index: 1000;
  }
}
@media (max-width: 400px) { /*mobile*/
    .scoreboards {
        height: 1300px;
    }
    .sponsors{
        margin-right:0px;
    }
}
</style>
