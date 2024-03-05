import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Form,
  Input,
  Select,
  Row,
  DatePicker,
  message,
  Col,
  Divider,
} from "antd";
import {
  CloseOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { projectSelector } from "../../Selectors/projectSelector";
import TextArea from "antd/es/input/TextArea";
import eodReportService from "../../services/eodReportRequest";
import { FormInstance } from "antd/lib/form";
import moment from "moment";
import authService from "../../services/authServices";
import dayjs from "dayjs";
import { empSelector } from "../../Selectors/employeeSelector";
import { RoleEnum } from "../Employee/EmployeeModel";
import projectService from "../../services/projectRequest";

type IProps = {
  handleCloseDialog: () => void;
  loading: (progress: number, value: boolean) => void;
};

type FieldType = {
  employeeId: string;
  isActive: true;
  projectHours: {
    projectId: string;
    billingHours: number;
    employeeDelightHours: number;
    remarks: string;
  }[];
  eodDate: string;
};

export default function AddEODREport({
  handleCloseDialog,
  loading,
}: IProps): JSX.Element {
  // Required Selectors
  const [form] = Form.useForm();
  const userInfo: any = JSON.parse(authService.getUser());
  const formRef = useRef<FormInstance>(null);
  const selProjectId = Form.useWatch("projectHours", form);
  const dispatch = useDispatch();
  const projectData = useSelector(projectSelector);

  // Required useState
  const [todayDate, setTodayDate] = useState<any>(dayjs());

  // Required useEffects

  useEffect(() => {
    if (todayDate === null) {
      setTodayDate(getEODDate());
    }
  }, [todayDate]);

  useEffect(() => {
    if (!projectData) {
      dispatch<any>(projectService.getProjectByDept());
    }
  }, [dispatch, projectData]);

  // Required Select Options
  const projectOptions = projectData?.map((item: any) => {
    const disabledMenu = selProjectId?.some((id: any) => {
      if (id?.projectId === item.projectId) return true;
      else return false;
    });
    return {
      label: item.projectName,
      value: item.projectId,
      disabled: disabledMenu,
    };
  });

  // Other Workings

  function getEODDate() {
    let resultDate = dayjs();

    // Check if the time is between 12:00 AM and 3:00 AM
    if (resultDate.hour() >= 0 && resultDate.hour() < 3) {
      // Subtract a day
      resultDate = resultDate.subtract(1, "day");
    }

    return resultDate;
  }

  const onFinish = async (value: FieldType) => {
    message.loading("Creating new EOD Status");
    loading(10, false);
    const projectHr = value.projectHours?.map((item: any) => {
      return {
        ...item,
        billingHours:
          item?.billingHours === "" ? 0 : item?.billingHours?.replace(":", "."),
        employeeDelightHours:
          item?.employeeDelightHours === ""
            ? 0
            : item?.employeeDelightHours?.replace(":", "."),
      };
    });

    eodReportService
      .addEodReport({
        ...value,
        projectHours: projectHr,
        employeeId: userInfo?.employeeId,
      })
      .then((response) => {
        if (response.status === 200) {
          message.destroy();
          message.success("EOD Created Successfully");
          handleCloseDialog();
          dispatch<any>(eodReportService.fetchEodReportList());
          loading(100, false);
        } else {
          loading(100, false);
          throw new Error(`Failed to create EOD. Status: ${response}`);
        }
      })
      .catch((error) => {
        message.destroy();
        message.error("Failed to create eod");
        loading(100, false);
      });
  };

  const disabledDate = (current: any) => {
    // Get the current date
    const today = moment();

    // Get the start date of the current week (Monday)
    const currentWeekStartDate = today.clone().startOf("isoWeek");

    // Get the end date of the current week (Friday)
    let currentWeekEndDate = today.clone().endOf("isoWeek").day(5); // Friday

    // Check if Friday falls in the next month
    if (currentWeekEndDate.month() !== today.month()) {
      currentWeekEndDate = today.clone().endOf("month").day(5); // Last Friday of the month
    }

    // Check if the current date is within the current week (Monday to Friday)
    return (
      current.isBefore(currentWeekStartDate) ||
      current.isAfter(currentWeekEndDate)
    );
  };
  const handleHoursInputChange = (name: any, field: any, e: any) => {
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
      form.setFieldValue(["projectHours", name, field], formattedValue);
    }
  };

  const getProjectDept = (data: string) => {
    const selectedPro = projectData?.find(
      (item: any) => item.projectId === data
    );

    if (
      !selectedPro?.assignedTo ||
      selectedPro?.assignedTo.length === 0 ||
      selectedPro?.assignedTo === null
    ) {
      return false;
    }
    if (
      //selectedPro?.departmentId?.includes(userInfo?.departmentId) ||
      selectedPro?.departmentId?.includes(userInfo?.departmentId) &&
      selectedPro?.assignedTo?.includes(userInfo?.employeeId)
    ) {
      return true;
    }
    if (
      selectedPro?.departmentId?.includes(userInfo?.departmentId) &&
      !selectedPro?.assignedTo?.includes(userInfo?.employeeId)
    ) {
      return true;
    }
  };

  const getRemainingHr = (data: string) => {
    return projectData?.find((item: any) => item.projectId === data);
  };
  return (
    <Row gutter={[16, 16]}>
      <Form
        form={form}
        ref={formRef}
        name="AddEodReport"
        layout="vertical"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        initialValues={{ eodDate: todayDate }}
        style={{ maxWidth: "700px", width: "100%", padding: "20px 0px" }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.List
          name="projectHours"
          initialValue={[{ projectId: null, billingHours: "00:00" }]}
        >
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <>
                  <Row
                    key={key}
                    gutter={[16, 16]}
                    style={{ display: "flex", marginBottom: 8 }}
                  >
                    <Col span={12}>
                      <Form.Item
                        label="Project Name"
                        {...restField}
                        name={[name, "projectId"]}
                        rules={[
                          {
                            required: true,
                            message: "Please Select Project Name!",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          className="custom-select"
                          placeholder="Select Project Name"
                          options={projectOptions}
                          filterOption={(input: any, option: any) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        />
                      </Form.Item>
                    </Col>
                    {getProjectDept(
                      form.getFieldValue(["projectHours", name, "projectId"])
                    ) ? (
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const employeeDelightHours = getFieldValue([
                                  "projectHours",
                                  name,
                                  "employeeDelightHours",
                                ]);
                                if (!value && !employeeDelightHours) {
                                  return Promise.reject(
                                    "Please input Billing Hours or Delight Hours!"
                                  );
                                }
                                const remData = getRemainingHr(
                                  form.getFieldValue([
                                    "projectHours",
                                    name,
                                    "projectId",
                                  ])
                                );

                                const billingHours = getFieldValue([
                                  "projectHours",
                                  name,
                                  "billingHours",
                                ]);
                                const delightHours = getFieldValue([
                                  "projectHours",
                                  name,
                                  "employeeDelightHours",
                                ]);

                                if (
                                  (billingHours === "00:00" &&
                                    delightHours === undefined) ||
                                  delightHours === "00:00"
                                ) {
                                  return Promise.reject(
                                    "Please input hours field"
                                  );
                                }

                                if (
                                  parseFloat(value.replaceAll(":", ".")) >
                                  remData.remainingHours
                                )
                                  return Promise.reject(
                                    `Billing Hours limit: ${remData.remainingHours}`
                                  );
                                else {
                                  return Promise.resolve();
                                }
                              },
                            }),
                            {
                              pattern: new RegExp("^[0-9][0-9][:][0-9][0-9]"),
                              message:
                                "Please Type Proper Values in Hours and Minutes(HH:MM)",
                            },
                          ]}
                          label="Billing Hours"
                          name={[name, "billingHours"]}
                          initialValue="00:00"
                        >
                          <Input
                            placeholder="HH:MM"
                            type="text"
                            maxLength={5}
                            //defaultValue="00:00"
                            onChange={(e) =>
                              handleHoursInputChange(name, "billingHours", e)
                            }
                          />
                        </Form.Item>
                      </Col>
                    ) : null}

                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const billingHours = getFieldValue([
                                "projectHours",
                                name,
                                "billingHours",
                              ]);
                              const delightHours = getFieldValue([
                                "projectHours",
                                name,
                                "employeeDelightHours",
                              ]);
                              if (
                                (billingHours === "00:00" &&
                                  delightHours === undefined) ||
                                delightHours === "00:00"
                              ) {
                                return Promise.reject(
                                  "Please input hours field"
                                );
                              }
                              if (
                                (billingHours === undefined &&
                                  delightHours === undefined) ||
                                delightHours === "00:00"
                              ) {
                                return Promise.reject(
                                  "Please input hours field"
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                          {
                            pattern: new RegExp("^[0-9][0-9][:][0-9][0-9]"),
                            message:
                              "Please type proper values in Hours and Minutes (HH:MM)",
                          },
                        ]}
                        label="Delight Hours"
                        name={[name, "employeeDelightHours"]}
                      >
                        <Input
                          placeholder="HH:MM"
                          type="text"
                          maxLength={5}
                          onChange={(e) =>
                            handleHoursInputChange(
                              name,
                              "employeeDelightHours",
                              e
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Form.Item
                        label="Remarks"
                        name={[name, "remarks"]}
                        rules={[
                          { required: true, message: "Please input Remarks!" },
                        ]}
                      >
                        <TextArea size="large" rows={4} />
                      </Form.Item>
                    </Col>
                  </Row>
                  {index !== 0 ? (
                    <Row>
                      <Col span={24}>
                        <Form.Item>
                          <Button
                            style={{ width: 200 }}
                            danger
                            type="link"
                            onClick={() => remove(name)}
                            block
                            icon={<MinusCircleOutlined />}
                          >
                            Remove
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  ) : null}
                  <Divider style={{ height: 0, marginTop: 0 }} />
                </>
              ))}
              <Form.Item>
                <Button
                  style={{ width: 200 }}
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Project
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Divider />
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Eod Date"
              name="eodDate"
              rules={[
                {
                  required: false,
                  message: "Please input Eod Date!",
                },
              ]}
            >
              <DatePicker
                size="large"
                style={{ width: "100%" }}
                disabledDate={disabledDate}
                disabled
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item className="submit-btn-wrap" wrapperCol={{ span: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginRight: 10 }}
                //disabled={isSubmitButtonDisabled()}
              >
                Submit
              </Button>

              <Button
                icon={<CloseOutlined />}
                onClick={handleCloseDialog}
                danger
              >
                Close
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Row>
  );
}
