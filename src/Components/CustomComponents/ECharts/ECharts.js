import ReactApexChart from "react-apexcharts";
import { Row, Col, Typography, Divider } from "antd";

function EChart({chartData}) {
  const { Title, Paragraph } = Typography;

  const eChart = {
    series: [
      {
        name: "Connects Purchased",
        data: chartData?.seriesBar?.purchased,
        color: "#fff",
      },
      {
        name: "Connects Used",
        data: chartData?.seriesBar?.used,
        color: "#000",
      },
    ],
  
    options: {
      chart: {
        type: "bar",
        width: "100%",
        height: "auto",
  
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "70%",
          borderRadius: 5,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["transparent"],
      },
      grid: {
        show: true,
        borderColor: "#ccc",
        strokeDashArray: 2,
      },
      xaxis: {
        categories: chartData?.categories,
        labels: {
          show: true,
          align: "right",
          minWidth: 0,
          maxWidth: 160,
          style: {
            colors: [
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
            ],
          },
        },
      },
      yaxis: {
        labels: {
          show: true,
          align: "right",
          minWidth: 0,
          maxWidth: 160,
          style: {
            colors: [
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
              "#fff",
            ],
          },
        },
      },

      markers: {
        style: {
          color: "#fff"
        }
      },
      legend: {
        show: true,
        labels: {
          colors: "#fff"
        }
      },
    
      tooltip: {
        y: {
          formatter: function (val) {
            return val;
          },
        },
      },
    },
  };
  
  return (
    <>
      <div id="chart">
        <ReactApexChart
          className="bar-chart"
          options={eChart.options}
          series={eChart.series}
          type="bar"
          height={220}
        />
      </div>
      <div className="chart-vistior">
        <Title level={5}>Connects used</Title>
        <Paragraph className="lastweek">
          than last month {chartData?.connectGrowth > 0 ? <span className="bnb2">+{chartData?.connectGrowth}%</span> : <span className="bnb1">-{chartData?.connectGrowth}%</span> }
        </Paragraph>
        {/* <Paragraph className="lastweek"></Paragraph> */}
        <Row gutter>
          {chartData?.currMonthDept.map((v, index) => (
            <Col xs={6} xl={6} sm={6} md={6} key={index}>
              <div className="chart-visitor-count">
                <Title level={4}>{v.value}</Title>
                <span>{v.title}</span>
              </div>
            </Col>
          ))}
        </Row>
        {/* <Divider />
        <Row gutter>
          {chartData?.preMonthDept.map((v, index) => (
            <Col xs={6} xl={6} sm={6} md={6} key={index}>
              <div className="chart-visitor-count">
                <Title level={4}>{v.value}</Title>
                <span>{v.title}</span>
              </div>
            </Col>
          ))}
        </Row> */}
      </div>
    </>
  );
}

export default EChart;
