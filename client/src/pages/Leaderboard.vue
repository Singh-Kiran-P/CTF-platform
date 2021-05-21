<template>
    <div class="hello" id="chartdiv"></div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { any } from "@amcharts/amcharts4/.internal/core/utils/Array";

am4core.useTheme(am4themes_animated);

export default Vue.extend({
    name: "Leaderboard",
    components: {},
    data: () => ({
        chart: null as unknown as am4charts.XYChart //TODO: fix this
    }),
    created() {},
    methods: {
        createAxisAndSeries(field: string, name: string, opposite: boolean, bullet: string) {
            var valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
            if (this.chart.yAxes.indexOf(valueAxis) != 0) {
                valueAxis.syncWithAxis = <am4charts.ValueAxis>(
                    this.chart.yAxes.getIndex(0)
                );
            }

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

            switch (bullet) {
                case "triangle":
                    var newBullet = series.bullets.push(
                        new am4charts.Bullet()
                    );
                    newBullet.width = 12;
                    newBullet.height = 12;
                    newBullet.horizontalCenter = "middle";
                    newBullet.verticalCenter = "middle";

                    var triangle = newBullet.createChild(am4core.Triangle);
                    triangle.stroke = interfaceColors.getFor("background");
                    triangle.strokeWidth = 2;
                    triangle.direction = "top";
                    triangle.width = 12;
                    triangle.height = 12;
                    break;
                case "rectangle":
                    var newBullet = series.bullets.push(
                        new am4charts.Bullet()
                    );
                    newBullet.width = 10;
                    newBullet.height = 10;
                    newBullet.horizontalCenter = "middle";
                    newBullet.verticalCenter = "middle";

                    var rectangle = newBullet.createChild(am4core.Rectangle);
                    rectangle.stroke = interfaceColors.getFor("background");
                    rectangle.strokeWidth = 2;
                    rectangle.width = 10;
                    rectangle.height = 10;
                    break;
                default:
                    var defaultBullet = series.bullets.push(
                        new am4charts.CircleBullet()
                    );
                    defaultBullet.circle.stroke = interfaceColors.getFor("background");
                    defaultBullet.circle.strokeWidth = 2;
                    break;
            }

            valueAxis.renderer.line.strokeOpacity = 1;
            valueAxis.renderer.line.strokeWidth = 2;
            valueAxis.renderer.line.stroke = series.stroke;
            valueAxis.renderer.labels.template.fill = series.stroke;
            valueAxis.renderer.opposite = opposite;
        },
        createSeries(field: string, name: string, valueAxis: am4charts.ValueAxis<am4charts.AxisRenderer>) {
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
            var defaultBullet = series.bullets.push(new am4charts.CircleBullet());
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
                team2_points += (i + 120) * 10;
                team3_points += i * 10;

                chartData.push({ // Save date and points per team on this date
                    date: newDate,
                    team1: team1_points,
                    team2: team2_points,
                    team3: team3_points
                });
            }
            return chartData;
        },
    },
    mounted() {
        this.chart = am4core.create("chartdiv", am4charts.XYChart);  
        this.chart.colors.step = 2;// Increase contrast by taking every second color

        // Add data
        this.chart.data = this.generateChartData();

        // Create X axis
        var dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.minGridDistance = 50;

        // Create Y axis
        var pointsAxis = this.chart.yAxes.push(new am4charts.ValueAxis());

        // Create series
        this.createSeries("team1", "Team 1", pointsAxis);
        this.createSeries("team2", "Team 2", pointsAxis);
        this.createSeries("team3", "Team 3", pointsAxis);

        // Add legend
        this.chart.legend = new am4charts.Legend();

        // Add cursor
        this.chart.cursor = new am4charts.XYCursor();

        // generate some random data, quite different range
        let scrollbarX = new am4charts.XYChartScrollbar();
        this.chart.scrollbarX = scrollbarX;
    },

    beforeDestroy() {
        if (this.chart) {
            this.chart.dispose();
        }
    }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
        "Segoe UI Symbol";
}

#chartdiv {
    width: 100%;
    height: 500px;
}
</style>
