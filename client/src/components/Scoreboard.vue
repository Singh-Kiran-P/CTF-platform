<template>
    <div class="scoreboard">
        <div class="chart-div" :id="this.category"></div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { length } from "@amcharts/amcharts4/.internal/core/utils/Iterator";

am4core.useTheme(am4themes_animated);

declare interface Team {
    uuid: string;
    name: string;
    scores: { date: Date; score: number }[];
}

export default Vue.extend({
    name: "Scoreboard",
    components: {},
    props: {
        category: String,
    },
    data: () => ({
        chart: (null as unknown) as am4charts.XYChart,
        teams: [] as Team[],
    }),
    created() {
        this.$socket.$subscribe("BACH 1", (data: any) => {
            var newDate1 = new Date("2019-12-31T05:36");
            console.log(newDate1);

            let len = this.teams[0].scores.length - 1;
            // console.log(this.teams[0].scores[len].date);
            // console.log(this.teams[0].scores[len].score);

            // this.teams[0].scores.push({
            //     date: this.teams[0].scores[len].date,
            //     score: this.teams[0].scores[len].score + 10,
            // });
            // console.log("oke");

            // get the serie (team serie) and add a point
            this.chart.series.getIndex(0)?.addData({
                date: newDate1,
                score: this.teams[0].scores[len].score + 100,
            });

            // console.log(this.chart.series.getIndex(0)?.dataChangeUpdate());
            // console.log(this.chart.series.getIndex(0)?.data);
        });
        this.$socket.$subscribe("BACH 3", (data: any) => {
            var newDate1 = new Date("2019-12-31T05:30:00.000Z");

            let len = this.teams[0].scores.length - 1;

            this.teams[0].scores[len] = {
                date: this.teams[0].scores[len].date,
                score: this.teams[0].scores[len].score + 10,
            };
            console.log("oke");
        });
        this.$socket.$subscribe("MASTER 1", (data: any) => {
            var newDate1 = new Date("2019-12-13T08:08:0.838Z");

            let len = this.teams[0].scores.length - 1;

            this.teams[0].scores[len] = {
                date: this.teams[0].scores[len].date,
                score: this.teams[0].scores[len].score + 10,
            };
            console.log("oke");
        });
        this.$socket.$subscribe("MASTER 2", (data: any) => {
            var newDate1 = new Date("2019-12-13T08:08:0.838Z");

            let len = this.teams[0].scores.length - 1;

            this.teams[0].scores[len] = {
                date: this.teams[0].scores[len].date,
                score: this.teams[0].scores[len].score + 10,
            };
            console.log("oke");
        });
    },
    methods: {
        createSeries(
            team: Team,
            valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>
        ) {
            var series = this.chart.series.push(new am4charts.StepLineSeries());
            series.dataFields.valueY = "score";
            series.dataFields.dateX = "date";
            series.strokeWidth = 2;
            series.yAxis = valueAxis;
            console.log(team.name);

            series.name = team.name;
            series.id = team.uuid;
            series.tooltipText =
                "{name}: [bold]{valueY}[/] \n Date: {date} {valueX}";
            series.tensionX = 0.8;
            series.showOnInit = true;
            var interfaceColors = new am4core.InterfaceColorSet();
            var defaultBullet = series.bullets.push(
                new am4charts.CircleBullet()
            );
            defaultBullet.circle.stroke = interfaceColors.getFor("background");
            defaultBullet.circle.strokeWidth = 2;
            series.data = team.scores;
            //series.dataFields.valueYShow = "totalPercent";
            //series.groupFields.valueY = "average";
        },
        async loadData() {
            // var team1_points = 0;
            // var team2_points = 0;
            // var team3_points = 0;
            var newDate1 = new Date("2021-05-27T09:08:19.838Z");

            this.teams.push({
                uuid: "sdfds",
                name: "dsfdsf",
                scores: [{ date: newDate1, score: 3 }],
            });

            // this.teams.push({
            //     uuid: "sdsqdfds",
            //     name: "dsfqsddsf",
            //     scores: [],
            // });
            // this.teams.push({
            //     uuid: "sdfddsqdfds",
            //     name: "dsfqdfddsddsf",
            //     scores: [],
            // });

            // for (var day = 0; day < 1; day++) {
            //     for (var hour = 0; hour < 8; hour++) {
            //         for (var minute=0; minute < 60; minute+=30) {
            //             team1_points += (day + 24*hour + 60*minute + 5)*2;
            //             team2_points += (day + 24*hour + 60*minute + 3)*1.5;
            //             team3_points += (day + 24*hour + 60*minute + 3)*3;

            //             var newDate1 = new Date(2020, 0, day, hour, Math.floor(Math.random() * ((minute+4) - minute + 1) + minute), 0);
            //             var newDate2 = new Date(2020, 0, day, hour, Math.floor(Math.random() * ((minute+4) - minute + 1) + minute), 0);
            //             var newDate3 = new Date(2020, 0, day, hour, Math.floor(Math.random() * ((minute+4) - minute + 1) + minute), 0);
            //             this.teams[0].scores.push({
            //                 date: newDate1,
            //                 score: team1_points,
            //             });
            //             this.teams[1].scores.push({
            //                 date: newDate2,
            //                 score: team2_points,
            //             });
            //             this.teams[2].scores.push({
            //                 date: newDate3,
            //                 score: team3_points,
            //             });
            //         }
            //     }
            // }
            await axios.get("/api/leaderboard/getAllData").then((response) => {
                this.teams = response.data;
            });
            // console.log(this.teams);
            // console.log(this.teams[0].scores[0].date);
            // console.log(this.teams[1].scores[0].date);
        },
    },
    async mounted() {
        this.chart = am4core.create(this.category, am4charts.XYChart);
        this.chart.width = am4core.percent(100);
        this.chart.height = am4core.percent(100);
        let title = this.chart.titles.create();
        title.text = this.category;
        //title.fontSize = 25;
        this.chart.colors.step = 2; // Increase contrast by taking every second color
        this.chart.dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss";

        // Create X axis
        var dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0.5;
        dateAxis.renderer.minGridDistance = 50;
        dateAxis.gridIntervals.setAll([
            { timeUnit: "second", count: 1 },
            { timeUnit: "second", count: 5 },
            { timeUnit: "second", count: 10 },
            { timeUnit: "second", count: 30 },
            { timeUnit: "minute", count: 1 },
            { timeUnit: "minute", count: 5 },
            { timeUnit: "minute", count: 10 },
            { timeUnit: "hour", count: 1 },
            { timeUnit: "day", count: 1 },
            { timeUnit: "week", count: 1 },
        ]);
        //dateAxis.groupData = true;
        /*dateAxis.groupIntervals.setAll([{ timeUnit: "minute", count: 1 },
                                        { timeUnit: "minute", count: 5 },
                                        { timeUnit: "minute", count: 10 },
                                        { timeUnit: "hour", count: 1 },
                                        { timeUnit: "day", count: 1 },
                                        { timeUnit: "week", count: 1 },]);
        dateAxis.groupCount = 31;*/

        // Create Y axis
        var pointsAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
        //pointsAxis.calculateTotals = true;

        // load data
        await axios.get("/api/leaderboard/getAllData").then((response) => {
            this.teams = response.data;
        });

        // Create series
        for (const team of this.teams) {
            let score = 0;
            team.scores.forEach((data) => {
                data.score += score;
                // console.log(data.date);
                data.date = new Date(data.date);
            });

            this.createSeries(team, pointsAxis);
        }

        // Add legend
        this.chart.legend = new am4charts.Legend();

        // Add cursor
        this.chart.cursor = new am4charts.XYCursor();

        // generate scrollbar
        let scrollbarX = new am4charts.XYChartScrollbar();
        this.chart.scrollbarX = scrollbarX;
        this.$root.$on('lol', (data: any) => {
                console.log(data);
            });        
    },

    beforeDestroy() {
        if (this.chart) {
            this.chart.dispose();
        }
    },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
        "Segoe UI Symbol";
}
.scoreboard {
    text-align: center;
    height: calc(100%);
    width: 100%;
}
.chart-div {
    width: 100%;
    height: 100%;
    margin: auto;
}
</style>
