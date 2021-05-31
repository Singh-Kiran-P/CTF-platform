<template>
    <span v-if="error" class=error>{{error}}</span>
    <div v-else class=scoreboard>
        <div class=chart-div :id="category"/>
        <div class=table-div>
            <div class=table-wrapper>
                <label>Top 10</label>
                <b-table responsive sort-desc striped :busy="isLoading" :items="teams" :fields="teams_fields" sort-by=total :per-page="10" :no-local-sorting="false">
                    <template v-slot:cell(name)="row">
                        <router-link :to="'/team/' + row.item.uuid">{{row.item.name}}</router-link>
                    </template>
                    <template #table-busy>
                        <div class="text-center text-primary">
                            <b-spinner variant=primary label=Loading />
                        </div>
                    </template>
                </b-table>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

//am4core.useTheme(am4themes_animated); TODO: why use this?

type Team = {
    uuid: string;
    name: string;
    scores: { time: Date; score: number }[];
    total: number;
}

export default Vue.extend({
    name: 'Scoreboard',
    props: {
        category: String,
    },
    data: () => ({
        error: '',
        chart: (null as unknown) as am4charts.XYChart,
        scrollbar: (null as unknown) as am4charts.XYChartScrollbar,
        dateAxis: (null as unknown) as am4charts.DateAxis,
        teams: [] as Team[],
        isLoading: true,
        totalRows: 1,
        currentPage: 1,
        teams_fields: [
            { key: 'name', sortable: false },
            { key: 'total', sortable: false, label: 'Points' },
        ]
    }),
    created() {
        // TODO: solves array must start with {Data: data, score:0 } -> len[0]
        this.setListeners();
        //am4core.options.autoDispose = true;
    },
    mounted() {
        this.chart = am4core.create(this.category, am4charts.XYChart);
        this.chart.width = am4core.percent(100);
        this.chart.height = am4core.percent(100);
        let title = this.chart.titles.create();
        title.text = this.category;
        //title.fontSize = 25;
        this.chart.colors.step = 2; // Increase contrast by taking every second color
        this.chart.dateFormatter.dateFormat = 'yyyy-MM-dd HH:mm:ss';

        this.dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
        this.dateAxis.renderer.grid.template.location = 0.5;
        this.dateAxis.renderer.minGridDistance = 50;
        this.dateAxis.gridIntervals.setAll([
            { timeUnit: 'second', count: 10 },
            { timeUnit: 'minute', count: 1 },
            { timeUnit: 'minute', count: 5 },
            { timeUnit: 'minute', count: 10 },
            { timeUnit: 'hour', count: 1 },
            { timeUnit: 'day', count: 1 },
            { timeUnit: 'week', count: 1 }
        ]);

        var pointsAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
        //pointsAxis.calculateTotals = true;

        this.loadData().then(() => {
            // Create series
            for (const team of this.teams) {
                let score = 0;
                team.scores.forEach((data) => {
                    data.score += score;
                    data.time = new Date(data.time);
                });

                this.createSeries(team, pointsAxis);
            }

            this.chart.legend = new am4charts.Legend();
            this.chart.cursor = new am4charts.XYCursor();
            //this.chart.cursor.behavior = 'none';
            this.chart.cursor.events.on('selectended', this.emitRangeChanged, this);

            let scrollbarX = new am4charts.XYChartScrollbar();
            this.chart.scrollbarX = scrollbarX;
            this.chart.scrollbarX.events.on('up', this.emitRangeChanged, this);
        }).catch(() => this.error = 'Error fetching data');
    },
    methods: {
        createSeries(team: Team, valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>): void {
            var series = this.chart.series.push(new am4charts.StepLineSeries());
            series.dataFields.valueY = 'score';
            series.dataFields.dateX = 'time';
            series.strokeWidth = 2;
            series.yAxis = valueAxis;

            series.name = team.name;
            series.id = team.uuid;
            series.tooltipText = '{name}: [bold]{valueY}[/] \n Date: {time} {valueX}';
            series.tensionX = 0.8;
            // disable animations
            series.showOnInit = false;
            var interfaceColors = new am4core.InterfaceColorSet();
            var defaultBullet = series.bullets.push(new am4charts.CircleBullet());
            defaultBullet.circle.stroke = interfaceColors.getFor('background');
            defaultBullet.circle.strokeWidth = 2;
            series.data = team.scores;
        },
        loadData() {
            return new Promise<void>((resolve, reject) => {
                this.isLoading = true;
                axios.get('/api/leaderboard/getAllData/' + this.category).then(res => {
                    this.isLoading = false;
                    if (res.data.error) return reject();
                    this.teams = res.data;
                    resolve();
                }).catch(() => reject());
            });
        },
        emitRangeChanged(): void {
            this.$root.$emit('rangeChanged', this.category, this.chart.scrollbarX.range);
        },

        setListeners(): void {
            this.$socket.$subscribe(this.category, (data: any) => {
                let team = this.teams.find((team) => team.uuid == data.teamId);
                if (!team) return;
                let len = Math.max(team.scores.length - 1, 0);
                this.chart.series.getIndex(0)?.addData({ // get the serie (team serie) and add a point
                    date: new Date(data.timestamp),
                    score: team.scores[len].score + data.score,
                });
            });

            this.$root.$on('rangeChanged', (cat: string, data: any) => {
                if (this.category == cat) return;
                this.dateAxis.zoom(data);
                // this.chart.zoom(data);
                this.chart.scrollbarX.start = data.start;
                this.chart.scrollbarX.end = data.end;
            });
        }
    }
});
</script>

<style scoped lang="scss">

.error {
    color: red;
    font-weight: bold;
    font-size: var(--font-large);
    margin-top: var(--double-margin);
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
