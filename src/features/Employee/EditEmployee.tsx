import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import empService from "../../services/empRequest";
import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  message,
} from "antd";
import { CloseOutlined, UserOutlined } from "@ant-design/icons";
import { GenderEnum, RoleEnum } from "./EmployeeModel";
import dayjs from "dayjs";
import { empSelector } from "../../Selectors/employeeSelector";
import { deptSelector } from "../../Selectors/departmentSelector";
import moment from "moment";
import authService from "../../services/authServices";

type IProps = {
  isOpen: boolean;
  handleCloseDialog: () => void;
  rowData: any;
};

type FieldType = {
  employeeId: string;
  profilePicture: string;
  employeeNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNo: string;
  address: string;
  departmentId: string;
  assignedTo: string;
  casualLeaves: string;
  sickLeaves: string;
  isActive: true;
  gender: string;
  role: string;
  joiningDate: string;
  resignationDate?: string;
  employeeTargetedHours: string;
  dob: string;
  aadharNumber: string;
};

export default function EditEmployee({
  isOpen,
  handleCloseDialog,
  rowData,
}: IProps): JSX.Element {
  // Required Selectors
  const [form] = Form.useForm();
  const deptWatch = Form.useWatch("departmentId", form);
  const dispatch = useDispatch();
  const empData = useSelector(empSelector);
  const deptData = useSelector(deptSelector);

  // Required UseState
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<any>([]);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [formChanged, setFormChanged] = useState(false);
  const loggedInUser = JSON.parse(authService.getUser());

  // Select Options
  const deptOptions = deptData?.map((item: any) => {
    return { label: item.departmentName, value: item.departmentId };
  });

  const roleOptions = Object.values(RoleEnum).map((item: any) => ({
    label: item.name,
    value: item.name,
  }));

  const genderOptions = Object.values(GenderEnum).map((item: any) => ({
    label: item.name,
    value: item.value,
  }));

  const employeeOption = empData
    ?.filter((item: any) => {
      if (!deptWatch) return true;
      return item.departmentId === deptWatch;
    })
    .map((item: any) => ({
      label: `${item.firstName} ${item.lastName}`,
      value: item.employeeId,
    }));

  // Other Workings
  const onValuesChange = () => {
    setFormChanged(true);
  };

  const onFinish = async (value: FieldType) => {
    if (!formChanged) {
      return message.error("No Changes");
    }
    message.loading("Updating...");
    setLoading(true);
    const weekHours = value.employeeTargetedHours?.replace(":", ".");
    value.dob = dayjs(value?.dob).format("YYYY-MM-DD");
    const stringValue = {
      ...value,
      employeeTargetedHours: weekHours,
    };
    const response = await empService.updateEmployee(stringValue, images);
    if (response.status === 200) {
      message.destroy();
      message.success(response.data.message);
      setLoading(false);
      if (stringValue.email === loggedInUser.email) {
        setSession("user", JSON.stringify(response.data.user));
      }
    } else {
      message.destroy();
      message.error(response.data.message);
    }

    handleCloseDialog();
    dispatch<any>(empService.fetchEmpList());
  };

  const setSession = (key: string, value: string) => {
    localStorage.setItem(key, value);
  };

  let fileInput: HTMLInputElement | null = null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result as string;
        setBase64Image(result);

        // Save base64 image to profilePicture field in formData
        setImages(e.target.files);
      };

      reader.readAsDataURL(file);
    } else {
      console.log("No file selected or file input issue.");
    }
  };

  const disabledFutureDate = (current: any) => {
    return current && current < moment().endOf("day");
  };

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
      form.setFieldValue("employeeTargetedHours", formattedValue);
    }
  };

  return (
    <Row
      gutter={[16, 16]}
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Form
        style={{ width: "100%", margin: "0px 20px" }}
        name="AddEmployee"
        form={form}
        labelCol={{ span: 18 }}
        wrapperCol={{ span: 24 }}
        layout="vertical"
        initialValues={{
          ...rowData,
          employeeTargetedHours: rowData?.employeeTargetedHours?.replaceAll(
            ".",
            ":"
          ),
          joiningDate: dayjs(rowData.joiningDate, "YYYY/MM/DD"),
          dob: rowData.dob ? dayjs(rowData.dob, "YYYY/MM/DD") : null,
          resignationDate: rowData.resignationDate
            ? dayjs(rowData.resignationDate, "YYYY/MM/DD")
            : null,
        }}
        onFinish={onFinish}
        onValuesChange={onValuesChange}
        autoComplete="off"
      >
        <Form.Item
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Row>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              style={{ display: "none" }}
              ref={(input) => (fileInput = input)}
            />
            <Avatar
              size={60}
              icon={<UserOutlined />}
              src={
                base64Image ||
                (rowData.profilePicture &&
                  `data:image/jpeg;base64,${rowData.profilePicture}`)
              }
              style={{ cursor: "pointer", background: "#1677ff" }}
              onClick={() => fileInput && fileInput.click()}
            />
          </Row>
        </Form.Item>

        <Row
          gutter={[30, 0]}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Col className="employee-field" span={12}>
            <Form.Item
              label="Employee Number"
              name="employeeNumber"
              rules={[
                { required: true, message: "Please input Employee Number!" },
                {
                  pattern: /^[ST0-9]+$/,
                  message:
                    "Employee Number must start with 'ST' and contain only alphanumeric characters.",
                },
              ]}
            >
              <Input disabled />
            </Form.Item>
          </Col>

          <Col className="employee-field" span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input Email Address!" },
                {
                  pattern: new RegExp(
                    "^[A-Za-z0-9._%+-]+@supremetechnologiesindia.com$"
                  ),
                  message: "Please Enter Proper Mail ID",
                },
              ]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={[30, 0]}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Col className="employee-field" span={12}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: "Please input firstName!" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col className="employee-field" span={12}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: false, message: "Please input Last Name!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row
          gutter={[30, 0]}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Col className="employee-field" span={12}>
            <Form.Item
              label="Mobile Number"
              name="mobileNo"
              rules={[
                {
                  required: true,
                  pattern: new RegExp("^[0-9]{10}$"),
                  message: "Please input a 10-digit Mobile Number!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col className="employee-field" span={12}>
            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: "Please input Address!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={[30, 0]}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Col className="employee-field" span={12}>
            <Form.Item
              label="Aadhar Number"
              name="aadharNumber"
              rules={[
                { required: false, message: "Please input Aadhar Number!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col className="employee-field" span={12}>
            <Form.Item
              label="D.O.B"
              name="dob"
              rules={[{ required: true, message: "Please select D.O.B!" }]}
              initialValue={
                rowData.dob ? dayjs(rowData.dob, "YYYY/MM/DD") : null
              }
            >
              <DatePicker className="custom-select" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={[30, 0]}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Col className="employee-field" span={12}>
            <Form.Item
              label="Department"
              name="departmentId"
              rules={[
                { required: true, message: "Please select a Department!" },
              ]}
            >
              <Select
                className="custom-select"
                showSearch
                allowClear
                placeholder="Select a Department"
                options={deptOptions}
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col className="employee-field" span={12}>
            <Form.Item
              label="Casual Leaves"
              name="casualLeaves"
              rules={[
                { required: true, message: "Please input Casual Leaves!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={[30, 0]}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Col className="employee-field" span={12}>
            <Form.Item
              label="Sick Leaves"
              name="sickLeaves"
              rules={[{ required: true, message: "Please input Sick Leaves!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col className="employee-field" span={12}>
            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: "Please select a Role!" }]}
            >
              <Select
                className="custom-select"
                placeholder="Select a Role"
                options={roleOptions}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row
          gutter={[30, 0]}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Col className="employee-field" span={12}>
            {" "}
            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: "Please select a Gender!" }]}
            >
              <Select
                className="custom-select"
                placeholder="Select a Gender"
                options={genderOptions}
              />
            </Form.Item>
          </Col>
          <Col className="employee-field" span={12}>
            <Form.Item
              label="Employee Targeted Hours"
              name="employeeTargetedHours"
              rules={[
                {
                  pattern: new RegExp("^[0-9][0-9][:][0-9][0-9]"),
                  message:
                    "Please Type Proper Values in Hours and Minutes(HH:MM)",
                },
              ]}
            >
              <Input
                placeholder="HH:MM"
                type="text"
                maxLength={5}
                onChange={handleHoursInputChange}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={[30, 0]}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Col className="employee-field emp-field-selected" span={12}>
            <Form.Item
              label="Joining Date"
              name="joiningDate"
              rules={[
                { required: true, message: "Please select Joining Date!" },
              ]}
            >
              <DatePicker
                className="custom-select"
                style={{ width: "100%" }}
                disabled
              />
            </Form.Item>
          </Col>
          <Col className="employee-field emp-field-selected" span={12}>
            <Form.Item
              label="Resignation Date"
              name="resignationDate"
              initialValue={
                rowData.resignationDate
                  ? dayjs(rowData.resignationDate, "YYYY/MM/DD")
                  : null
              }
            >
              <DatePicker
                className="custom-select"
                style={{ width: "100%" }}
                disabledDate={disabledFutureDate}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row
          gutter={[30, 0]}
          style={{
            display: "flex",
          }}
        >
          <Col className="employee-field" span={12}>
            <Form.Item
              label="Assigned To"
              name="assignedTo"
              rules={[
                { required: false, message: "Please select an Employee!" },
              ]}
            >
              <Select
                className="custom-select"
                placeholder="Select an Employee"
                allowClear
                showSearch
                options={employeeOption}
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          className="employee-btn"
          wrapperCol={{ offset: 8, span: 16 }}
        >
          <Button
            className="employee-btn-wrap"
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ marginRight: 10 }}
          >
            Submit
          </Button>

          <Button
            className="employee-btn-wrap"
            icon={<CloseOutlined />}
            onClick={handleCloseDialog}
            danger
          >
            Close
          </Button>
        </Form.Item>
      </Form>
    </Row>
  );
}
