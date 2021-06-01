<template>
    <span v-if="error" class=error>Something went wrong</span>
    <div v-else class=scoreboard>
        <div class=chart>
            <span>{{category}}</span>
            <div :id="category"/>
        </div>
        <div class=table>
            <span>Leaderboard</span>
            <b-table striped sort-desc :busy="isLoading" :items="teams" :fields="teams_fields" sort-by=total :no-local-sorting="false">
                <template v-slot:cell(name)="row">
                    <router-link :to="'/team/' + row.item.uuid" class=team-name>{{row.item.name}}</router-link>
                </template>
                <template v-slot:cell(total)="row">
                    <span class=team-points>{{row.item.total}}</span>
                </template>
                <template #table-busy>
                    <div class="text-center text-primary">
                        <b-spinner variant=primary label=Loading />
                    </div>
                </template>
            </b-table>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

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
        error: false,
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
        this.$socket.$subscribe(this.category, (data: any) => {
            let team = this.teams.find((team) => team.uuid == data.teamId);
            if (!team) return;
            let len = Math.max(team.scores.length - 1, 0);
            this.chart.series.getIndex(0)?.addData({
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
    },
    mounted() {
        this.chart = am4core.create(this.category, am4charts.XYChart);
        this.chart.width = am4core.percent(100);
        this.chart.height = am4core.percent(100);
        this.chart.colors.step = 2; // increase contrast by taking every second color
        this.chart.dateFormatter.dateFormat = 'yyyy-MM-dd HH:mm:ss';

        this.dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
        this.dateAxis.gridIntervals.setAll([
            { timeUnit: "millisecond", count: 1 },
            { timeUnit: "millisecond", count: 5 },
            { timeUnit: "millisecond", count: 10 },
            { timeUnit: "millisecond", count: 50 },
            { timeUnit: "millisecond", count: 100 },
            { timeUnit: "millisecond", count: 500 },
            { timeUnit: "second", count: 1 },
            { timeUnit: "second", count: 5 },
            { timeUnit: "second", count: 10 },
            { timeUnit: "second", count: 30 },
            { timeUnit: "minute", count: 1 },
            { timeUnit: "minute", count: 5 },
            { timeUnit: "minute", count: 10 },
            { timeUnit: "minute", count: 30 },
            { timeUnit: "hour", count: 1 },
            { timeUnit: "hour", count: 2 },
            { timeUnit: "hour", count: 3 },
            { timeUnit: "hour", count: 5 },
            { timeUnit: "hour", count: 6 },
            { timeUnit: "hour", count: 9 },
            { timeUnit: "hour", count: 12 },
            { timeUnit: "day", count: 1 },
            { timeUnit: "day", count: 2 },
            { timeUnit: "day", count: 3 },
            { timeUnit: "day", count: 4 },
            { timeUnit: "day", count: 5 },
            { timeUnit: "week", count: 1 }
        ]);

        var pointsAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
        
        this.loadData().then(() => {
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
            this.chart.cursor.events.on('selectended', this.emitRangeChanged, this);

            let scrollbarX = new am4charts.XYChartScrollbar();
            this.chart.scrollbarX = scrollbarX;
            this.chart.scrollbarX.events.on('up', this.emitRangeChanged, this);
        }).catch(() => this.error = true);
    },
    methods: {
        createSeries(team: Team, valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>): void {
            var series = this.chart.series.push(new am4charts.StepLineSeries());
            series.dataFields.valueY = 'score';
            series.dataFields.dateX = 'time';
            series.strokeWidth = 3;
            series.yAxis = valueAxis;

            series.name = team.name;
            series.id = team.uuid;
            series.tooltipText = '{name}: [bold]{valueY}[/] \n Date: {time} {valueX}';
            series.tensionX = 0.8;
            series.showOnInit = false;
            var interfaceColors = new am4core.InterfaceColorSet();
            var defaultBullet = series.bullets.push(new am4charts.CircleBullet());
            defaultBullet.circle.stroke = interfaceColors.getFor('background');
            defaultBullet.circle.strokeWidth = 1;
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
        }
    }
});
</script>

<style scoped lang="scss">

.error {
    width: 100%;
    display: block;
    text-align: center;
    margin-top: 0 !important;
}

.dark-mode .chart > div {
    filter: invert(1);
}

.scoreboard {
    height: 100%;
    display: flex;

    .chart {
        width: 0;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        padding-right: var(--double-margin);

        & > span {
            display: block;
            font-weight: bold;
            text-align: center;
            font-size: var(--font-large);
        }

        & > div {
            height: 0;
            flex-grow: 1;
        }
    }

    .table {
        width: 300px;
        flex-shrink: 0;
        margin-bottom: 0;

        & > span {
            display: block;
            font-weight: bold;
            font-size: var(--font-large);
            margin-bottom: var(--margin);
        }

        .team-name, .team-points {
            white-space: pre-wrap;
            word-break: break-all;
        }

        .team-points {
            display: block;
            font-weight: bold;
            text-align: center;
        }

        .b-table {
            margin-left: 0;
        }
    }
}

$breakpoint-md: 768px;
@media (max-width: $breakpoint-md) {
    .scoreboard {
        flex-direction: column;
        overflow-y: auto;

        .chart {
            width: 100%;
            height: calc(100% - 140px);
            flex-shrink: 0;
        }

        .table {
            margin: var(--double-margin) 0;
            width: 100%;
        }
    }
}
</style>
