import ReactApexChart from "react-apexcharts";
import { Typography } from "antd";
import { MinusOutlined } from "@ant-design/icons";

function LineChart({chartData}) {
  const { Title, Paragraph } = Typography;

  const lineChart = {
    series: [
      {
        name: "Leads",
        data: chartData?.seriesLine.leads,
        offsetY: 0,
      },
      {
        name: "Hired",
        data: chartData?.seriesLine.hires,
        offsetY: 0,
      },
      {
        name: "Contract End",
        data: chartData?.seriesLine.contractEnd,
        offsetY: 0,
      },
      {
        name: "Active Contract",
        data: chartData?.seriesLine.activeContracts,
        offsetY: 0,
      },
      {
        name: "Paused Contract",
        data: chartData?.seriesLine.pausedContracts,
        offsetY: 0,
      },
      {
        name: "Active Contract (No Billing)",
        data: chartData?.seriesLine.activeContractsWithNoBilling,
        offsetY: 0,
      },
    ],
  
    options: {
      chart: {
        width: "100%",
        height: 350,
        type: "area",
        toolbar: {
          show: false,
        },
      },
  
      legend: {
        show: true,
      },
  
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
  
      yaxis: {
        labels: {
          style: {
            fontSize: "14px",
            fontWeight: 600,
            colors: ["#8c8c8c"],
          },
        },
      },
  
      xaxis: {
        labels: {
          style: {
            fontSize: "14px",
            fontWeight: 600,
            colors: [
              "#8c8c8c",
              "#8c8c8c",
              "#8c8c8c",
              "#8c8c8c",
              "#8c8c8c",
              "#8c8c8c",
              "#8c8c8c",
              "#8c8c8c",
              "#8c8c8c",
            ],
          },
        },
        categories: chartData?.categories,
      },
  
      tooltip: {
        y: {
          formatter: function (val) {
            return val;
          },
        },
      },
      colors:['#36e1f4','#43f436','#F44336','#3643f4', '#c136f4', "#f4f436"],
      markers: {
        colors: ['#36e1f4','#43f436','#F44336','#3643f4', '#c136f4', "#f4f436"]
     }
    },
  };

  return (
    <>
      <div className="linechart">
        <div>
          <Title level={5}>Contracts Hired</Title>
          <Paragraph className="lastweek">
            than last Month {chartData?.hiredGrowth > 0 ? <span className="bnb2">+{chartData?.hiredGrowth}%</span> : <span className="bnb1">-{chartData?.hiredGrowth}%</span> }
          </Paragraph>
        </div>
        {/* <div className="sales">
          <ul>
            <li>{<MinusOutlined />} Traffic</li>
            <li>{<MinusOutlined />} Sales</li>
          </ul>
        </div> */}
      </div>

      <ReactApexChart
        className="full-width"
        options={lineChart.options}
        series={lineChart.series}
        type="area"
        height={350}
      />
    </>
  );
}

export default LineChart;
