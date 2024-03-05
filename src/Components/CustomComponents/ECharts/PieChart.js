import ReactApexChart from "react-apexcharts";
import { Row, Col, Typography, Divider } from "antd";

function PieChart({pieChartData}) {
  const { Title, Paragraph } = Typography;
  const options = {
    series: pieChartData.series, //[44, 55],
    option: {
      chart: {
        type: "donut",
      },
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          offsetY: 0,
        },
      },
      dataLabels: {
        enabled: true,
      },
      grid: {
        padding: {
          bottom: -80,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 400,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
      labels: pieChartData.labels //["First", "Second"],
    },
  };

  return (
    <>
      <Title style={{marginTop: 0,marginBottom: 0, paddingTop:0, paddingBottom:0,fontSize:30 }} level={6}>Hours And Capacity</Title>
      <ReactApexChart
        options={options.option}
        series={options.series}
        type="donut"
        height={300}
      />
    </>
  );
}

export default PieChart;