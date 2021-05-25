<template>
  <div class="leaderboard">
    <div class="chart-settings-div">
      <b-form-group>
        <label for="time-span-select">Time Span</label>
        <b-form-select
          @change="handleTimeSpanSelect"
          size="sm"
          id="time-span-select"
          v-model="timeSpan"
          :options="timeSpanOptions"
        ></b-form-select>
      </b-form-group>
    </div>

    <div class="chart-div" id="chart"></div>
    <div>
      <b-table hover :items="items"></b-table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { any } from "@amcharts/amcharts4/.internal/core/utils/Array";

am4core.useTheme(am4themes_animated);

export default Vue.extend({
  name: "Leaderboard",
  components: {},
  data: () => ({
    chart: (null as unknown) as am4charts.XYChart,
    timeSpan: "Weekly",
    timeSpanOptions: ["Hourly", "Daily", "Weekly"],
    chartData: [] as {
      date: Date;
      team1: number;
      team2: number;
      team3: number;
    }[],

    items: [
      { age: 40, first_name: "Dickerson", last_name: "Macdonald" },
      { age: 21, first_name: "Larsen", last_name: "Shaw" },
      {
        age: 89,
        first_name: "Geneva",
        last_name: "Wilson",
        _rowVariant: "danger",
      },
      {
        age: 40,
        first_name: "Thor",
        last_name: "MacDonald",
        _cellVariants: { age: "info", first_name: "warning" },
      },
      { age: 29, first_name: "Dick", last_name: "Dunlap" },
    ],
  }),
  created() {
    this.$socket.$subscribe("BACH 1", (data: any) => {
      console.log(data);
    });
    this.$socket.$subscribe("BACH 2", (data: any) => {
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
      var defaultBullet = series.bullets.push(new am4charts.CircleBullet());
      defaultBullet.circle.stroke = interfaceColors.getFor("background");
      defaultBullet.circle.strokeWidth = 2;
    },
    generateChartData() {
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

        this.chartData.push({
          // Save date and points per team on this date
          date: newDate,
          team1: team1_points,
          team2: team2_points,
          team3: team3_points,
        });
      }
      return this.chartData;
    },
    handleTimeSpanSelect(span: string) {
      console.log(span);
    },
  },
  mounted() {
    this.chart = am4core.create("chart", am4charts.XYChart);
    this.chart.colors.step = 2; // Increase contrast by taking every second color

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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}
.chart-settings {
  margin-top: var(--margin);
}
.chart-div {
  width: 50%;
  height: 500px;
}
</style>
