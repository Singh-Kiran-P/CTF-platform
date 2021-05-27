<template>
    <div class="scoreboard">
        <div class="chart-div" :id="this.id"></div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

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
        id: String,
    },
    data: () => ({
        chart: (null as unknown) as am4charts.XYChart,
        teams: [] as Team[],
    }),
    created() {},
    methods: {
        createSeries(
            field: string,
            name: string,
            valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>
        ) {
            var series = this.chart.series.push(new am4charts.StepLineSeries());
            series.dataFields.valueY = field;
            series.dataFields.dateX = "date";
            series.strokeWidth = 2;
            series.yAxis = valueAxis;
            series.name = name;
            series.tooltipText = "{name}: [bold]{valueY}[/]";
            series.tensionX = 0.8;
            series.showOnInit = true;
            var interfaceColors = new am4core.InterfaceColorSet();
            var defaultBullet = series.bullets.push(
                new am4charts.CircleBullet()
            );
            defaultBullet.circle.stroke = interfaceColors.getFor("background");
            defaultBullet.circle.strokeWidth = 2;
        },
        generateChartData() {
            var chartData = [];
            var firstDate = new Date();
            firstDate.setDate(firstDate.getDate());
            firstDate.setHours(0, 0, 0, 0);

            var team1_points = 0;
            var team2_points = 0;
            var team3_points = 0;

            for (var i = 0; i < 14; i++) {
                // we create date objects here. In your data, you can have date strings
                // and then set format of your dates using chart.dataDateFormat property,
                // however when possible, use date objects, as this will speed up chart rendering.
                var newDate = new Date(firstDate);
                newDate.setDate(newDate.getDate() + i);

                team1_points += (i + 5) * 10;
                team2_points += (i + 23) * 10;
                team3_points += i * 10;

                chartData.push({
                    // Save date and points per team on this date
                    date: newDate,
                    team1: team1_points,
                    team2: team2_points,
                    team3: team3_points,
                });
            }
            return chartData;
        },
        loadData() {
            //TODO: write backend route for data and show error
            // axios.get("/api/lksdgs/slkfj").then((response) => {
            //     if (response.data.error)
            //         return console.log(response.data.error); //this.error = response.data.error;
            //     this.teams = this.teams.concat(response.data);
            // });

            var firstDate2 = new Date();
            firstDate2.setHours(16, 10, 0, 0);

            var firstDate = new Date();

            firstDate.setHours(16, 0, 0, 0);
            this.teams.push({
                uuid: "sdfds",
                name: "dsfdsf",
                scores: [
                    { date: firstDate, score: 0 },
                    { date: firstDate2, score: 26 },
                ],
            });

            firstDate2.setDate(firstDate2.getDate());
            firstDate2.setHours(17, 30, 0, 0);
            this.teams.push({
                uuid: "sdsqdfds",
                name: "dsfqsddsf",
                scores: [{ date: firstDate, score: 0 }],
            });
            firstDate2.setHours(18, 30, 30, 0);
            this.teams[1].scores.push({ date: firstDate2, score: 36 });
            firstDate2.setHours(19, 40, 40, 0);
            this.teams[1].scores.push({ date: firstDate2, score: 50 });
        },
    },
    mounted() {
        this.chart = am4core.create(this.id, am4charts.XYChart);
        this.chart.width = am4core.percent(100);
        this.chart.height = am4core.percent(100);
        let title = this.chart.titles.create();
        title.text = this.category;
        //title.fontSize = 25;
        this.chart.colors.step = 2; // Increase contrast by taking every second color

        // Add data
        this.loadData();
        this.chart.data;

        // Create X axis
        var dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.minGridDistance = 50;
        dateAxis.adjustLabelPrecision = false;
        // Create Y axis
        var pointsAxis = this.chart.yAxes.push(new am4charts.ValueAxis());

        // Create series
        for (const team of this.teams) {
            var firstDate = new Date();

            this.createSeries(team.uuid, team.name, pointsAxis);

            var series1 = this.chart.series.push(
                new am4charts.StepLineSeries()
            );
            series1.dataFields.valueY = "score";
            series1.dataFields.dateX = "date";
            series1.strokeWidth = 3;
            series1.tensionX = 0.8;
            series1.bullets.push(new am4charts.CircleBullet());
            series1.data = team.scores;
        }
        // Add legend
        this.chart.legend = new am4charts.Legend();

        // Add cursor
        this.chart.cursor = new am4charts.XYCursor();

        // generate scrollbar
        let scrollbarX = new am4charts.XYChartScrollbar();
        this.chart.scrollbarX = scrollbarX;
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
