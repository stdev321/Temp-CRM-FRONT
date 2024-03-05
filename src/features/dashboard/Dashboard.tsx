import React, { ReactNode, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  List,
  Progress,
  Radio,
  Row,
  Timeline,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import EChart from "../../Components/CustomComponents/ECharts/ECharts";
import LineChart from "../../Components/CustomComponents/ECharts/LineChart";
import PieChart from "../../Components/CustomComponents/ECharts/PieChart";
import jobService from "../../services/leadsConnectService";
import { useDispatch, useSelector } from "react-redux";
import { dashboardLeadsConnectSelector } from "../../Selectors/dashboardSelector";
import dashService from "../../services/dashboardService";
import authService from "../../services/authServices";
import { RoleEnum } from "../Employee/EmployeeModel";
import ProjectList from "../Project/ProjectList";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

interface Props {
  loading: (progress: number, value: boolean) => void;
}

const Dashboard = (props: Props) => {
  // Required Selectors
  const { loading } = props;
  const { Title, Text } = Typography;
  const dispatch = useDispatch();
  const jobscalculationsData = useSelector(dashboardLeadsConnectSelector);
  const userInfo: any = JSON.parse(authService.getUser());

  // Required UseState
  const [chartData, setChartData] = useState({
    categories: [],
    seriesBar: {
      purchased: [],
      used: [],
    },
    seriesLine: {
      leads: [],
      hires: [],
      contractEnd: [],
      activeContracts: [],
      pausedContracts: [],
      activeContractsWithNoBilling: [],
    },
    currMonthDept: [{ title: "", value: "" }],
    preMonthDept: [{ title: "", value: "" }],
    connectGrowth: 0,
    hiredGrowth: 0,
  });
  const [weekBilling, setWeekBilling] = useState([]);
  const [newEmpData, setNewEmpData] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [newTlData, setnewTlData] = useState<any | null>([]);
  const [contractRecordsForTLdata, setContractRecordsForTL] = useState<any | null>([]);
  const [hoursAndCapacityForTLdata, setHoursAndCapacityForTL] = useState({
    series: [],
    labels: []
  });
  const [projectHoursDetailsdata, setProjectHoursDetails] = useState<any | null>([]);
  const [projectHealthStatusForDashboarddata, setProjectHealthStatusForDashboard] = useState<any | null>([]);

  useEffect(() => {
    if (!jobscalculationsData) {
      dispatch<any>(jobService.fetchjobscalculationslist());
    } else if (jobscalculationsData && jobData?.length === 0) {
      setJobData(jobscalculationsData);
    }
  }, [dispatch, jobscalculationsData]);

  useEffect(() => {
    getEmpData();
    updateEChart();
    updateList();
    getContractRecordsForTL();
    getHoursAndCapacityForTL();
    getProjectHoursDetails();
    getProjectHealthStatusForDashboard();
  }, []);

  // Other Workings

  const getEmpData = async () => {
    let tlEmployeeData;
    const newEmp: any = await dashService.fetchNewEmpData();
    if (!newEmp) return;
    setNewEmpData(newEmp);

    if (userInfo.role === RoleEnum.TeamLead.name) {
      const matchingEmp = newEmp.find(
        (emp: any) => emp.departmentId === userInfo?.departmentId
      );
      setnewTlData(matchingEmp);
    }
  };

  const updateList = async () => {
    const listData: any = await dashService.fetchListData({});
    if (!listData) return;
    setWeekBilling(listData);
    loading(100, false);
  };

  const updateEChart = async () => {
    const met: any = await dashService.fetchChartData({});
    if (!met) return;
    const curMonDept = met[0].departmentConnectsUsed.map((item: any) => {
      return { title: item.departmentName, value: item.totalConnectsUsed };
    });
    const prvMonDept = met[1].departmentConnectsUsed.map((item: any) => {
      return { title: item.departmentName, value: item.totalConnectsUsed };
    });

    const connectSeries = {
      purchased: met.map((item: any) => item.totalConnectsPurchased).reverse(),
      used: met.map((item: any) => +item.totalConnectsUsed).reverse(),
    };
    const jobSeries = {
      leads: met.map((item: any) => +item.leads).reverse(),
      hires: met.map((item: any) => +item.hires).reverse(),
      contractEnd: met.map((item: any) => +item.contractEnd).reverse(),
      activeContracts: met.map((item: any) => +item.activeContracts).reverse(),
      pausedContracts: met.map((item: any) => +item.pausedContracts).reverse(),
      activeContractsWithNoBilling: met
        .map((item: any) => +item.activeContractsWithNoBilling)
        .reverse(),
    };
    const connectCate = met
      .map((item: any) => item.monthName.substr(0, 3))
      .reverse();
    const avgUsedConnects = getGrowth(connectSeries.used);
    const avgHiredJob = getGrowth(jobSeries.hires);

    setChartData((prev) => ({
      ...prev,
      seriesBar: connectSeries,
      categories: connectCate,
      seriesLine: jobSeries,
      connectGrowth: +avgUsedConnects,
      hiredGrowth: +avgHiredJob,
      currMonthDept: curMonDept,
      preMonthDept: prvMonDept,
    }));
  };

  const getGrowth = (arr: []) => {
    const currentMonth = arr[arr.length - 1];
    const previousMonth = arr[arr.length - 2];
    const avgUsedConnects = (
      ((currentMonth - previousMonth) / previousMonth) *
      100
    ).toFixed();
    return avgUsedConnects;
  };

  const list = jobData?.map(
    (dataItem: {
      employeeName: any;
      totalLeads: any;
      totalApplied: any;
      totalHired: any;
      totalConnectUsed: any;
    }) => ({
      employeeName: dataItem?.employeeName,
      totalLeads: dataItem?.totalLeads,
      totalApplied: dataItem?.totalApplied,
      totalHired: dataItem?.totalHired,
      totalConnectUsed: dataItem?.totalConnectUsed,
    })
  );
  const getContractRecordsForTL = async () => {
    const contractRecordsForTL: any = await dashService.fetchContractRecordsForTL();
    setContractRecordsForTL(contractRecordsForTL);
  }

  const getHoursAndCapacityForTL = async () => {
    const hoursAndCapacityForTL: any = await dashService.fetchHoursAndCapacityForTL();
    console.log({ hoursAndCapacityForTL });
    const serArr: any = []
    const labArr: any = []

    serArr.push(hoursAndCapacityForTL.capacityInPercentage)
    labArr.push("Capacity In %")
    serArr.push(hoursAndCapacityForTL.totalBillableHours)
    labArr.push("Total Billable Hours")
    serArr.push(hoursAndCapacityForTL.totalBilledHours)
    labArr.push("Total Billed Hours")
    serArr.push(hoursAndCapacityForTL.totalClientDelightHours)
    labArr.push("Total Client Delight Hours")
    serArr.push(hoursAndCapacityForTL.totalUnbillingHours)
    labArr.push("Total Unbilling Hours")

    setHoursAndCapacityForTL((prv) => ({
      ...prv,
      series: serArr,
      labels: labArr
    }));
  }


  const getProjectHoursDetails = async () => {
    const projectHoursDetails: any = await dashService.fetchProjectHoursDetails();
    setProjectHoursDetails(projectHoursDetails);
  }


  const getProjectHealthStatusForDashboard = async () => {
    const projectHealthStatusForDashboard: any = await dashService.fetchProjectHealthStatusForDashboard();
    setProjectHealthStatusForDashboard(projectHealthStatusForDashboard);
  }
  return (
    <>
      {userInfo.role === RoleEnum.Admin.name ? (
        <>
          <div className="layout-content">
            <Row className="rowgap-vbox" gutter={[24, 0]}>
              {newEmpData?.map((item: any) => {
                return (
                  <Col
                    key={1}
                    xs={24}
                    sm={24}
                    md={12}
                    lg={6}
                    xl={6}
                    className="mb-24"
                  >
                    <Card bordered={false} className="criclebox ">
                      <div className="number">
                        <Row align="middle" gutter={[24, 0]}>
                          <Col xs={18}>
                            <Tooltip title={item.departmentName}>
                              <span
                                style={{
                                  display: "inline-block",
                                  width: "200px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  cursor: "pointer",
                                }}
                              >
                                {item.departmentName}
                              </span>
                            </Tooltip>
                            <Title level={3}>
                              {item.currentFullTimeEmployees}
                              <small
                                className="bnb"
                                style={{ fontSize: "16px" }}
                              >
                                Total Employees
                              </small>
                            </Title>
                          </Col>
                          <Col xs={6}>
                            <Tooltip title="New Employees">
                              <div
                                className="icon-box"
                                style={{ fontSize: "18px" }}
                              >
                                {item.newHiredEmployees}
                              </div>
                            </Tooltip>
                          </Col>
                        </Row>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24} sm={24} md={12} lg={12} xl={10} className="mb-24">
                <Card bordered={false} className="criclebox h-full">
                  <LineChart chartData={chartData} />
                </Card>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={14} className="mb-24">
                <Card bordered={false} className="criclebox h-full">
                  <EChart chartData={chartData} />
                </Card>
              </Col>
            </Row>

            <List
              grid={{ gutter: 16, column: 6 }}
              dataSource={weekBilling}
              renderItem={(item: any) => (
                <List.Item>
                  <Card title={item.departmentName}>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>Total Hours:</Col>
                      <Col span={12}>{item.totalHoursTargeted}</Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>Billed Hours:</Col>
                      <Col span={12}>{item.totalBilledHours}</Col>
                    </Row>
                    <Divider />
                    <Row gutter={[16, 16]}>
                      <Col span={12}>Capacity:</Col>
                      <Col span={12}>
                        {item.capacityInPercentage > 50 ? (
                          <span className="bnb2">
                            +{item.capacityInPercentage}%
                          </span>
                        ) : (
                          <span className="bnb1">
                            {item.capacityInPercentage}%
                          </span>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        </>
      ) : null}

      {userInfo.role === RoleEnum.BDM.name ? (
        <div className="layout-content">
          {/* <Row className="rowgap-vbox" gutter={[24, 0]}>
            <Col
              key={1}
              xs={24}
              sm={24}
              md={12}
              lg={6}
              xl={6}
              className="mb-24"
            >
              <Card bordered={false} className="criclebox ">
                <div className="number">
                  <Row align="middle" gutter={[24, 0]}>
                    <Col xs={18}>
                      <span>Date</span>
                      <Title level={3}>
                        Demo <small className="bnb">20</small>
                      </Title>
                    </Col>
                    <Col xs={6}>
                      <div className="icon-box">icon</div>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
        </Row> */}

          <Row gutter={[24, 0]}>
            <Col xs={24} sm={24} md={12} lg={12} xl={10} className="mb-24">
              <Card bordered={false} className="criclebox h-full">
                <EChart chartData={chartData} />
              </Card>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={14} className="mb-24">
              <Card bordered={false} className="criclebox h-full">
                <LineChart chartData={chartData} />
              </Card>
            </Col>
          </Row>

          <List
            grid={{ gutter: 16, column: 6 }}
            dataSource={weekBilling}
            renderItem={(item: any) => (
              <List.Item>
                <Card title={item.departmentName}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>Total Hours:</Col>
                    <Col span={12}>{item.totalHoursTargeted}</Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>Billed Hours:</Col>
                    <Col span={12}>{item.totalBilledHours}</Col>
                  </Row>
                  <Divider />
                  <Row gutter={[16, 16]}>
                    <Col span={12}>Capacity:</Col>
                    <Col span={12}>
                      {item.capacityInPercentage > 50 ? (
                        <span className="bnb2">
                          +{item.capacityInPercentage}%
                        </span>
                      ) : (
                        <span className="bnb1">
                          {item.capacityInPercentage}%
                        </span>
                      )}
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            )}
          />

          <Row gutter={[24, 0]}>
            <Col xs={24} sm={24} md={12} lg={24} xl={24} className="mb-24">
              <Card bordered={false} className="criclebox cardbody h-full">
                <div className="project-ant">
                  <div>
                    <Title level={5}>Job's This Week</Title>
                  </div>
                </div>
                <div className="ant-list-box table-responsive">
                  <table className="width-100">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Total Leads</th>
                        <th>Total Applied</th>
                        <th>Total Hired</th>
                        <th>Total Connect Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list?.map((d: any, index: number) => (
                        <tr key={index}>
                          <td>
                            <h6>
                              <img
                                src={d.img}
                                alt=""
                                className="avatar-sm mr-10"
                              />
                              {d.employeeName}
                            </h6>
                          </td>
                          <td>
                            <div className="percent-progress">
                              {d.totalLeads}
                            </div>
                          </td>
                          <td>
                            <span className="text-xs font-weight-bold">
                              {d.totalApplied}
                            </span>
                          </td>
                          <td>
                            <div className="percent-progress">
                              {d.totalHired}
                            </div>
                          </td>
                          <td>
                            <div className="percent-progress">
                              {d.totalConnectUsed}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </Col>
            {/* <Col xs={24} sm={24} md={12} lg={12} xl={8} className="mb-24">
           
          </Col> */}
          </Row>
        </div>
      ) : null}

      {userInfo.role === RoleEnum.TeamLead.name ? (

        <>
          <div className="layout-content ">
            <Row className="rowgap-vbox" gutter={[24, 24]}>
              <Col xs={24}
                sm={24}
                md={12}
                lg={4}
                xl={4}
                className="mb-24">

                <Card bordered={false} className="criclebox ">
                  <div className="number">
                    <Tooltip title="Total Employees"><strong>Total Employees</strong>
                    </Tooltip>
                    <div
                      className="icon-box"
                      style={{ fontSize: "18px" }}
                    >
                      {newTlData?.currentFullTimeEmployees}
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24}
                sm={24}
                md={12}
                lg={4}
                xl={4}
                className="mb-24">

                <Card bordered={false} className="criclebox ">
                  <div className="number">
                    <Tooltip title="New Employees"><strong>New Hires</strong>
                    </Tooltip>
                  </div>
                  <div
                    className="icon-box"
                    style={{ fontSize: "18px" }}
                  >
                    {newTlData?.newHiredEmployees}
                  </div>
                </Card>
              </Col>
              <Col xs={24}
                sm={24}
                md={12}
                lg={4}
                xl={4}
                className="mb-24">
                <Card bordered={false} className="criclebox ">
                  <div className="number ">
                    <Tooltip title="Active Contracts"><strong>Active Contracts</strong>
                    </Tooltip>
                  </div>
                  <div
                    className="icon-box"
                    style={{ fontSize: "18px" }}
                  >
                    {contractRecordsForTLdata?.activeContracts}
                  </div>
                </Card>
              </Col>


              <Col xs={24}
                sm={24}
                md={12}
                lg={4}
                xl={4}
                className="mb-24">

                <Card bordered={false} className="criclebox ">
                  <div className="number">
                    <Tooltip title="Active Contracts With No Billing"><strong>Active Contracts With No Billing</strong>
                    </Tooltip>
                  </div>
                  <div
                    className="icon-box"
                    style={{ fontSize: "18px" }}
                  >
                    {contractRecordsForTLdata?.activeContractsWithNoBilling
                    }
                  </div>
                </Card>
              </Col>

              <Col xs={24}
                sm={24}
                md={12}
                lg={4}
                xl={4}
                className="mb-24">

                <Card bordered={false} className="criclebox ">
                  <div className="number">
                    <Tooltip title="Paused Contracts"><strong>Paused Contracts</strong>
                    </Tooltip>
                  </div>
                  <div className="icon-box" style={{ fontSize: "18px" }} > {contractRecordsForTLdata?.pausedContracts}  </div>
                </Card>
              </Col>
            </Row>

            <PieChart pieChartData={hoursAndCapacityForTLdata} />

            <List ><Title style={{ marginTop: 40, marginBottom: 5, fontSize: 30 }} >Hours And Capacity</Title>
              <Card>
                <Row gutter={[16, 16]}>
                  <Col span={12} >
                    <strong>Project Name</strong>
                    {projectHealthStatusForDashboarddata?.map((project: { projectId: React.Key | null | undefined; projectName: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
                      <Row key={project.projectId} style={{ marginTop: 10 }} >{project?.projectName}</Row>
                    ))}
                  </Col>

                  <Col span={12}  >
                    <strong> Status </strong>
                    {projectHealthStatusForDashboarddata?.map((project: { projectId: React.Key | null | undefined; projectHealth: number; }) => (
                      <Row key={project?.projectId} style={{ color: project.projectHealth === 1 ? 'green' : 'red', marginTop: 10 }} >
                        {project.projectHealth === 1 ? <CheckCircleOutlined style={{ fontSize: '22px', marginTop: 10 }} /> : <CloseCircleOutlined style={{ fontSize: '22px' }} />}
                      </Row>
                    ))}
                  </Col>

                </Row>
              </Card>
            </List >

            <List style={{  marginBottom: 40 }}> <Title style={{ marginTop: 40, marginBottom: 5, fontSize: 30, }} >Project Hours Details</Title>
              <Card>
                <Row gutter={[16, 16]}>
                  <Col span={3} >
                    <strong >Project Name:</strong>
                    {projectHoursDetailsdata?.map((project: { projectId: React.Key | null | undefined; projectName: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
                      <Row key={project.projectId} style={{ marginTop: 10 }} >{project?.projectName}</Row>
                    ))}
                  </Col>

                  <Col span={3}> <strong>Billable Hours :</strong>{projectHoursDetailsdata?.map((project: { projectId: React.Key | null | undefined; billedHours: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
                    <Row key={project.projectId} style={{ marginTop: 10 }}>{project?.billedHours}</Row>
                  ))}</Col>

                  <Col span={3}><strong>Billed Hours :</strong>{projectHoursDetailsdata?.map((project: { projectId: React.Key | null | undefined; billableHours: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
                    <Row key={project.projectId} style={{ marginTop: 10 }}>{project?.billableHours}</Row>
                  ))}</Col>
                  <Col span={3}><strong>Client Delight Hours :</strong>{projectHoursDetailsdata?.map((project: { projectId: React.Key | null | undefined; clientDelightHours: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
                    <Row key={project.projectId} style={{ marginTop: 10 }}>{project?.clientDelightHours}</Row>
                  ))}</Col>
                  <Col span={3}><strong>Unbilled Hours :</strong>{projectHoursDetailsdata?.map((project: { projectId: React.Key | null | undefined; unbilledHour: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
                    <Row key={project.projectId} style={{ marginTop: 10 }}>{project?.unbilledHour}</Row>
                  ))}</Col>
                </Row>
              </Card>
            </List >
          </div>
        </>
      ) : null}
    </>
  );
};

export default Dashboard;
