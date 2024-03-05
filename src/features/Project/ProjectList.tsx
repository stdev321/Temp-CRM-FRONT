import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  projectSelector,
  isLoadingSelector as isLoadingProject,
} from "../../Selectors/projectSelector";
import {
  Col,
  Row,
  Table,
  Card,
  Space,
  Modal,
  Button,
  Tooltip,
  message,
  DatePicker,
  Select,
  Divider,
  Switch,
} from "antd";
import SkeletonTable from "../../Layout/SkeletonTable";
import { SkeletonTableColumnsType } from "../../Layout/SkeletonTable/SkeletonTable";
import { useLocation } from "react-router-dom";
import marketplace from "../../services/marketPlaceAccountRequest";
import { empSelector } from "../../Selectors/employeeSelector";
import { marketPlaceAccountSelector } from "../../Selectors/marketPlaceAccountSelector";
import { clientSelector } from "../../Selectors/clientSelector";
import {
  EditOutlined,
  PlusOutlined,
  HistoryOutlined,
  CheckCircleTwoTone,
  WarningOutlined,
  ExclamationCircleOutlined,
  LikeOutlined,
  InfoCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import authService from "../../services/authServices";
import EditProject from "./EditProject";
import {
  AccountTypes,
  ContractStatus,
  ContractType,
  ProjectStatus,
} from "../../Enums/LeadsConnect/BillingStatus";
import { countries } from "../../Helper/countries";
import AddProject from "./AddProject";
import clientService from "../../services/clientRequest";
import projectService from "../../services/projectRequest";
import { DeptEnum } from "../../Enums/DeptEnum/DeptEnum";
import ProjectHistory from "./ProjectHistory";
import { RoleEnum } from "../Employee/EmployeeModel";
import moment from "moment";
import { handleCopyToClipboard } from "../../Helper/CopyToClipBoard";
import { pageLocation } from "../../Helper/GetLocation";
import { deptSelector } from "../../Selectors/departmentSelector";
import dayjs from "dayjs";
import { Key } from "antd/lib/table/interface";
import deptService from "../../services/deptRequest";

interface DataType {
  id: String;
  contractName: String;
  assignedTo: String;
  upWorkId: String;
  startDate: String;
  projectUrl: String;
  projectHealthRate: String;
  billingHours: String;
  billingStatus: String;
  clientId: String;
  country: String;
  contractType: String;
  selectedDeptName: String;
  employeeId: string;
}

interface Props {
  loading: (progress: number, value: boolean) => void;
}

const ProjectList = (props: Props & { isEditing: boolean }) => {
  // Main Pages ===========
  const { loading, isEditing } = props;
  const location = useLocation();
  const dispatch = useDispatch();
  const userInfo: any = JSON.parse(authService.getUser());
  const projectData = useSelector(projectSelector);
  const loadingProjects = useSelector(isLoadingProject);
  const marketPlaceAccounts = useSelector(marketPlaceAccountSelector);
  const empData = useSelector(empSelector);
  const clientData = useSelector(clientSelector);
  const deptData = useSelector(deptSelector);

  // Other UseStates ===================
  const [isOpen, setIsOpen] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [deptFilter, setDeptFilter] = useState<any>();
  const [pathName, setPathName] = useState<any>();
  const [copiedRowIndex, setCopiedRowIndex] = useState<number | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<any>([]);
  const [filters, setFilters] = useState({
    dateRange: [],
    dept: "",
    assignTo: "",
    health: "",
    status: "",
    client: "",
  });
  const [showOnlyActiveProjects, setShowOnlyActiveProjects] = useState(false);

  // Option Menus ======================
  const healthMenu = [
    {
      label: (
        <>
          <LikeOutlined style={{ fontSize: "20px", color: " green" }} /> Good
        </>
      ),
      value: 1,
    },
    {
      label: (
        <>
          <WarningOutlined style={{ fontSize: "20px", color: "yellow" }} /> Avg
        </>
      ),
      value: 2,
    },
    {
      label: (
        <>
          <ExclamationCircleOutlined
            style={{ fontSize: "20px", color: "red" }}
          />{" "}
          Danger
        </>
      ),
      value: 3,
    },
  ];

  // UseEffects ========================
  // Department get by Filter

  useEffect(() => {
    // if (location) {
    const pathnames = pageLocation(location.pathname);
    setPathName(pathnames?.pathName);
    setDeptFilter(pathnames?.deptFilter);
    // }
  }, [location]);

  // Initial values for
  useEffect(() => {
    if (deptFilter) {
      dispatch<any>(projectService.fetchProjectList(deptFilter));
    }
  }, [dispatch, deptFilter]);

  useEffect(() => {
    if (!deptData) {
      dispatch<any>(deptService.fetchDepartmentList());
    }
  }, [dispatch, deptData]);

  useEffect(() => {
    if (userInfo.role === RoleEnum.Employee.name) {
      dispatch<any>(projectService.fetchProjectList());
    }
  }, [dispatch, userInfo.role]);

  useEffect(() => {
    if (!marketPlaceAccounts) {
      dispatch<any>(marketplace.fetchMarketPlaceAccountList());
    }
  }, [marketPlaceAccounts]);

  useEffect(() => {
    if (!clientData) {
      dispatch<any>(clientService.fetchClientList());
    }
  }, [clientData]);

  useEffect(() => {
    if (
      projectData !== null &&
      marketPlaceAccounts !== null &&
      empData !== null &&
      clientData !== null
    ) {
      loading(100, false);
      const rows = projectData.map((project: any, index: number) => ({
        key: index,
        id: project.id,
        contractName: project.contractName,
        upworkId: project.upworkId,
        projectUrl: project.projectUrl,
        clientId: project.clientId,
        clientName: project.clientName,
        country: project.country,
        contractType: project.contractType,
        hoursPerWeek: project.hoursPerWeek,
        departmentId: project.departmentId,
        employeeId: project.employeeId,
        upworkName: project.upworkName ?? project.hiredProfile,
        hiredId: project.hiredId,
        hiredProfile: project.hiredProfile,
        communicationId: project.communicationId,
        communicationName: project.communicationName,
        communicationMode: project.communicationMode,
        billingStatus: project.billingStatus,
        startDate: project.startDate,
        projectHealthRate: project.projectHealthRate,
        accounts: project.accounts,
        endDate: project.endDate,
        billableHours: project.billableHours,
      }));
      setRowData(rows);
    }
  }, [dispatch, projectData, clientData, empData, marketPlaceAccounts]);

  // Selective Options

  const projectStatus = Object.values(ContractStatus).map((item: any) => {
    return { label: item.name, value: item.value };
  });

  const assignToOption = empData
    ?.filter((item: any) => {
      // Assuming userRole and user.departmentId are available
      if (userInfo.role === RoleEnum.TeamLead.name) {
        return item.departmentId === userInfo.departmentId;
      }
      return true; // If user is not a team lead, include all employees
    })
    .map((item: any) => {
      return {
        label: `${item.firstName} ${
          item.lastName === null ? "" : item.lastName
        }`,
        value: item.employeeId,
      };
    });

  const deptList = deptData?.map((item: any) => {
    return { label: item.departmentName, value: item.departmentId };
  });

  const employeeList = empData?.map((item: any) => {
    return {
      label: item.firstName + " " + item.lastName,
      value: item.employeeId,
    };
  });

  const clientList = clientData?.map((item: any) => {
    return {
      label: item.clientName,
      value: item.clientId,
    };
  });

  const contractOptions = projectData?.map((item: any) => {
    return {
      label: item.contractName,
      value: item.id,
    };
  });

  // Other Workings

  const onClickEditProject = async (projectId: any) => {
    loading(10, false);
    setEditRow(null);
    const response = await projectService.getProjectById(projectId);
    if (response.error) {
      message.error("Something Went Wrong");
      loading(100, false);
    } else {
      setEditRow({
        ...response?.project,
      });
      setIsOpenEditModal(true);
      loading(100, false);
    }
  };

  const showHistoryModal = async (projectId: any) => {
    setEditRow(null);
    const response = await projectService.getProjectHIstory(projectId);

    setIsHistoryModalVisible(true);
    setEditRow(response);
  };

  const handleCloseProjectHistory = () => {
    setIsHistoryModalVisible(false);
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

  const profileList = marketPlaceAccounts?.map((item: any) => {
    return { label: item.name, value: item.id };
  });

  const contractStatus = Object.values(ContractType).map((item: any) => {
    return { label: item.name, value: item.value };
  });

  const contractType = Object.values(ContractStatus).map((item: any) => {
    return { label: item.name, value: item.value };
  });

  const columns = [
    {
      title: userInfo?.role !== RoleEnum.Employee.name ? "Health Rate" : null,
      dataIndex: "projectHealthRate",
      key: "projectHealthRate",
      width: 10,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div style={{ padding: 8 }}>
          <Select
            placeholder="Health"
            showSearch
            value={selectedKeys[0]}
            options={healthMenu}
            onChange={(value) => setSelectedKeys(value ? [value] : [])}
            style={{ width: 188, marginBottom: 8, display: "block" }}
            filterOption={(input: any, option: any) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </div>
      ),

      filterIcon: (filtered: any) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),

      onFilter: (value: string | boolean | Key, record: any) => {
        if (typeof value === "number" && Number.isInteger(value)) {
          return record.projectHealthRate === value;
        }
        // Handle other cases if necessary
        return false; // Default return value if value is not a string
      },

      render: (e: any, param: any) => {
        if (userInfo?.role !== RoleEnum.Employee.name) {
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
        }
      },
    },
    {
      title: "Name",
      dataIndex: "contractName",
      key: "contractName",
      width: 50,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div style={{ padding: 8 }}>
          <Select
            placeholder="Search Contracts"
            showSearch
            value={selectedKeys[0]}
            options={contractOptions}
            onChange={(value) => setSelectedKeys(value ? [value] : [])}
            style={{ width: 188, marginBottom: 8, display: "block" }}
            filterOption={(input: any, option: any) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </div>
      ),

      filterIcon: (filtered: any) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),

      onFilter: (value: string | boolean | Key, record: any) => {
        if (typeof value === "string") {
          return record.id === value;
        }
        // Handle other cases if necessary
        return false; // Default return value if value is not a string
      },
      render: (text: any, record: any) =>
        `${record.contractName} - ${record.clientName}`,
    },
    {
      title: "Upwork Hired Id",
      dataIndex: "upworkName",
      key: "upworkName",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div style={{ padding: 8 }}>
          <Select
            placeholder="Search Hired Profile"
            showSearch
            value={selectedKeys[0]}
            options={profileList}
            onChange={(value) => setSelectedKeys(value ? [value] : [])}
            style={{ width: 188, marginBottom: 8, display: "block" }}
            filterOption={(input: any, option: any) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </div>
      ),

      filterIcon: (filtered: any) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),

      onFilter: (value: string | boolean | Key, record: any) => {
        if (typeof value === "string") {
          return record.upworkId === value;
        }
        // Handle other cases if necessary
        return false; // Default return value if value is not a string
      },
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: moment.MomentInput) => moment(date).format("DD MMMM YYYY"),
    },
    {
      title: "Department Name",
      dataIndex: "departmentId",
      key: "departmentId",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div style={{ padding: 8 }}>
          <Select
            placeholder="Department"
            showSearch
            value={selectedKeys[0]}
            options={deptList}
            onChange={(value) => setSelectedKeys(value ? [value] : [])}
            style={{ width: 188, marginBottom: 8, display: "block" }}
            filterOption={(input: any, option: any) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </div>
      ),

      filterIcon: (filtered: any) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),

      onFilter: (value: string | boolean | Key, record: any) => {
        if (typeof value === "string") {
          return record.departmentId?.includes(value);
        }
        // Handle other cases if necessary
        return false; // Default return value if value is not a string
      },
      render: (value: string) => (
        <Tooltip
          title={
            deptList &&
            deptList
              .filter((item: any) => {
                return value.includes(item.value);
              })
              .map((item: any) => item.label)
              .join(", ")
          }
        >
          {deptList
            .filter((item: any) => {
              return value.includes(item.value);
            })
            .map((item: any) => item.label)
            .join(", ")}
        </Tooltip>
      ),
    },
    {
      title: "Billing Hours",
      dataIndex: "hoursPerWeek",
      key: "hoursPerWeek",
      render: (value: string) => value?.replaceAll(".", ":"),
    },
    {
      title: "Billable Hours",
      dataIndex: "billableHours",
      key: "billableHours",
    },
    {
      title: userInfo?.role !== RoleEnum.Employee.name ? "Actions" : undefined,
      dataIndex: "action",
      key: "action",
      description: "Edit Project",
      render: (e: any, rowData: any) =>
        userInfo?.role !== RoleEnum.Employee.name ? (
          <Space>
            <Tooltip title="Edit Project">
              <Button
                type="link"
                onClick={() => onClickEditProject(rowData.id)}
                disabled={isEditing}
              >
                <EditOutlined />
              </Button>
            </Tooltip>
            <Tooltip title="Project History">
              <Button type="link" onClick={() => showHistoryModal(rowData.id)}>
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
        ) : null,
    },
  ];

  const filterTableData = (type: any, data: any) => {
    switch (type) {
      case "dept":
        setFilters({
          ...filters,
          dept: data?.value,
        });
        break;
      case "dateRange":
        setFilters({
          ...filters,
          dateRange: data?.filter(Boolean),
        });
        break;
      case "assignTo":
        setFilters({
          ...filters,
          assignTo: data?.value,
        });
        break;
      case "healthMenu":
        setFilters({
          ...filters,
          health: data?.value,
        });
        break;
      case "Status":
        setFilters({
          ...filters,
          status: data?.value,
        });
        break;
      case "client":
        setFilters({
          ...filters,
          client: data?.value,
        });
    }
  };

  const filteredData = rowData?.filter((row: any) => {
    // Check each filter condition
    const dateRangeCondition =
      filters.dateRange.length === 0 ||
      (row.startDate >= filters.dateRange[0] &&
        row.startDate <= filters.dateRange[1]);

    const deptCondition =
      !filters.dept || row.departmentId.includes(filters.dept);

    const assignToCondition =
      !filters.assignTo || row.employeeId.includes(filters.assignTo);

    const healthCondition =
      !filters.health || row.projectHealthRate === filters.health;

    const statusCondition =
      !filters.status || row.billingStatus === filters.status;

    const clientCondition = !filters.client || row.clientId === filters.client;
    const activeProjectCondition = !showOnlyActiveProjects || !row.endDate;

    // Return true if all conditions are met
    return (
      dateRangeCondition &&
      deptCondition &&
      assignToCondition &&
      healthCondition &&
      statusCondition &&
      clientCondition &&
      activeProjectCondition
    );
  });

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

  const expendableRows = (record: any) => {
    const deptName = deptList
      ?.filter((item: any) => {
        return record.departmentId.includes(item.value);
      })
      .map((item: any) => item.label);

    const countryName = countries
      ?.filter((item: any) => {
        return item.code === record.country;
      })
      .map((item: any) => item.label);

    const employeName = employeeList
      ?.filter((item: any) => {
        return record.employeeId.includes(item.value);
      })
      .map((item: any) => item.label);

    const endDate = moment(record.endDate).format("DD MMMM YYYY");

    const accountType = getEnumNameFromValue(record.accounts, AccountTypes);

    const billingStatus = getEnumNameFromValue(
      record.billingStatus,
      ContractStatus
    );

    const contractType = getEnumNameFromValue(
      record.contractType,
      ContractType
    );

    return (
      <Row style={{ padding: 20 }} gutter={[16, 16]}>
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <b>Department Name:</b> {deptName.join(", ")}
            </Col>
            <Col span={8}>
              <b>Communication Mode:</b> {record.communicationMode}
            </Col>
            <Col span={8}>
              <b>Assigned To:</b> {employeName.join(", ")}
            </Col>
          </Row>
          <Divider />
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <b>Website URL:</b> {record.projectUrl}
            </Col>
            <Col span={6}>
              <b>Country:</b> {countryName}
            </Col>
            <Col span={6}>
              <b>Account Type:</b> {accountType}
            </Col>
            <Col span={6}>
              <b>End date:</b> {!record.endDate ? "" : endDate}
            </Col>
            <Col span={8}>
              <b>Contract Type :</b> {billingStatus}
            </Col>

            <Col span={8}>
              <b>Contract Status :</b> {contractType}
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
            userInfo?.role === RoleEnum.Admin.name ||
            userInfo?.role === RoleEnum.TeamLead.name) && (
            <>
              <Row style={{ display: "flex", justifyContent: "space-between" }}>
                <Col span={20}>
                  <Row
                    gutter={[16, 16]}
                    style={{ display: "flex", flexDirection: "row" }}
                  >
                    <Col span={5}>
                      <DatePicker.RangePicker
                        style={{ width: "100%", maxWidth: "400px" }}
                        size="large"
                        allowClear
                        onChange={(_, value) =>
                          filterTableData("dateRange", value)
                        }
                      />
                    </Col>
                    <Col>
                      <Select
                        style={{ width: 200 }}
                        showSearch
                        placeholder="Assign to"
                        size="large"
                        allowClear
                        options={assignToOption}
                        onChange={(_, value) =>
                          filterTableData("assignTo", value)
                        }
                        optionFilterProp="children"
                        filterOption={(input: any, option: any) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Col>
                    <Col>
                      <Select
                        style={{ width: 200 }}
                        placeholder="Status"
                        size="large"
                        allowClear
                        options={projectStatus}
                        onChange={(_, value) =>
                          filterTableData("Status", value)
                        }
                      />
                    </Col>
                    {userInfo.role !== RoleEnum.TeamLead.name && (
                      <Col>
                        <Select
                          style={{ width: 250 }}
                          showSearch
                          placeholder="Search Client Projects"
                          size="large"
                          allowClear
                          options={clientList}
                          onChange={(_, value) =>
                            filterTableData("client", value)
                          }
                          optionFilterProp="children"
                          filterOption={(input: any, option: any) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        />
                      </Col>
                    )}
                  </Row>
                </Col>
                <Col>
                  <Button
                    icon={<PlusOutlined />}
                    type="primary"
                    size="large"
                    onClick={() => {
                      setIsOpen(true);
                    }}
                  >
                    Add Project
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </Col>

        <Col className="projectListWrap" span={24}>
          <Card
            bordered={false}
            className="criclebox tablespace  mb-24"
            title={`Project List`}
          >
            <div className="table-responsive">
              <SkeletonTable
                columns={columns as SkeletonTableColumnsType[]}
                loading={loadingProjects}
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
          <div className="switchModeWrap">
            <Tooltip title="Show Active projects when checked">
              <Switch
                defaultChecked={showOnlyActiveProjects}
                onChange={(checked) => setShowOnlyActiveProjects(checked)}
                disabled={
                  !showOnlyActiveProjects &&
                  filteredData.every((row: any) => row?.endDate === null)
                }
              />
            </Tooltip>
          </div>
        </Col>
      </Row>
      <Modal
        style={{ textAlign: "center", paddingBottom: "30px" }}
        width={800}
        open={isOpenEditModal}
        destroyOnClose
        title="Edit Project"
        onCancel={() => {
          setIsOpenEditModal(false);
        }}
        footer={null}
        maskClosable={false} // Set maskClosable to false
      >
        <EditProject
          {...props}
          handleCloseDialog={() => {
            setIsOpenEditModal(false);
          }}
          isOpen={isOpenEditModal}
          row={editRow}
          deptFilter={deptFilter}
          isEditing={isEditing}
        />
      </Modal>
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
      <Modal
        width={800}
        open={isOpen}
        destroyOnClose
        title="Create Project"
        style={{ textAlign: "center", paddingBottom: "30px" }}
        onCancel={() => {
          setIsOpen(false);
        }}
        footer={null}
      >
        <AddProject
          {...props}
          deptFilter={deptFilter}
          handleCloseDialog={() => {
            setIsOpen(false);
          }}
        />
      </Modal>
    </>
  );
};

export default ProjectList;
