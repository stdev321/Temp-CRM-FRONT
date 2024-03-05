import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import reportService from "../../services/reportRequest";
import {
  reportSelector,
  isReportLoadingSelector,
} from "../../Selectors/reportSelector";
import { deptSelector } from "../../Selectors/departmentSelector";
import {
  Col,
  Row,
  Table,
  Card,
  Space,
  Tooltip,
  Button,
  Divider,
  Modal,
} from "antd";
import SkeletonTable from "../../Layout/SkeletonTable";
import { SkeletonTableColumnsType } from "../../Layout/SkeletonTable/SkeletonTable";
import moment from "moment";
import { contractStatusSelector } from "../../Selectors/contractStatusSelector";
import { IContractStatus } from "../../models/IContractStatusState";
import {
  ExclamationCircleOutlined,
  EyeOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  LikeOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import projectService from "../../services/projectRequest";
import DetailViewModal from "../../Helper/ViewJobDetail";
import ProjectHistory from "../Project/ProjectHistory";
import GlobalFilter, {
  FilterConfig,
} from "./../../Components/GlobalFilter/GlobalFilter";
import {
  AccountTypes,
  BillingTypes,
  ContractStatus,
  ContractType,
  ProjectStatus,
} from "./../../Enums/LeadsConnect/BillingStatus";
import { empSelector } from "../../Selectors/employeeSelector";
import { countries } from "../../Helper/countries";
interface DataType {
  key: string;
  projectDepartments: ProjectReports[];
}
interface ProjectReports {
  projectDepId: string;
  departmentId: string;
  departmentName: string;
  clientId: string;
  clientName: string;
  projectHealthRate: number;
  country: string;
  projectId: string;
  accounts: string;
  contractName: string;
  contractType: string;
  hoursPerWeek: string;
  billingType: string;
  status: string;
}
interface Props {
  loading: (flag: boolean) => void;
}
export default function ActiveReports({ loading }: Props) {
  const dispatch = useDispatch();
  const [editRow, setEditRow] = useState(null);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<any>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProjectReports | null>(
    null
  );
  const [deptList, setDeptList] = useState<any>();
  const report = useSelector(reportSelector);
  const loadingReport: boolean = useSelector(isReportLoadingSelector);
  const deptData = useSelector(deptSelector);
  const contractStatusData: any = useSelector(contractStatusSelector);
  const [filters, setFilters] = useState({
    dateRange: [],
    dept: "",
    contractStatus: "",
    projectStatus: "",
  });
  const [multipleDepartments, setMultipleDepartments] = useState([]);
  const empData = useSelector(empSelector);

  useEffect(() => {
    dispatch<any>(reportService.fetchContractStatus());
    dispatch<any>(reportService.fetchReports());
  }, [dispatch]);

  useEffect(() => {
    if (!loadingReport) {
      loading(false);
    }
  }, [loadingReport, loading]);

  useEffect(() => {
    if (!deptData) return;
    const dept = deptData.map((item: any) => {
      return { label: item.departmentName, value: item.departmentId };
    });
    setDeptList(dept);
  }, [deptData]);

  const contractTypeOptions = [
    ...(contractStatusData && contractStatusData?.length > 0
      ? contractStatusData.map((status: IContractStatus) => ({
          label: status.contractStatusName,
          value: status.contractStatusName,
        }))
      : []),
  ];

  const showHistoryModal = async (projectId: any) => {
    setEditRow(null);
    const response = await projectService.getProjectHIstory(projectId);

    setIsHistoryModalVisible(true);
    setEditRow(response);
  };

  const handleCloseDetailView = () => {
    setIsOpen(false);
  };

  const title = `Details of- ${selectedReport?.contractName}`;

  const handleExpand = (expanded: boolean, record: any) => {
    const keys = [...expandedRowKeys];
    if (expanded) {
      keys.push(record.key);
    } else {
      const index = keys.indexOf(record.key);
      if (index !== -1) {
        keys.splice(index, 1);
      }
    }
    setExpandedRowKeys(keys);
  };

  const employeeList = empData?.map((item: any) => {
    return {
      label: item.firstName + " " + item.lastName,
      value: item.employeeId,
    };
  });

  const getEnumNameFromValue = (
    value: number | string,
    enumObject: Record<string, any>
  ) => {
    const numericValue =
      typeof value === "string" ? parseInt(value, 10) : value;

    const match = Object.values(enumObject).find(
      (item) => item.value === numericValue
    );

    return match ? match.name : undefined;
  };

  const expendableRows = (record: any) => {
    const endDate = moment(record.endDate).format("DD MMMM YYYY");

    return (
      <Row style={{ padding: 20 }} gutter={[16, 16]}>
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <b>Assigned To:</b> {record.employeeName}
            </Col>
            <Col span={8}>
              <b>Contract End Date:</b> {endDate}
            </Col>
            <Col span={8}>
              <b>Project URL:</b> {record.projectUrl}
            </Col>
          </Row>
          <Divider />
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <b>Department Name:</b> {record.departmentName}
            </Col>
            <Col span={6}>
              <b>Country:</b> {record.country}
            </Col>
            <Col span={6}>
              <b>Account Type:</b> {record.accounts}
            </Col>
            <Col span={6}>
              <b>Contract Status:</b> {record.contractStatus}
            </Col>
          </Row>
          <Divider />
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <b>Billing Type:</b> {record.billingType}
            </Col>
            <Col span={6}>
              <b>Contract Type:</b> {record.contractType}
            </Col>
            <Col span={6}>
              <b>Communication Mode:</b> {record.communication}
            </Col>
          </Row>
        </Col>
      </Row>
    );
  };

  const columns = [
    {
      title: "Contract Name",
      dataIndex: "contractName",
      key: "contractName",
    },
    {
      title: "Health Rate",
      dataIndex: "projectHealthRate",
      key: "projectHealthRate",
      width: 10,
      render: (e: any, param: any) => {
        if (param.projectHealthRate === 1) {
          return (
            <Card
              style={{
                backgroundColor: "#35ad58",
                width: "50px",
                height: "50px",
                textAlign: "center",
                color: "#ffffff",
                fontWeight: "bold",
                paddingTop: "15px",
                borderRadius: "50px",
              }}
            >
              <LikeOutlined
                style={{
                  fontSize: "26px",
                  transform: "translate(0px, -5px)",
                }}
              />
            </Card>
          );
        }
        if (param.projectHealthRate === 2) {
          return (
            <Card
              style={{
                backgroundColor: "#e0d312",
                width: "50px",
                height: "50px",
                textAlign: "center",
                color: "#ffffff",
                fontWeight: "bold",
                paddingTop: "15px",
                borderRadius: "50px",
              }}
            >
              <WarningOutlined
                style={{
                  fontSize: "26px",
                  transform: "translate(0px, -5px)",
                }}
              />
            </Card>
          );
        }
        if (param.projectHealthRate === 3) {
          return (
            <Card
              style={{
                backgroundColor: "#ec0e0e",
                width: "50px",
                height: "50px",
                textAlign: "center",
                color: "#ffffff",
                fontWeight: "bold",
                borderRadius: "50px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ExclamationCircleOutlined
                style={{ fontSize: "30px", transform: "translate(0px, 0px)" }}
              />
            </Card>
          );
        }
      },
    },
    {
      title: "Client Name",
      dataIndex: "clientName",
      key: "clientName",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: moment.MomentInput) => moment(date).format("YYYY-MM-DD"),
    },
    {
      title: "UpWork Id",
      dataIndex: "upWorkId",
      key: "upWorkId",
    },
    {
      title: "Weekly Hours",
      dataIndex: "hoursPerWeek",
      key: "hoursPerWeek",
    },
    {
      title: "Actions",
      dataIndex: "action",
      key: "action",
      description: "Project history",
      render: (e: any, rowData: any) => (
        <Space>
          <Tooltip title="Project History">
            <Button type="link" onClick={() => showHistoryModal(rowData.key)}>
              <HistoryOutlined style={{ color: "red" }} />
            </Button>
          </Tooltip>
          <Tooltip title="Information">
            <Button
              type="link"
              onClick={() =>
                handleExpand(!expandedRowKeys.includes(rowData.key), rowData)
              }
            >
              <InfoCircleOutlined style={{ color: "green" }} />
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const data: DataType[] =
    report && report.length >= 0
      ? report.map((data: any, id: number) => {
          return {
            key: data.projectId,
            accounts: data.accounts,
            upWorkId: data.upWorkId,
            contractName: data.contractName,
            clientName: data.clientName,
            projectHealthRate: data.projectHealthRate,
            departmentName: data.departmentName,
            startDate: data.startDate,
            employeeName: data.employeeName,
            hoursPerWeek: data.hoursPerWeek,
            contractType: data.contractType,
            communication: data.communication,
            billingType: data.billingType,
            country: data.country,
            projectUrl: data.projectUrl,
            status: data.status,
            contractStatus: data.contractStatus,
          };
        })
      : [];

  const handleCloseProjectHistory = () => {
    setIsHistoryModalVisible(false);
  };

  const filterConfig: FilterConfig[] = [
    { key: "dateRange", type: "date" },
    {
      key: "dept",
      type: "select",
      options: deptList,
      placeholder: "Department",
    },
    {
      key: "contractStatus",
      type: "select",
      options: contractTypeOptions,
      placeholder: "Contract Status",
      width: 200,
    },
    {
      key: "projectStatus",
      type: "select",
      options: Object.values(ProjectStatus).map((status) => ({
        label: status.name,
        value: status.name,
      })),
      placeholder: "Project Status",
      width: 200,
    },
    // Add more filter configurations as needed
  ];

  const filteredData = data.filter((row: any) => {
    // Check each filter condition
    const dateRangeCondition =
      filters.dateRange?.length === 0 ||
      (row.startDate >= filters.dateRange?.[0] &&
        row.startDate <= filters.dateRange?.[1]);

    const department = deptList?.find(
      (dept: Record<string, string>) => dept.value === filters.dept
    );

    const deptCondition =
      !filters.dept || row.departmentName.includes(department.label);

    const employeeCondition =
      !filters.contractStatus || row.contractStatus === filters.contractStatus;

    const ProjStatus =
      !filters.projectStatus || row.status === filters.projectStatus;

    // Return true if all conditions are met
    return (
      dateRangeCondition && deptCondition && employeeCondition && ProjStatus
    );
  });

  const handleFilter = (data: any) => {
    console.log({ data });
    setFilters({
      dept: data.dept || "",
      dateRange: data.dateRange || [],
      contractStatus: data.contractStatus || "",
      projectStatus: data.projectStatus || "",
    });
  };

  return (
    <>
      <Row
        className="projects-reports"
        gutter={[16, 16]}
        style={{ marginTop: "10px" }}
      >
        <Col title="Date Filter">
          <GlobalFilter
            filterConfig={filterConfig}
            onFilterChange={handleFilter}
          />
        </Col>
        <Col span={24}>
          <Card
            bordered={false}
            className="criclebox tablespace mb-24"
            title={`Project Reports`}
          >
            <div className="table-responsive">
              <SkeletonTable
                columns={columns as SkeletonTableColumnsType[]}
                active
              >
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  size="large"
                  expandable={{
                    showExpandColumn: false,
                    expandedRowRender: (record) => expendableRows(record),
                    expandedRowKeys,
                    onExpand: handleExpand,
                  }}
                />
              </SkeletonTable>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        open={isHistoryModalVisible}
        title="Project History"
        onCancel={handleCloseProjectHistory}
        footer={null}
        width={"100%"}
        style={{ maxWidth: 1200 }}
      >
        <ProjectHistory
          handleCloseDialog={handleCloseProjectHistory}
          isOpen={isHistoryModalVisible}
          projectData={editRow}
        />
      </Modal>
    </>
  );
}
