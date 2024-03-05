import React, { Key, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import eodReportService from "../../services/eodReportRequest";
import {
  eodReportSelector,
  isLoadingSelector as isloadingReports,
} from "../../Selectors/eodReportSelector";
import {
  deptSelector,
  isLoadingSelector as isLoadingDept,
} from "../../Selectors/departmentSelector";
import {
  CheckOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Col,
  Row,
  Table,
  Card,
  Select,
  Button,
  Modal,
  Space,
  DatePicker,
  Divider,
  Tooltip,
  message,
  Popover,
} from "antd";
import moment, { Moment } from "moment";
import SkeletonTable from "../../Layout/SkeletonTable";
import { SkeletonTableColumnsType } from "../../Layout/SkeletonTable/SkeletonTable";
import AddEODREport from "./AddEODReport";
import authService from "../../services/authServices";
import { RoleEnum } from "../Employee/EmployeeModel";
import EditEODReport from "./EditEODReport";
import { empSelector } from "../../Selectors/employeeSelector";
import { pageLocation } from "../../Helper/GetLocation";
import { useLocation } from "react-router-dom";
import projectService from "../../services/projectRequest";
import { projectSelector } from "../../Selectors/projectSelector";
import { roleSelector } from "../../Selectors/authSelector";
import deptService from "../../services/deptRequest";
import dayjs, { Dayjs } from "dayjs";

interface RowData {
  employeeName: string;
  contractName: string;
  billingHours: number;
  employeeDelightHours: number;
  unbilledHours: number;
  isActive: boolean;
  projectHours: any;
  eodDate: any;
  remarks: any;
  role: string;
}

interface Props {
  loading: (progress: number, value: boolean) => void;
}

export default function EODReport(props: Props) {
  // Required Selectors
  const { loading } = props;
  const location = useLocation();
  const userInfo: any = JSON.parse(authService.getUser());
  const dispatch = useDispatch();
  const deptData = useSelector(deptSelector);
  const projectData = useSelector(projectSelector);
  const empData = useSelector(empSelector);
  const eodData = useSelector(eodReportSelector);
  const [items, setItems] = useState([]);
  const { MonthPicker } = DatePicker;

  // Required UseState

  const [deptFilter, setDeptFilter] = useState<any>("all");
  const [pathName, setPathName] = useState<any>();
  const [isAddOpen, setIsAddopen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<any>([]);
  const [editRow, setEditRow] = useState<any>();
  const [rowData, setRowData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: [],
    dept: "",
    employee: "",
  });

  // Required UseEffect

  useEffect(() => {
    dispatch<any>(projectService.getProjectByDept());
  }, [dispatch]);

  useEffect(() => {
    if (!deptData) {
      dispatch<any>(deptService.fetchDepartmentList());
    }
  }, [dispatch, deptData]);

  // useEffect(() => {
  //   if (projectData === null) {
  //     dispatch<any>(projectService.fetchProjectList());
  //   }
  // }, [dispatch, projectData]);

  useEffect(() => {
    // if (location) {
    const pathnames = pageLocation(location.pathname);
    setPathName(pathnames?.pathName);
    setDeptFilter(pathnames?.deptFilter);
    // }
  }, [location]);

  useEffect(() => {
    if (deptFilter !== "all") {
      dispatch<any>(
        eodReportService.fetchEodReportList(null, null, deptFilter)
      );
    }
    loading(100, false);
  }, [dispatch, deptFilter]);

  useEffect(() => {
    if (eodData !== null) {
      loading(100, false);
      const rows = eodData.map((eod: any, index: number) => {
        return { ...eod, key: index };
      });
      setRowData(rows);
    }
  }, [eodData]);

  // Selective Options

  const deptList = deptData?.map((item: any) => {
    return { label: item.departmentName, value: item.departmentId };
  });

  const empOption = empData
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

  const contractOptions = projectData
    ?.map((item: any) => {
      if (
        userInfo.role === RoleEnum.TeamLead.name &&
        item.departmentId.includes(userInfo.departmentId)
      ) {
        return {
          label: item.projectName,
          value: item.projectId,
        };
      } else if (userInfo.role !== RoleEnum.TeamLead.name) {
        return {
          label: item.projectName,
          value: item.projectId,
        };
      } else {
        return null; // Return null for items that don't match the criteria
      }
    })
    .filter(Boolean);

  // Other Workings

  const columns = [
    {
      title: "Employee Name",
      dataIndex: "employeeName",
      key: "employeeName",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div style={{ padding: 8 }}>
          <Select
            placeholder="Employees"
            showSearch
            value={selectedKeys[0]}
            options={empOption}
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

      onFilter: (value: string | boolean | Key, record: any) => {
        console.log(value);
        if (typeof value === "string") {
          return record.employeeId === value;
        }
        // Handle other cases if necessary
        return false; // Default return value if value is not a string
      },

      width: "15%",
    },
    {
      title: "Project Name",
      dataIndex: "projectHours",
      key: "projectHours",
      width: "15%",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div style={{ padding: 8 }}>
          <Select
            placeholder="Projects"
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

      onFilter: (value: string | boolean | Key, record: any) => {
        if (typeof value === "string") {
          return record.projectHours.find(
            (project: any, index: number) => project.projectId === value
          );
        }
        // Handle other cases if necessary
        return false; // Default return value if value is not a string
      },

      render: (projectHours: any) => (
        <>
          {projectHours.map((project: any, index: number) => (
            <span style={{ display: "block" }} key={index}>
              {project.projectName}
            </span>
          ))}
        </>
      ),
    },
    {
      title: "Project Billing",
      dataIndex: "projectHours",
      key: "projectHours",
      width: "10%",
      render: (projectHours: any) => (
        <>
          {projectHours.map((project: any, index: number) => (
            <span style={{ display: "block" }} key={index}>
              {project?.billingHours?.replace(".", ":")}
            </span>
          ))}
        </>
      ),
    },
    {
      title: "Delight Hours",
      dataIndex: "projectHours",
      key: "projectHours",
      width: "10%",
      render: (projectHours: any) => (
        <>
          {projectHours.map((project: any, index: number) => (
            <span style={{ display: "block" }} key={index}>
              {project?.employeeDelightHours?.replace(".", ":")}
            </span>
          ))}
        </>
      ),
    },
    {
      title: "Eod Date",
      dataIndex: "eodDate",
      key: "eodDate",
      width: "20%", // Adjust width as needed
      render: (eodDate: string[] | string) => {
        if (!eodDate) {
          return "N/A"; // Provide a fallback value if eodDate is null or undefined
        }

        if (userInfo?.role === RoleEnum.Admin.name) {
          if (Array.isArray(eodDate) && eodDate.length === 2) {
            return `${moment(eodDate[0])?.format("DD MMMM YYYY")} - ${moment(
              eodDate[1]
            )?.format("DD MMMM YYYY")}`;
          } else {
            return "N/A"; // Handle unexpected format of eodDate for admins
          }
        } else {
          return moment(eodDate[0])?.format("DD MMMM YYYY");
        }
      },
    },

    {
      title: "Actions",
      dataIndex: "action",
      key: "action",
      width: 100,
      description: "Edit EOD",
      render: (e: any, rowData: any) => {
        return (
          <>
            <Space>
              {userInfo?.role === RoleEnum.TeamLead.name &&
              rowData.isEditable ? (
                <Tooltip title="Approve EOD Report">
                  <Button
                    type="link"
                    onClick={() => approveEODReport(rowData.eodReportId)}
                  >
                    <CheckOutlined style={{ color: "green" }} />
                  </Button>
                </Tooltip>
              ) : null}
              {
                userInfo?.role !== RoleEnum.Admin.name &&
                  rowData.isEditable && (
                    // userInfo?.employeeId === rowData.employeeId ? (
                    <Tooltip title="Edit EOD">
                      <Button
                        type="link"
                        onClick={() => {
                          setEditRow(rowData);
                          setIsEditOpen(true);
                        }}
                      >
                        <EditOutlined style={{ color: "red" }} />
                      </Button>
                    </Tooltip>
                  )
                // ) : null}
              }
              <Tooltip title="information">
                <Button
                  type="link"
                  onClick={() =>
                    handleExpand(
                      !expandedRowKeys.includes(rowData.key),
                      rowData
                    )
                  }
                >
                  <InfoCircleOutlined />
                </Button>
              </Tooltip>
            </Space>
          </>
        );
      },
    },
  ];

  const approveEODReport = async (id: string) => {
    const response = await eodReportService.approveEodReport(id);
    if (response.status === 200) {
      message.success(response.data.message);
      dispatch<any>(
        eodReportService.fetchEodReportList(null, null, deptFilter)
      );
    } else {
      message.error(response.data.message);
    }
  };

  const handleMonthChange = async (value: Dayjs | null, dateString: string) => {
    try {
      // Dispatch loading action if needed
      loading(0, true);

      // Determine start and end dates of the selected month
      let startDate: Dayjs | null = null;
      let endDate: Dayjs | null = null;
      if (value) {
        startDate = dayjs(value).startOf("month");
        endDate = dayjs(value).endOf("month");
      }

      // Make API call passing the start and end dates
      dispatch<any>(
        eodReportService.fetchEodReportList(
          startDate ? startDate.format("YYYY-MM-DD") : null,
          endDate ? endDate.format("YYYY-MM-DD") : null,
          deptFilter
        )
      );
    } catch (error) {
      // Handle error if API call fails
      console.error("Error fetching EOD report:", error);
      // Dispatch loading action if needed
      loading(100, false);
      // Display error message to the user
      message.error("Failed to fetch EOD report. Please try again later.");
    }
  };

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
      case "employee":
        setFilters({
          ...filters,
          employee: data?.value,
        });
        break;
    }
  };

  const filteredData = rowData?.filter((row: any) => {
    // Check each filter condition
    const dateRangeCondition =
      filters.dateRange.length === 0 ||
      (row.eodDate >= filters.dateRange[0] &&
        row.eodDate <= filters.dateRange[1]);

    const deptCondition = !filters.dept || row.departmentId === filters.dept;

    const assignToCondition =
      !filters.employee || row.employeeId === filters.employee;

    // Return true if all conditions are met
    return dateRangeCondition && deptCondition && assignToCondition;
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

  const handleMoreClick = (item: { showPopup: boolean }) => {
    item.showPopup = true;
    setItems([...items]);
  };
  const handleCancel = (item: { showPopup: boolean }) => {
    item.showPopup = false;
    setItems([...items]);
  };
  const expendableRows = (record: any) => {
    // Pass isAdmin as a parameter
    return (
      <>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                {record.projectHours.map((item: any) => {
                  // Replace newline characters with <br> tags
                  const formattedRemarks = item.remarks?.replace(/\n/g, "<br>");

                  return (
                    <>
                      <Row gutter={[16, 16]}>
                        <Col span={6}>Project Name: {item.projectName}</Col>
                        <Col span={6}>
                          Employee Billing Hours:{" "}
                          {item.billingHours.replaceAll(".", ":")}
                        </Col>
                        <Col span={6}>
                          Employee Delight Hours:{" "}
                          {item.employeeDelightHours.replaceAll(".", ":")}
                        </Col>
                        <Row>
                          <Col span={24}>
                            {userInfo?.role !== RoleEnum.Admin.name && (
                              <>
                                {item.remarks?.length > 50 ? (
                                  <>
                                    Remark: {item.remarks.substring(0, 50)}{" "}
                                    <a onClick={() => handleMoreClick(item)}>
                                      more
                                    </a>
                                  </>
                                ) : (
                                  `Remark: ${item.remarks}`
                                )}
                                <Modal
                                  title="Remark"
                                  visible={item.showPopup}
                                  onCancel={() => handleCancel(item)}
                                  footer={null}
                                >
                                  {/* Render remarks with <br> tags */}
                                  <p
                                    dangerouslySetInnerHTML={{
                                      __html: formattedRemarks,
                                    }}
                                  />
                                </Modal>
                              </>
                            )}
                          </Col>
                        </Row>
                      </Row>
                      <Divider />
                    </>
                  );
                })}
              </Col>
            </Row>
          </Col>
        </Row>
      </>
    );
  };

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Row gutter={[16, 16]}>
                {userInfo?.role !== RoleEnum.Employee.name ? (
                  <>
                    <Col span={5}>
                      <MonthPicker
                        style={{ width: "100%", maxWidth: "400px" }}
                        size="large"
                        allowClear
                        onChange={handleMonthChange}
                      />
                    </Col>
                    {!deptFilter ? (
                      <Col span={5}>
                        <Select
                          style={{ width: "100%" }}
                          size="large"
                          showSearch
                          allowClear
                          placeholder="Department"
                          options={deptList}
                          optionFilterProp="children"
                          onChange={(_, value) =>
                            filterTableData("dept", value)
                          }
                          filterOption={(input: any, option: any) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        />
                      </Col>
                    ) : null}
                  </>
                ) : null}
                {userInfo?.role !== RoleEnum.Admin.name ? (
                  <Col
                    span={userInfo?.role === RoleEnum.Employee.name ? 24 : 19}
                    style={{ display: "flex", justifyContent: "end" }}
                  >
                    <Button
                      icon={<PlusOutlined />}
                      type="primary"
                      size="large"
                      onClick={() => {
                        setIsAddopen(true);
                      }}
                    >
                      Add EOD
                    </Button>
                    <Modal
                      width={700}
                      open={isAddOpen}
                      style={{ textAlign: "center", paddingBottom: "30px" }}
                      title="Add EOD"
                      destroyOnClose
                      onCancel={() => {
                        setIsAddopen(false);
                      }}
                      footer={null}
                    >
                      <AddEODREport
                        {...props}
                        handleCloseDialog={() => {
                          setIsAddopen(false);
                        }}
                      />
                    </Modal>
                  </Col>
                ) : null}
              </Row>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Card
            bordered={false}
            className="criclebox tablespace mb-24"
            title={`EOD Report`}
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
        centered
        destroyOnClose
        width={700}
        style={{ textAlign: "center", paddingBottom: "30px" }}
        open={isEditOpen}
        title="Edit EOD"
        onCancel={() => {
          setIsEditOpen(false);
        }}
        footer={null}
      >
        <EditEODReport
          {...props}
          handleCloseDialog={() => {
            setIsEditOpen(false);
          }}
          rowData={editRow}
        />
      </Modal>
    </>
  );
}
