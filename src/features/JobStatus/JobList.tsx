import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deptSelector } from "../../Selectors/departmentSelector";
import {
  Col,
  Row,
  Table,
  Card,
  Modal,
  Space,
  message,
  Button,
  Divider,
  Tooltip,
} from "antd";
import jobService from "../../services/leadsConnectService";
import {
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import SkeletonTable from "../../Layout/SkeletonTable";
import { SkeletonTableColumnsType } from "../../Layout/SkeletonTable/SkeletonTable";
import authService from "../../services/authServices";
import { useLocation } from "react-router-dom";
import { leadsConnectSelector } from "../../Selectors/leadsConnectSelector";
import {
  AccountTypes,
  BillingTypes,
  ContractStatus,
  ContractType,
  StatusEnum,
} from "../../Enums/LeadsConnect/BillingStatus";
import { marketPlaceAccountSelector } from "../../Selectors/marketPlaceAccountSelector";
import EditJob from "./EditJob";
import DetailViewModal from "../../Helper/ViewJobDetail";
import { empSelector } from "../../Selectors/employeeSelector";
import empService from "../../services/empRequest";
import { RoleEnum } from "../Employee/EmployeeModel";
import { DeptEnum } from "../../Enums/DeptEnum/DeptEnum";
import { pageLocation } from "../../Helper/GetLocation";
import { countries } from "../../Helper/countries";
import GlobalFilter, {
  FilterConfig,
} from "../../Components/GlobalFilter/GlobalFilter";
import { SizeType } from "antd/es/config-provider/SizeContext";
import marketPlaceAccountService from "../../services/marketPlaceAccountRequest";
import moment from "moment";

interface DataType {
  projectName?: string;
  upworkId?: string;
  accountTypes?: string;
  jobUrl?: string;
  jobdescription?: string;
  connects?: string;
  projectUrl?: string;
  clientName?: string;
  countryName?: string;
  hiredProfile?: string;
  email?: string;
  mobile?: string;
  communicationProfile?: string;
  departmentName?: string;
  contracType?: string;
  weeklyHours?: string;
  jobStatus?: string;
  startDate?: string;
  isActive?: string;
  billingStatus?: string;
  billingType?: string;
  communicationMode: string;
}

interface Props {
  loading: (progress: number, value: boolean) => void;
}

const JobList = (props: Props) => {
  // Main Pages ===========
  const { loading } = props;
  const dispatch = useDispatch();
  const location = useLocation();
  const deptData = useSelector(deptSelector);
  const accountData = useSelector(marketPlaceAccountSelector);
  const jobsData = useSelector(leadsConnectSelector);
  const empdata = useSelector(empSelector);
  const userInfo: any = JSON.parse(authService.getUser());
  const refFile = useRef<any>();

  // Other UseStates ===================
  const [isOpen, setIsOpen] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [isDetailView, setDetailView] = useState(false);
  const [deptFilter, setDeptFilter] = useState<any>();
  const [pathName, setPathName] = useState<any>();
  const [deptList, setDeptList] = useState<any>();
  const [selectedJob, setSelectedJob] = useState<DataType | null>(null);
  const [employeeOption, setEmployeeOption] = useState<any>();
  const [fileList, setFileList] = useState<FileList | null>(null);
  const [size, setSize] = useState<SizeType>("large");
  const [expandedRowKeys, setExpandedRowKeys] = useState<any>([]);

  const [filters, setFilters] = useState({
    dateRange: [],
    dept: "",
    employeeId: "",
    jobStatus: "",
  });

  // UseEffects ========================
  // Department get by Filter

  useEffect(() => {
    if (!location) return;
    const pathnames = pageLocation(location.pathname);
    setPathName(pathnames?.pathName);
    setDeptFilter(pathnames?.deptFilter);
  }, [location.pathname]);

  useEffect(() => {
    if (!deptFilter) {
      dispatch<any>(jobService.fetchJobsList(deptFilter));
    }
  }, [dispatch, deptFilter]);

  useEffect(() => {
    if (userInfo.role === RoleEnum.Employee.name && !jobsData) {
      dispatch<any>(jobService.fetchJobsList());
    }
  }, [dispatch, jobsData]);

  useEffect(() => {
    if (!empdata) {
      dispatch<any>(empService.fetchEmpList());
    }
  }, [empdata]);

  useEffect(() => {
    if (!accountData) {
      dispatch<any>(marketPlaceAccountService.fetchMarketPlaceAccountList());
    }
  }, [dispatch, accountData]);

  useEffect(() => {
    if (!deptData) return;
    const dept = deptData.map((item: any) => {
      return { label: item.departmentName, value: item.departmentId };
    });
    setDeptList(dept);
  }, [deptData]);

  useEffect(() => {
    if (!empdata) return;
    const employeeData = empdata
      .filter(
        (data: any) =>
          data.departmentId === DeptEnum.business_Developement.value
      )
      .map((item: any) => {
        return {
          label: `${item.firstName} ${
            item.lastName === null ? "" : item.lastName
          }`,
          value: item.employeeId,
        };
      });
    setEmployeeOption(employeeData);
  }, [empdata]);

  useEffect(() => {
    loading(100, false);
    if (empdata !== null && jobsData !== null) {
      const rows = jobsData.map((job: any, index: number) => ({
        jobId: job.jobId,
        projectName: job.projectName,
        upworkId: job.upworkId,
        accountTypes: job.accountTypes,
        jobUrl: job.jobUrl,
        jobdescription: job.jobdescription,
        connects: job.connects,
        projectUrl: job.projectUrl,
        clientName: job.clientName,
        countryName: job.countryName,
        hiredProfile: job.hiredProfile,
        email: job.email,
        mobile: job.mobile,
        communicationProfile: job.communicationProfile,
        departmentId: job.departmentId,
        contracType: job.contracType,
        weeklyHours: job.weeklyHours,
        jobStatus: job.jobStatus,
        startDate: job.startDate,
        isActive: job.isActive,
        billingStatus: job.billingStatus,
        billingType: job.billingType,
        amountSpent: job.amountSpent,
        employeeId: job.employeeId,
        communicationMode: job.communicationMode,
      }));
      setRowData(rows);
    }
  }, [dispatch, jobsData, empdata]);

  // Other Workings

  const onClickEditJob = async (jobId: any) => {
    loading(10, false);
    setEditRow(null);
    const response = await jobService.fetchJobById(jobId);
    if (response.error) {
      message.error("Something Went Wrong");
      loading(100, false);
    } else {
      setEditRow(response?.data.jobs);
      setIsOpenEditModal(true);
      // message.success("Done!");
      loading(100, false);
    }
  };

  const showDetailView = (jobId: any) => {
    const selectedJob = jobsData.find((job: any) => job.jobId === jobId);
    setSelectedJob(selectedJob);
    setDetailView(true);
  };

  const handleCloseEditModal = () => {
    setIsOpenEditModal(false);
  };

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

  const getFieldFromAccount = (Id: any, field: string) => {
    const account =
      accountData &&
      accountData.find((accountItem: any) => accountItem.id === Id);
    return account ? account[field] : null;
  };

  const getFieldFromEmployee = (Id: any, fields: string[]) => {
    const emp = empdata && empdata.find((emp: any) => emp.employeeId === Id);
    if (emp) {
      const values: { [key: string]: any } = {};
      fields.forEach((field) => {
        values[field] = emp[field];
      });
      return values;
    } else {
      return null;
    }
  };

  const getFieldFromDepartment = (Id: any, field: string) => {
    const deptName =
      deptData && deptData.find((dept: any) => dept.departmentId === Id);
    return deptName ? deptName[field] : null;
  };

  const columns = [
    {
      title: "Job Applied By",
      dataIndex: "employeeId",
      key: "employeeId",
      render: (e: any, item: any) => {
        const employeeId = item.employeeId;
        const result = getFieldFromEmployee(employeeId, [
          "firstName",
          "lastName",
        ]);

        const firstName = result?.firstName ?? null;
        const lastName = result?.lastName ?? null;

        return (
          <span>
            {firstName} {lastName}
          </span>
        );
      },
    },
    {
      title: "Upwork Id",
      dataIndex: "upworkId",
      key: "upworkId",
      render: (e: any, item: any) => {
        const upworkId = item.upworkId;
        const upworkName = getFieldFromAccount(upworkId, "name");
        return upworkName;
      },
    },
    {
      title: "DepartmentName",
      dataIndex: "departmentId",
      key: "departmentId",
      render: (e: any, item: any) => {
        const Id = item.departmentId;
        const deptName = getFieldFromDepartment(Id, "departmentName");
        return deptName;
      },
    },
    {
      title: "Connects",
      dataIndex: "connects",
      key: "connects",
    },
    {
      title: "Status",
      dataIndex: "jobStatus",
      key: "jobStatus",
      render: (value: number | string) =>
        getEnumNameFromValue(value, StatusEnum),
    },
    {
      title: "Actions",
      dataIndex: "action",
      key: "action",
      description: "Edit Job Details",
      render: (e: any, rowData: any) => (
        <Space>
          <a href="#" onClick={() => onClickEditJob(rowData.jobId)}>
            <EditOutlined />
          </a>
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

  const filterConfig: FilterConfig[] = [
    { key: "dateRange", type: "date" },
    {
      key: "dept",
      type: "select",
      options: deptList,
      placeholder: "Department",
    },
    {
      key: "employeeId",
      type: "select",
      options: employeeOption,
      placeholder: "Employee",
    },
    {
      key: "jobStatus",
      type: "select",
      options: Object.values(StatusEnum).map((status) => ({
        label: status.name,
        value: status.value,
      })),
      placeholder: "Job Status",
    },
    // Add more filter configurations as needed
  ];

  const filteredData = rowData
    .filter((row: any) => {
      // Check each filter condition
      const dateRangeCondition =
        filters.dateRange.length === 0 ||
        (row.startDate >= filters.dateRange?.[0] &&
          row.startDate <= filters.dateRange?.[1]);

      const deptCondition =
        !filters.dept || row.departmentId.includes(filters.dept);

      const employeeCondition =
        !filters.employeeId || row.employeeId === filters.employeeId;

      const jobStatus =
        !filters.jobStatus || row.jobStatus == filters.jobStatus;

      // Return true if all conditions are met
      return (
        dateRangeCondition && deptCondition && employeeCondition && jobStatus
      );
    })
    ?.map((data: Record<string, any>) => ({ ...data, key: data.jobId }));

  const handleDownload = async () => {
    try {
      await jobService.downloadExcel();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFilter = (data: any) => {
    setFilters({
      dateRange: data.dateRange || [],
      employeeId: data.employeeId || "",
      dept: data.dept || "",
      jobStatus: data.jobStatus || "",
    });
  };

  const handelUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileList(e.target.files);
    loading(10, true);

    const response = await jobService.importJobExcel(e.target.files);
    if (response.status === 400) {
      message.error("Something Went Wrong");
    } else {
      dispatch<any>(jobService.fetchJobsList());
      message.success(response.data.message);
    }

    loading(10, false);
    e.target.value = "";
  };

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

  const downloadTxtFile = async () => {
    const response = await jobService.downloadExcel();
  };

  const expendableRows = (record: any) => {
    const country = countries?.find((c) => c.code === record?.countryName);
    const account = getEnumNameFromValue(record.accountTypes, AccountTypes);
    const contractType = getEnumNameFromValue(record.contracType, ContractType);
    const billingType = getEnumNameFromValue(record.billingType, BillingTypes);
    const billingStatus = getEnumNameFromValue(
      record.billingStatus,
      ContractStatus
    );
    const weeklyHours = record.weeklyHours?.replace(".", ":");
    let startDate;
    if (record && record.startDate) {
      startDate = moment(record.startDate).format("DD MMMM YYYY");
    } else {
      startDate = "N/A";
    }

    return (
      <Row style={{ padding: 20 }} gutter={[16, 16]}>
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <b>Communication Mode: </b> {record.communicationMode}
            </Col>
            <Col span={8}>
              <b>Client Name:</b> {record.clientName}
            </Col>
            <Col span={8}>
              <b>Contract Name:</b> {record.projectName}
            </Col>
            <Col span={8}>
              <b>Country:</b> {country ? country.label : "N/A"}
            </Col>
            <Col span={8}>
              <b>Job Description:</b> {record.jobdescription}
            </Col>
          </Row>
          <Divider />
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <b>Account Type:</b>
              {account}
            </Col>
            <Col span={8}>
              <b>Contract Type: </b>
              {contractType}
            </Col>
            <Col span={8}>
              <b>Billing Type: </b>
              {billingType}
            </Col>
            <Col span={8}>
              <b>Contract Status: </b>
              {billingStatus}
            </Col>
          </Row>
          <Divider />
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <b>Weekly Hours: </b> {weeklyHours}
            </Col>
            <Col span={8}>
              <b>Start Date: </b> {startDate}
            </Col>
          </Row>
          <Divider />
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <b>Job Url: </b>
              {record.jobUrl}
            </Col>
            <Col span={16}>
              <b>Project Url: </b>
              {record.projectUrl}
            </Col>
          </Row>
        </Col>
      </Row>
    );
  };

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
        <Col span={24}>
          {(userInfo?.role === RoleEnum.BDM.name ||
            userInfo?.role === RoleEnum.BD.name ||
            userInfo?.role === RoleEnum.Admin.name) &&
            pathName === DeptEnum.business_Developement.name && (
              <>
                <Row
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    gap: "20px",
                  }}
                >
                  <Col span={22}>
                    <GlobalFilter
                      filterConfig={filterConfig}
                      onFilterChange={handleFilter}
                    />
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      onClick={() => refFile?.current.click()}
                    >
                      <input
                        ref={refFile}
                        id="file"
                        type="file"
                        hidden
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={(e) => {
                          handelUploadFile(e);
                        }}
                      />
                      Upload File
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      shape="round"
                      icon={<DownloadOutlined />}
                      size={size}
                      onClick={downloadTxtFile}
                    >
                      Download Sample
                    </Button>
                  </Col>
                  {/* <Button
                  type="primary"
                  shape="round"
                  icon={<DownloadOutlined />}
                  size={size}
                  onClick={handleDownload}
                >
                  Download
                </Button> */}
                </Row>
              </>
            )}
        </Col>
        <Col span={24}>
          <Card
            bordered={false}
            className="criclebox tablespace mb-24"
            title={`Job List`}
          >
            <div className="table-responsive">
              <SkeletonTable
                columns={columns as SkeletonTableColumnsType[]}
                active
              >
                <Table
                  showHeader
                  columns={columns}
                  dataSource={filteredData}
                  size="small"
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
        style={{ textAlign: "center", paddingBottom: "30px" }}
        width={"80%"}
        open={isOpenEditModal}
        destroyOnClose
        title="Edit Job"
        onCancel={handleCloseEditModal}
        footer={null}
      >
        <EditJob
          {...props}
          handleCloseDialog={handleCloseEditModal}
          isOpen={isOpenEditModal}
          jobData={editRow}
          // deptFilter={deptFilter}
        />
      </Modal>
    </>
  );
};

export default JobList;
