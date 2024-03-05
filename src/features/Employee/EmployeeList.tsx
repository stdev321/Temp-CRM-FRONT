import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  empSelector,
  isLoadingSelector,
} from "../../Selectors/employeeSelector";
import { deptSelector } from "../../Selectors/departmentSelector";
import {
  Col,
  Row,
  Table,
  Card,
  message,
  Button,
  Modal,
  Select,
  Space,
  Tooltip,
  Divider,
} from "antd";
import empService from "../../services/empRequest";
import { PATH_NAME, USER_ROLE } from "../../Config";
import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import SkeletonTable from "../../Layout/SkeletonTable";
import { SkeletonTableColumnsType } from "../../Layout/SkeletonTable/SkeletonTable";
import AddEmployee from "./AddEmployee";
import authService from "../../services/authServices";
import { useNavigate } from "react-router-dom";
import EditEmployee from "./EditEmployee";
import { GenderEnum, RoleEnum } from "./EmployeeModel";
import dayjs from "dayjs";

interface DataType {
  key: string;
  firstName: string;
  lastName: string;
  address: string;
  gender?: string;
  email: string;
  mobileNo: string;
  role?: string;
  joiningDate?: string;
  departmentId: string;
  assignedTo?: string | null;
  employeeNumber: string;
  profilePicture?: string;
  casualLeaves?: string;
  sickLeaves?: string;
  aadharNumber?: string;
}

interface Props {
  loading: (progress: number, value: boolean) => void;
}

