<template>
    <div class="leaderboard">
        <div class=scoreboards>
            <div class=charts>
                <Slider animation="fade" :interval="10000" :speed="2000" :stopOnHover="true" :indicators="false" class="chart-slider">
                    <SliderItem v-for="categorie in categories" :key="categorie" class="chart-cell">
                        <Scoreboard :category="categorie"></Scoreboard>
                        <!--list-->
                    </SliderItem>
                </Slider>
            </div>
            <div class=lists>
            </div>   
        </div>
        <div class=sponsors>
            <Carousel :autoplay="true" :autoplayHoverPause="true" :loop="true" :paginationEnabled="false" :perPageCustom="[[1024, 4],[750,3],[550, 2], [350,1]]" easing="linear" :autoplayTimeout="5000" :speed="1000" :centerMode="true" class=sponsor-slider>
                    <Slide v-for="i in 2" :key="i" class=sponsor-cell>
                        <div class=sponsor-cell-content>
                            <a href="https://www.w3schools.com" target="_blank" rel="noopener noreferrer">
                            <img alt="W3Schools" src="/api/sponsor-image/../rounds/logo_cegeka_w.png">
                            </a>
                        </div>
                    </Slide>
            </Carousel>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import { Carousel, Slide } from "vue-carousel";
import { Slider, SliderItem } from "vue-easy-slider";
import Scoreboard from "../components/Scoreboard.vue";

declare interface sponsor {icon: string, id:number, name: string, link: string, order:number};

export default Vue.extend({
    name: "Leaderboard",
    components: {
        Scoreboard,
        Slider,
        SliderItem,
        Carousel,
        Slide
    },
    data: () => ({
        categories: [] as String[],
        sponsors: [] as sponsor[], 
    }),
    created() {
        this.loadCategories();
        this.loadSponsors();

        // this.$socket.$subscribe("BACH 1", (data: any) => {
        //     console.log(data);
        //     this.$socket.$subscribe("BACH 2", (data: any) => {});
        // });
        // this.$socket.$subscribe("BACH 3", (data: any) => {
        //     console.log(data);
        // });
        // this.$socket.$subscribe("MASTER 1", (data: any) => {
        //     console.log(data);
        // });
        // this.$socket.$subscribe("MASTER 2", (data: any) => {
        //     console.log(data);
        // });
    },
    methods: {
        //TODO: show errors using kirans dialog
        loadCategories(): void {
            axios.get("/api/competition/categories").then((response) => {
                if (response.data.error)
                    return console.log(response.data.error); //this.error = response.data.error;
                this.categories = this.categories.concat(response.data);
            });
        },
        loadSponsors() {
            axios.get("/api/leaderboard/sponsors").then((response)=> {
                if (response.data.error)
                    return console.log(response.data.error); //this.error = response.data.error;
                this.sponsors = response.data.sponsors;
            });
        }
    },
    mounted() {},
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/*TODO: Align items vertically when smaller then 750px;*/
.scoreboards {
    height: 85%;
    display: flex;
    justify-content: center;
}
.charts {
    width: 65%;
}
.chart-slider {
    width: 95% !important;
    height: 100% !important;
}
.chart-cell {
    background: var(--primary);
    display: flex;
    justify-content: center;
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
    margin: var(--margin);
    background: chocolate;
    border-radius: 15px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.sponsor-cell-content a {
    max-width:100%;
    max-height:100%;
}
img {
    width: 100%;
    max-height: 100%;
}
.lists {
    width: 35%;
}
.sponsors{
    background: var(--primary);
    width: 100%;
    height: 15%;
    display: flex;
    justify-content: center;
}
</style>
