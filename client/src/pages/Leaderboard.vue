<template>
    <div class="hello" id="chartdiv"></div>
</template>

<script lang="ts">
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { any } from "@amcharts/amcharts4/.internal/core/utils/Array";

am4core.useTheme(am4themes_animated);

export default {
    name: "HelloWorld",
    data: () => ({
        chart: am4core.create("chartdiv", am4charts.XYChart), //TODO: fix this
    }),
    methods: {
        createAxisAndSeries(field: any, name: any, opposite: any, bullet: any) {
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
                    var bullet = series.bullets.push(
                        new am4charts.Bullet()
                    ) as any;
                    bullet.width = 12;
                    bullet.height = 12;
                    bullet.horizontalCenter = "middle";
                    bullet.verticalCenter = "middle";

                    var triangle = bullet.createChild(am4core.Triangle);
                    triangle.stroke = interfaceColors.getFor("background");
                    triangle.strokeWidth = 2;
                    triangle.direction = "top";
                    triangle.width = 12;
                    triangle.height = 12;
                    break;
                case "rectangle":
                    var bullet = series.bullets.push(
                        new am4charts.Bullet()
                    ) as any;
                    bullet.width = 10;
                    bullet.height = 10;
                    bullet.horizontalCenter = "middle";
                    bullet.verticalCenter = "middle";

                    var rectangle = bullet.createChild(am4core.Rectangle);
                    rectangle.stroke = interfaceColors.getFor("background");
                    rectangle.strokeWidth = 2;
                    rectangle.width = 10;
                    rectangle.height = 10;
                    break;
                default:
                    var bullet = series.bullets.push(
                        new am4charts.CircleBullet()
                    ) as any;
                    bullet.circle.stroke = interfaceColors.getFor("background");
                    bullet.circle.strokeWidth = 2;
                    break;
            }

            valueAxis.renderer.line.strokeOpacity = 1;
            valueAxis.renderer.line.strokeWidth = 2;
            valueAxis.renderer.line.stroke = series.stroke;
            valueAxis.renderer.labels.template.fill = series.stroke;
            valueAxis.renderer.opposite = opposite;
        },
        generateChartData() {
            var chartData = [];
            var firstDate = new Date();
            firstDate.setDate(firstDate.getDate());
            firstDate.setHours(0, 0, 0, 0);

            var visits = 0;
            var hits = 0;
            var views = 0;

            for (var i = 0; i < 5; i++) {
                // we create date objects here. In your data, you can have date strings
                // and then set format of your dates using chart.dataDateFormat property,
                // however when possible, use date objects, as this will speed up chart rendering.
                var newDate = new Date(firstDate);
                newDate.setDate(newDate.getDate() + i);

                visits += (i + 5) * 10;
                hits += (i + 120) * 10;
                views += i * 10;

                chartData.push({
                    date: newDate,
                    visits: visits,
                    hits: hits,
                    views: views,
                });
            }
            return chartData;
        },
    },
    mounted() {
        this.chart = am4core.create("chartdiv", am4charts.XYChart);
        // Increase contrast by taking evey second color
        this.chart.colors.step = 2;

        // Add data
        this.chart.data = this.generateChartData();

        // Create axes
        var dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.minGridDistance = 50;

        // Create series

        this.createAxisAndSeries("visits", "Team1", false, "circle");
        this.createAxisAndSeries("views", "Team2", true, "triangle");
        this.createAxisAndSeries("hits", "Team3", true, "rectangle");

        // Add legend
        this.chart.legend = new am4charts.Legend();

        // Add cursor
        this.chart.cursor = new am4charts.XYCursor();

        let series = this.chart.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = "date";
        series.dataFields.valueY = "value";

        series.tooltipText = "{valueY.value}";
        this.chart.cursor = new am4charts.XYCursor();

        // generate some random data, quite different range
        let scrollbarX = new am4charts.XYChartScrollbar();
        scrollbarX.series.push(series);
        this.chart.scrollbarX = scrollbarX;
    },

    beforeDestroy() {
        if (this.chart) {
            this.chart.dispose();
        }
    },
};
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