const EmployeeList = (props: Props) => {
  // Required Selectors
  const { loading } = props;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const empData = useSelector(empSelector);
  const deptData = useSelector(deptSelector);
  const isLoadingEmp = useSelector(isLoadingSelector);
  const btnRole = authService.getRole();

  // Required UseStates
  const [rowData, setRowData] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);
  const [selectUser, setSelectUser] = useState(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<any>([]);
  const [filters, setFilters] = useState({
    dateRange: [],
    dept: "",
    assignTo: "",
    health: "",
    status: "",
  });

  // Required UseEffect
  useEffect(() => {
    if (empData !== null && deptData !== null) {
      loading(100, false);
      const rows = empData.map((emp: any, index: number) => ({
        key: index,
        employeeId: emp.employeeId,
        employeeName: `${emp.firstName} ${emp.lastName ? emp.lastName : ""}`,
        address: emp.address,
        gender: emp.gender,
        email: emp.email,
        mobileNo: emp.mobileNo,
        role: emp.role,
        joiningDate: emp.joiningDate,
        departmentId: emp.departmentId,
        assignedTo: emp.assignedTo,
        employeeNumber: emp.employeeNumber,
        profilePicture: emp.profilePicture,
        casualLeaves: emp.casualLeaves,
        sickLeaves: emp.sickLeaves,
        employeeTargetedHours: emp.employeeTargetedHours,
        aadharNumber: emp.aadharNumber,
      }));
      setRowData(rows);
    }
  }, [dispatch, empData, deptData]);

  // Selective Options
  const deptList = deptData?.map((item: any) => {
    return { label: item.departmentName, value: item.departmentId };
  });

  const employeeOptions = empData?.map((item: any) => {
    return {
      label: `${item.firstName} ${item.lastName === null ? "" : item.lastName}`,
      value: item.employeeId,
    };
  });

  // Other Workings

  const onClickEditEmployee = async (employeeId: any) => {
    setEditRow(null);
    const response = await empService.fetchEmpById(employeeId);
    setEditRow({
      ...response?.data.employeeModel,
      role: getEnumNameFromValue(response?.data.employeeModel.role, RoleEnum),
    });
    setIsOpenEdit(true);
  };

  const showDeleteModal = (employeeId: string) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this employee?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        const response = await empService.deleteEmployee(employeeId);
        if (response.status === 200) {
          message.success(response.data.message);
          dispatch<any>(empService.fetchEmpList());
        } else {
          message.error(response.data.message);
        }
      },
    });
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

  const columns: any = [
    {
      title: "ID",
      dataIndex: "employeeNumber",
      key: "employeeNumber",
      width: 50,
      render: (employeeNumber: string) => employeeNumber?.substring(0, 12),
    },
    {
      title: "Name",
      dataIndex: "employeeName",
      key: "employeeName",
      width: 50,
      render: (employeeName: string) => employeeName?.substring(0, 20),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: 50,
      render: (address: string) => address?.substring(0, 25),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 50,
      render: (email: string) => email?.substring(0, 20),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 50,
      render: (value: number) => getEnumNameFromValue(value, RoleEnum),
    },
    {
      title: "Mobile No",
      dataIndex: "mobileNo",
      key: "mobileNo",
      width: 50,
      render: (mobileNo: string) => mobileNo?.substring(0, 12),
    },
    {
      title: "Targeted Hours",
      dataIndex: "employeeTargetedHours",
      key: "employeeTargetedHours",
      render: (employeeTargetedHours: string) =>
        employeeTargetedHours?.toString().replace(".", ":"),
      width: 50,
    },
    {
      title: "Actions",
      dataIndex: "action",
      key: "action",
      width: 50,
      description: "Edit and Remove Expense Category",
      render: (e: any, rowData: any) => (
        <Space>
          <Tooltip title="Edit Employee">
            <Button
              type="link"
              onClick={() => onClickEditEmployee(rowData.employeeId)}
            >
              <EditOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="Delete Employee">
            <Button
              type="link"
              onClick={() => showDeleteModal(rowData.employeeId)}
            >
              <DeleteOutlined style={{ color: "red" }} />
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

  const handleConfirmationProceed = async () => {
    if (!selectUser) return message.error("Please Select an Employee");
    try {
      setIsImpersonateOpen(false);
      message.destroy();
      loading(10, true);
      const impersonator = JSON.parse(authService.getUser());
      const response = await empService.impersonateEmployee(
        selectUser,
        impersonator?.employeeId
      );
      if (response.data.success) {
        authService.setSession("impersonating", "true");
        authService.setSession("impersonator", impersonator?.employeeId);
        authService.setSession("accessToken", response.data.api_token);
        authService.setSession("user", JSON.stringify(response.data.user));
        authService.setSession("role", response.data.user.role);

        if (authService.getRole() === "TeamLead") {
          loading(100, false);
          navigate(PATH_NAME.DASHBOARD);
        } else if (authService.getRole() === "Admin") {
          loading(100, false);
          navigate(PATH_NAME.DASHBOARD);
        } else if (authService.getRole() === "HR") {
          loading(100, false);
          navigate(PATH_NAME.DASHBOARD);
        } else if (authService.getRole() === "BD") {
          loading(100, false);
          navigate(PATH_NAME.DASHBOARD);
        } else if (authService.getRole() === "BDM") {
          loading(100, false);
          navigate(PATH_NAME.DASHBOARD);
        } else {
          loading(100, false);
          navigate(PATH_NAME.DASHBOARD);
        }
        window.location.reload();
      } else {
        navigate(PATH_NAME.LOGIN);
        message.error("Error", response.data.message);
      }
    } catch (error) {
      console.log(error);
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
    }
  };

  const filteredData = rowData.filter((row: any) => {
    // Check each filter condition
    const dateRangeCondition =
      filters.dateRange.length === 0 ||
      (row.startDate >= filters.dateRange[0] &&
        row.startDate <= filters.dateRange[1]);

    const deptCondition =
      !filters.dept || row.departmentId.includes(filters.dept);

    const assignToCondition =
      !filters.assignTo || row.employeeId === filters.assignTo;

    const healthCondition =
      !filters.health || row.projectHealthRate === filters.health;

    const statusCondition =
      !filters.status || row.billingStatus == filters.status;

    // Return true if all conditions are met
    return (
      dateRangeCondition &&
      deptCondition &&
      assignToCondition &&
      healthCondition &&
      statusCondition
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
    const deptName = deptList?.find(
      (item: any) => item.value === record.departmentId
    );

    const assignToName = employeeOptions?.find(
      (item: any) => item.value === record.assignedTo
    );

    const genderName = getEnumNameFromValue(record.gender, GenderEnum);
    const joiningDate = dayjs(record.joiningDate).format("DD MMMM YYYY");

    return (
      <Row style={{ padding: 20 }} gutter={[16, 16]}>
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <b>Department Name:</b> {deptName.label}
            </Col>
            <Col span={16}>
              <b>Address:</b> {record.address}
            </Col>
            <Col span={8}>
              <b>Assigned To:</b> {assignToName?.label}
            </Col>
          </Row>
          <Divider />
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <b>Email:</b> {record.email}
            </Col>
            <Col span={6}>
              <b>Gender:</b> {genderName}
            </Col>
            <Col span={6}>
              <b>Total Leaves: CL:</b> {record.casualLeaves}, <b>SL:</b>{" "}
              {record.sickLeaves}
            </Col>
            <Col span={6}>
              <b>Joining date:</b> {joiningDate}
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
          <Row
            gutter={[16, 16]}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Col span={12}>
              <Row gutter={[16, 16]}>
                <Col>
                  <Select
                    style={{ width: 200 }}
                    showSearch
                    placeholder="Department"
                    size="large"
                    allowClear
                    options={deptList}
                    onChange={(_, value) => filterTableData("dept", value)}
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
                    showSearch
                    placeholder="Search Employee"
                    size="large"
                    allowClear
                    options={employeeOptions}
                    onChange={(_, value) => filterTableData("assignTo", value)}
                    optionFilterProp="children"
                    filterOption={(input: any, option: any) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                </Col>
              </Row>
            </Col>
            <Col span={12} style={{ display: "flex", justifyContent: "end" }}>
              <Col>
                {btnRole === USER_ROLE.ADMIN ? (
                  <Button onClick={() => setIsImpersonateOpen(true)}>
                    <span>
                      <UserSwitchOutlined />
                    </span>
                    Impersonate User
                  </Button>
                ) : null}
              </Col>
              <Col>
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  size="large"
                  onClick={() => {
                    setIsOpenAdd(true);
                  }}
                >
                  Add Employee
                </Button>
              </Col>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Card
            bordered={false}
            className="criclebox tablespace mb-24"
            title={`Employee List`}
          >
            <div className="table-responsive">
              <SkeletonTable
                columns={columns as SkeletonTableColumnsType[]}
                loading={isLoadingEmp}
                active
              >
                <Table
                  showHeader
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
        className="centered-text"
        centered
        width={800}
        open={isOpenEdit}
        title="Edit Employee Details"
        onCancel={() => setIsOpenEdit(false)}
        footer={null}
        destroyOnClose
      >
        <EditEmployee
          handleCloseDialog={() => setIsOpenEdit(false)}
          isOpen={false}
          rowData={editRow}
        />
      </Modal>
      <Modal
        className="centered-text"
        centered
        title="Impersonate User"
        open={isImpersonateOpen}
        onCancel={() => {
          setIsImpersonateOpen(false);
          setSelectUser(null);
        }}
        onOk={handleConfirmationProceed}
        cancelButtonProps={{ danger: true }}
        destroyOnClose
      >
        <Row gutter={[16, 16]}>
          <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
            <Select
              style={{ width: "100%" }}
              showSearch
              size="large"
              placeholder="Select An Employee"
              onChange={(_, value) => setSelectUser(value.value)}
              options={employeeOptions}
              optionFilterProp="children"
              filterOption={(input: any, option: any) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Col>
        </Row>
      </Modal>
      <Modal
        className="centered-text"
        centered
        width={800}
        open={isOpenAdd}
        title="Create Employee"
        onCancel={() => setIsOpenAdd(false)}
        footer={null}
        destroyOnClose
      >
        <AddEmployee handleCloseDialog={() => setIsOpenAdd(false)} />
      </Modal>
    </>
  );
};

export default EmployeeList;
