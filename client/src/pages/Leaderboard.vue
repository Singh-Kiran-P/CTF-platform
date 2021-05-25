<template>
    <div class="leaderboard">
        <!--<Carousel :autoplay="true" :perPage="1" :paginationEnabled="false">
            <Slide v-for="categorie in categories" :key="categorie" class=carousel-cell>
                <Scoreboard :category="categorie" :id="categorie"></Scoreboard>
            </Slide>
        </Carousel>-->
        <!--<Agile :dots="false" :nav-buttons="false" :autoplay="true" :infinite="true" :autoplay-speed="4000">
            <div v-for="categorie in categories" :key="categorie" class=carousel-cell>
            <Scoreboard :category="categorie" :id="categorie"></Scoreboard>
            </div>
        </Agile>-->
        <!--<Scoreboard v-for="categorie in categories" :key="categorie" :category="categorie" :id="categorie"></Scoreboard>-->
        <!--<flickity>
            <div v-for="categorie in categories" :key="categorie" class=carousel-cell>
                <Scoreboard :category="categorie" :id="categorie"></Scoreboard>
            </div>
        </flickity>-->
        <Slider animation="fade" class=slider>
            <SliderItem
            v-for="categorie in categories" :key="categorie" class=carousel-cell>
                <Scoreboard :category="categorie" :id="categorie"></Scoreboard>
            </SliderItem>
        </Slider>
    </div>

    <div class="chart-div" id="chart"></div>
    <div>
      <b-table hover :items="items"></b-table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Carousel, Slide } from 'vue-carousel';
import {VueAgile} from 'vue-agile';
import Flickity from "vue-flickity";
import { Slider, SliderItem } from 'vue-easy-slider'
import Scoreboard from "../components/Scoreboard.vue";

export default Vue.extend({
    name: "Leaderboard",
    components: {Scoreboard, Carousel, Slide, Agile: VueAgile, flickity: Flickity, Slider, SliderItem },
    data: ()=> ({
        categories: [] as String[]
    }),
    created() {
        this.categories.push("BACH1");
        this.categories.push("BACH2");
        this.categories.push("BACH3");
        this.categories.push("MAST1");
        this.categories.push("MAST2");

        this.$socket.$subscribe("BACH 1", (data: any) => {
      console.log(data);
    this.$socket.$subscribe("BACH 2", (data: any) => {
    });
      console.log(data);
    });
    this.$socket.$subscribe("BACH 3", (data: any) => {
      console.log(data);
    });
    this.$socket.$subscribe("MASTER 1", (data: any) => {
      console.log(data);
    });
    this.$socket.$subscribe("MASTER 2", (data: any) => {
      console.log(data);
    });
        
        },
    methods: {},
    mounted() {}
    
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.scoreboard {
    height: 100%;
}
#carousel {
    width:100%;
}
.carousel-cell {
  width: 100%;
  height: 80vh;
  margin-right: 10px;
  background: #8C8;
  border-radius: 5px;
  display: flex;
  justify-content: center;
}
.slider {
      height: 80vh !important;
}

/* cell number */
/*.carousel-cell:before {
  display: block;
  text-align: center;
  content: counter(gallery-cell);
  line-height: 200px;
  font-size: 80px;
  color: white;
}*/
</style>
