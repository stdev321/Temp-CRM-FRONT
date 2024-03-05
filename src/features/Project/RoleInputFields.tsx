import {
  Col,
  DatePicker,
  Divider,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
} from "antd";
import { USER_ROLE } from "../../Config";
import {
  ExclamationCircleOutlined,
  LikeOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  AccountTypes,
  BillingTypes,
  ContractStatus,
  ContractType,
  ProjectStatus,
} from "../../Enums/LeadsConnect/BillingStatus";
import { useSelector } from "react-redux";
import { empSelector } from "../../Selectors/employeeSelector";
import { deptSelector } from "../../Selectors/departmentSelector";
import { clientSelector } from "../../Selectors/clientSelector";
import { marketPlaceAccountSelector } from "../../Selectors/marketPlaceAccountSelector";
import authService from "../../services/authServices";
import { useEffect, useState } from "react";
import { RoleEnum } from "../Employee/EmployeeModel";

interface Props {
  form: FormInstance<any>;
}

const RoleInputFields: React.FC<Props> = ({ form }) => {
  // Required Selectors and States
  const selDeptId = Form.useWatch("departmentId", form);
  const empData = useSelector(empSelector);
  const deptData = useSelector(deptSelector);
  const clientData = useSelector(clientSelector);
  const marketplace = useSelector(marketPlaceAccountSelector);
  const loggedInUser = JSON.parse(authService.getUser());

  // Required UseState
  const [empOptions, setEmpOptions] = useState<any>();
  const [showEndDate, setEndDate] = useState(false);
  const [disableField, setDisableFields] = useState(false);
  const [disableAssingedTo, setDisableAssingedTo] = useState(false);
  // Selective Options

  const clientOptions = clientData.map((item: any) => {
    return { label: item.clientName, value: item.clientId };
  });

  const deptOptions = deptData.map((item: any) => {
    return { label: item.departmentName, value: item.departmentId };
  });

  const billingTypeOptions = Object.values(BillingTypes).map((item: any) => {
    return { label: item.name, value: item.value };
  });

  const contractTypeOptions = Object.values(ContractType).map((item: any) => {
    return { label: item.name, value: item.value };
  });

  const hiredIdOptions = marketplace.map((item: any) => {
    return { label: item.name, value: item.id };
  });

  const billingStatusoptions = Object.values(ContractStatus).map(
    (item: any) => {
      return { label: item.name, value: item.value };
    }
  );
  const ProjectStatusoptions = Object.values(ProjectStatus).map((item: any) => {
    return { label: item.name, value: item.value };
  });

  const accountTypeOptions = Object.values(AccountTypes).map((item: any) => {
    return { label: item.name, value: item.value };
  });

  useEffect(() => {
    if (selDeptId?.length === 0) return;
    const empOpt = empData
      .filter((item: any) => {
        return selDeptId?.some((dept: any) => dept === item.departmentId);
      })
      .map((item: any) => {
        return {
          label: `${item.firstName} ${item.lastName}`,
          value: item.employeeId,
        };
      });
    setEmpOptions(empOpt);
  }, [selDeptId]);

  useEffect(() => {
    loggedInUser.role === RoleEnum.TeamLead.name
      ? setDisableFields(false)
      : setDisableFields(true);
  });

  useEffect(() => {
    loggedInUser.role === RoleEnum.BD.name ||
    loggedInUser.role === RoleEnum.BDM.name
      ? setDisableAssingedTo(false)
      : setDisableAssingedTo(true);
  });

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

  const handleHoursInputChange = (e: any) => {
    const inputValue = e.target.value;

    // Replace non-numeric or non-colon characters with an empty string
    const sanitizedValue = inputValue.replace(/[^0-9:]/g, "");

    // Extract hours and minutes using regex
    const match = sanitizedValue.match(/^(\d{1,2})(:)?(\d{0,2})$/);

    if (match) {
      // Extracted values from the regex match
      const hours = match[1] || "";
      const minutes = match[3] || "";

      // Format as HH:MM
      const formattedValue = minutes ? `${hours}:${minutes}` : hours;

      // Set the formatted value in the form field
      form.setFieldValue("hoursPerWeek", formattedValue);
    }
  };

  useEffect(() => {
    // Check if the initial value of projectStatus is Completed or Closed
    if (
      form.getFieldValue("status") === ProjectStatus.Completed.value ||
      form.getFieldValue("status") === ProjectStatus.Closed.value
    ) {
      setEndDate(true); // If so, show the endDate field
    }
  }, [form]);

  switch (loggedInUser.role) {
    case USER_ROLE.ADMIN:
    case USER_ROLE.BD:
    case USER_ROLE.BDM:
    case USER_ROLE.TEAMLEAD:
      return (
        <>
          <Row gutter={[24, 24]} style={{ justifyContent: "space-between" }}>
            <Col span={12}>
              <Form.Item
                rules={[
                  { required: true, message: "Please Enter Contract Name" },
                ]}
                label="Contract Name"
                name="contractName"
              >
                <Input
                  placeholder="Enter the Contract Name"
                  disabled={!disableField}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Client Name"
                name="clientId"
                rules={[{ required: true, message: "Please Select a Client" }]}
              >
                <Select
                  showSearch
                  className="custom-select"
                  placeholder="Select Client Name"
                  options={clientOptions}
                  optionFilterProp="children"
                  filterOption={(input: any, option: any) => {
                    return option?.label
                      ? option?.label
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      : undefined;
                  }}
                  disabled={!disableField}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ justifyContent: "space-between" }}>
            <Col span={12}>
              <Form.Item
                rules={[
                  { required: true, message: "Please Select Department" },
                ]}
                label="Department"
                name="departmentId"
              >
                <Select
                  showSearch
                  maxTagCount="responsive"
                  className="custom-select"
                  placeholder="Select Departments"
                  mode="multiple"
                  options={deptOptions}
                  optionFilterProp="children"
                  filterOption={(input: any, option: any) => {
                    return option?.label
                      ? option?.label
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      : undefined;
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Project Health"
                name="projectHealthRate"
                rules={[{ required: true, message: "Please Select a Client" }]}
              >
                <Select
                  className="custom-select"
                  placeholder="Select Project Health"
                  options={healthMenu}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ justifyContent: "space-between" }}>
            <Col span={12}>
              <Form.Item
                rules={[
                  { required: true, message: "Please Enter Week Hours" },
                  {
                    pattern: new RegExp("^[0-9][0-9][:][0-9][0-9]"),
                    message:
                      "Please Type Proper Values in Hours and Minutes(HH:MM)",
                  },
                ]}
                label="Hours Per Week"
                name="hoursPerWeek"
              >
                <Input
                  placeholder="HH:MM"
                  type="text"
                  maxLength={5}
                  onChange={handleHoursInputChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Assign To" name="employeeId">
                <Select
                  showSearch
                  maxTagCount="responsive"
                  className="custom-select"
                  placeholder="Select Employees"
                  mode="multiple"
                  options={empOptions}
                  optionFilterProp="children"
                  filterOption={(input: any, option: any) => {
                    return option?.label
                      ? option?.label
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      : undefined;
                  }}
                  disabled={!disableAssingedTo}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ justifyContent: "space-between" }}>
            <Col span={12}>
              <Form.Item
                rules={[
                  { required: true, message: "Please Select Billing Type" },
                ]}
                label="Billing Type"
                name="billingType"
              >
                <Select
                  className="custom-select"
                  placeholder="Select a BillingType"
                  options={billingTypeOptions}
                  disabled={!disableField}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                rules={[
                  { required: true, message: "Please Select Contract Type" },
                ]}
                label="Contract Type"
                name="contractType"
              >
                <Select
                  className="custom-select"
                  placeholder="Select a ContractType"
                  options={contractTypeOptions}
                  disabled={!disableField}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ justifyContent: "space-between" }}>
            <Col span={12}>
              <Form.Item label="Project Url" name="projectUrl">
                <Input
                  placeholder="Enter the project URL"
                  disabled={!disableField}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                rules={[
                  { required: true, message: "Please Select Start Date" },
                ]}
                label="Start Date"
                name="startDate"
              >
                <DatePicker
                  className="custom-select"
                  style={{ width: "100%" }}
                  disabled={!disableField}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ justifyContent: "space-between" }}>
            <Col span={12}>
              <Form.Item
                rules={[
                  { required: true, message: "Please Select a Hired ID" },
                ]}
                label="Hired Id"
                name="upworkId"
              >
                <Select
                  showSearch
                  className="custom-select"
                  placeholder="Select a Hired Id"
                  options={hiredIdOptions}
                  optionFilterProp="children"
                  filterOption={(input: any, option: any) => {
                    return option?.label
                      ? option?.label
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      : undefined;
                  }}
                  disabled={!disableField}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Communication Mode" name="communicationMode">
                <Input
                  placeholder="Enter the Communication Mode"
                  disabled={!disableField}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ justifyContent: "space-between" }}>
            <Col span={12}>
              <Form.Item
                label="Contract status"
                name="billingStatus"
                rules={[
                  {
                    required: true,
                    message: "Please Select Contract status",
                  },
                ]}
              >
                <Select
                  className="custom-select"
                  placeholder="Select a Project Contract status"
                  options={billingStatusoptions}
                  disabled={!disableField}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Project Status"
                name="status"
                rules={[
                  {
                    required: true,
                    message: "Please Select Project status",
                  },
                ]}
              >
                <Select
                  className="custom-select"
                  placeholder="Select a Project Status"
                  options={ProjectStatusoptions}
                  onChange={(value) => {
                    if (
                      value === ProjectStatus.Closed.value ||
                      value === ProjectStatus.Completed.value
                    ) {
                      setEndDate(true);
                    } else {
                      setEndDate(false);
                    }
                  }}
                  disabled={!disableField}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                rules={[
                  { required: true, message: "Please Select Account type" },
                ]}
                label="Account Types"
                name="accounts"
              >
                <Select
                  className="custom-select"
                  placeholder="Select a AccountTypes"
                  options={accountTypeOptions}
                  disabled={!disableField}
                />
              </Form.Item>
            </Col>
            {showEndDate ? (
              <>
                <Col span={12}>
                  <Form.Item
                    rules={[
                      { required: true, message: "Please Select End Date" },
                    ]}
                    label="End Date"
                    name="endDate"
                  >
                    <DatePicker
                      className="custom-select"
                      style={{ width: "100%" }}
                      //disabled
                    />
                  </Form.Item>
                </Col>
              </>
            ) : null}
          </Row>

          <Divider />

          {/* <Row gutter={[16, 16]}>
            <Col span={24}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item label="Issues" name="issue">
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Solution" name="solution">
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item label="Remarks" name="remarks">
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row> */}
        </>
      );
    default:
      return <></>;
  }
};

export default RoleInputFields;
