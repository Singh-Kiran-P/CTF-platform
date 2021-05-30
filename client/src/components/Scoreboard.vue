<template>
    <div class="scoreboard">
        <div class="chart-div" :id="this.category"></div>
        <div class="table-div">
            <div class="table-wrapper">
                <label for="teams-table">Top 10</label>
                <span class="error" v-if="error != ''">{{ error }}</span>
                <b-table
                    id="teams-table"
                    responsive
                    striped
                    :busy="isLoading"
                    :items="teams"
                    :fields="teams_fields"
                    :sort-by="'total'"
                    :sort-desc="true"
                    :per-page="10"
                    :no-local-sorting="false"
                    variant="dark"
                >
                    <template v-slot:cell(name)="row">
                        <router-link :to="'/team/' + row.item.uuid">{{
                            row.item.name
                        }}</router-link>
                    </template>
                    <template #table-busy>
                        <div class="text-center text-primary my-2">
                            <b-spinner
                                variant="primary"
                                label="Spinning"
                            ></b-spinner>
                        </div>
                    </template>
                </b-table>
            </div>
        </div>
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
    scores: { time: Date; score: number }[];
    total: number;
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
        scrollbar: (null as unknown) as am4charts.XYChartScrollbar,
        dateAxis: (null as unknown) as am4charts.DateAxis,
        error: "",
        isLoading: true,
        totalRows: 1,
        currentPage: 1,
        teams_fields: [
            { key: "name", sortable: false },
            { key: "total", sortable: false, label: "Points" },
        ] as { key: string; sortable?: boolean; label?: string }[],
    }),
    created() {
        //TODO: solves array must start with {Data: data, score:0 } -> len[0] line 39
        this.$socket.$subscribe(this.category, (data: any) => {
            // console.log(data);

            let team = this.teams.find((team) => team.uuid == data.teamId);
            if (team) {
                let len = team.scores.length;
                if (team.scores.length != 0) len = team.scores.length - 1;
                // get the serie (team serie) and add a point
                this.chart.series.getIndex(0)?.addData({
                    date: data.date,
                    score: team.scores[len].score + data.score,
                });
            }
        });

        am4core.options.autoDispose = true;
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
        },
        async loadData() {
            this.isLoading = true;
            await axios.get("/api/leaderboard/getAllData").then((response) => {
                this.teams = response.data;
            });
            this.isLoading = false;
        },
        emitRangeChanged() {
            this.$root.$emit(
                "rangeChanged",
                this.category,
                this.chart.scrollbarX.range
            );
        },
    },
    async mounted() {
        this.$root.$on("rangeChanged", (cat: string, data: any) => {
            if (this.category == cat) return;
            this.dateAxis.zoom(data);
            //this.chart.zoom(data);
            this.chart.scrollbarX.start = data.start;
            this.chart.scrollbarX.end = data.end;
            return;
        });
        this.chart = am4core.create(this.category, am4charts.XYChart);
        this.chart.width = am4core.percent(100);
        this.chart.height = am4core.percent(100);
        let title = this.chart.titles.create();
        title.text = this.category;
        //title.fontSize = 25;
        this.chart.colors.step = 2; // Increase contrast by taking every second color
        this.chart.dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss";

        // Create X axis
        this.dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
        this.dateAxis.renderer.grid.template.location = 0.5;
        this.dateAxis.renderer.minGridDistance = 50;
        this.dateAxis.gridIntervals.setAll([
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
        await this.loadData();

        // Create series
        for (const team of this.teams) {
            let score = 0;
            team.scores.forEach((data) => {

                data.score += score;
                // console.log(data.date);
                data.time = data.time;
                console.log(data);
            });

            this.createSeries(team, pointsAxis);
        }

        // Add legend
        this.chart.legend = new am4charts.Legend();

        // Add cursor
        this.chart.cursor = new am4charts.XYCursor();
        //this.chart.cursor.behavior = "none";
        this.chart.cursor.events.on("selectended", this.emitRangeChanged, this);

        // generate scrollbar
        let scrollbarX = new am4charts.XYChartScrollbar();
        this.chart.scrollbarX = scrollbarX;
        this.chart.scrollbarX.events.on("up", this.emitRangeChanged, this);
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
    height: calc(100%);
    display: flex;
    flex-direction: row;
}
.chart-div {
    text-align: center;
    width: 65%;
    height: 100%;
}
.table-div {
    margin-top: var(--margin);
    width: 35%;
    display: flex;
    justify-content: center;
}
.table-wrapper {
    text-align: center;
    width: 95%;
    height: 90%;
}
.table-wrapper label {
    font-size: 1.4rem;
}
@media (max-width: 800px) {
    .scoreboard {
        flex-direction: column;
    }
    .chart-div {
        width: 94%;
        height: 600px;
    }
    .table-div {
        width: 100%;
        height: 600px;
    }
}
</style>
