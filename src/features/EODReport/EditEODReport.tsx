import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Col,
  Form,
  Input,
  Select,
  Row,
  DatePicker,
  message,
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
import dayjs from "dayjs";
import projectService from "../../services/projectRequest";
import moment from "moment";
import authService from "../../services/authServices";
import { empSelector } from "../../Selectors/employeeSelector";
import { parse } from "path";
import { RoleEnum } from "../Employee/EmployeeModel";

type IProps = {
  handleCloseDialog: () => void;
  rowData: any;
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
export default function EditEODReport({
  handleCloseDialog,
  rowData,
  loading,
}: IProps): JSX.Element {
  // Required Selectors
  const [form] = Form.useForm();
  const billingHr = Form.useWatch("projectHours");
  const userInfo: any = JSON.parse(authService.getUser());
  const formRef = useRef<FormInstance>(null);
  const selProjectId = Form.useWatch("projectHours", form);
  const dispatch = useDispatch();
  const projectData = useSelector(projectSelector);

  // Required useState

  // Required useEffects

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
  const onFinish = async (value: FieldType) => {
    message.loading("Updating EOD");
    loading(10, false);
    value.eodDate = dayjs(value?.eodDate).format("YYYY-MM-DD");
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
      .updateEodReport({
        ...value,
        employeeId: userInfo?.employeeId,
        projectHours: projectHr,
        eodReportId: rowData.eodReportId,
      })
      .then((response) => {
        if (response.status === 200) {
          message.destroy();
          message.success("EOD Updated Successfully");
          handleCloseDialog();
          dispatch<any>(eodReportService.fetchEodReportList());
          dispatch<any>(projectService.getProjectByDept());
          loading(100, false);
        } else {
          // Handle different error scenarios based on response data
          if (response.status === 400) {
            // Handle 400 Bad Request errors
            message.destroy();
            message.error("Bad Request: " + response.data.message);
          } else if (response.status === 401) {
            // Handle 401 Unauthorized errors
            message.destroy();
            message.error("Unauthorized: " + response.data.message);
          } else {
            // Handle other errors
            message.destroy();
            message.error("Failed to update EOD. Status: " + response.status);
          }
          loading(100, false);
        }
      })
      .catch((error) => {
        // Handle network errors or other unexpected errors
        message.destroy();
        message.error("Failed to update EOD: " + error.message);
        loading(100, false);
      });
  };
  const empData = useSelector(empSelector);

  const disabledDate = (current: dayjs.Dayjs): boolean => {
    // Disable Sundays
    if (current.day() === 0) {
      return true;
    }

    const today = dayjs();
    const currentYear = today.year();
    const currentWeekStartDate = today.startOf("week");
    const currentWeekEndDate = today.endOf("week").day(6); // Saturday

    // Check if the date is within the current week and current year
    return (
      current.isBefore(currentWeekStartDate, "day") ||
      current.isAfter(currentWeekEndDate, "day") ||
      current.year() !== currentYear
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

  const isUserInSameDept = (userInfoDeptId: string, employeeDetails: any[]) => {
    return employeeDetails.some(
      (employee) => employee.departmentId === userInfoDeptId
    );
  };

  const getEmployeeDetails = (
    assignedTo: string[] | undefined,
    empData: any[]
  ) => {
    if (!assignedTo || assignedTo.length === 0) {
      return [];
    }

    const employeeDetails = empData.filter((userInfo) =>
      assignedTo.includes(userInfo?.employeeId)
    );

    return employeeDetails;
  };

  const getProjectDept = (data: string) => {
    const selectedPro = projectData?.find(
      (item: any) => item.projectId === data
    );

    const employeeDetails = getEmployeeDetails(
      selectedPro?.assignedTo,
      empData
    );

    const isUserInSameDepartment = isUserInSameDept(
      userInfo?.departmentId,
      employeeDetails
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
    return projectData.find((item: any) => item.projectId === data);
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
        style={{ maxWidth: "700px", width: "100%", padding: "20px 0px" }}
        onFinish={onFinish}
        initialValues={{
          ...rowData,
          eodDate: dayjs(rowData.eodDate[0], "YYYY,MM,DD"),
          projectHours: rowData?.projectHours?.map((item: any) => {
            const formatTime = (time: string): string | null => {
              if (/^\d+(\.\d{1,2})?$/.test(time)) {
                const [hours, minutes] = time
                  .split(".")
                  .map((part) => part.padStart(2, "0"));
                return `${hours}:${minutes}`;
              }
              return null;
            };

            const billingHr = formatTime(item.billingHours);
            const empDelHr = formatTime(item.employeeDelightHours);

            return {
              ...item,
              billingHours: billingHr,
              employeeDelightHours: empDelHr,
            };
          }),
        }}
        autoComplete="off"
      >
        <Form.List
          name="projectHours"
          initialValue={[{ projectId: null, billingHours: null }]}
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
                          disabled={userInfo?.employeeId !== rowData.employeeId}
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

                                // const initialValue = getFieldValue([
                                //   "projectHours",
                                //   name,
                                //   "billingHours",
                                // ]);
                                // console.log({ initialValue });

                                const combinevalue =
                                  parseFloat(
                                    rowData?.projectHours[index]?.billingHours
                                  ) + parseFloat(remData?.remainingHours);

                                if (
                                  combinevalue <
                                  parseFloat(value.replace(":", "."))
                                ) {
                                  return Promise.reject(
                                    `Hours left: ${remData?.remainingHours}`
                                  );
                                }
                                // else if (
                                //   combinevalue >
                                //   parseFloat(value.replace(":", "."))
                                // ) {
                                //   console.log("hahahah");
                                // }
                                return Promise.resolve();
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
                        >
                          <Input
                            placeholder="HH:MM"
                            type="text"
                            maxLength={5}
                            onChange={(e) =>
                              handleHoursInputChange(name, "billingHours", e)
                            }
                            disabled={
                              userInfo?.employeeId !== rowData.employeeId
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
                              if (!value && !billingHours) {
                                return Promise.reject();
                              }
                              return Promise.resolve();
                            },
                          }),
                          {
                            pattern: new RegExp("^[0-9][0-9][:][0-9][0-9]"),
                            message:
                              "Please Type Proper Values in Hours and Minutes(HH:MM)",
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
                          disabled={userInfo?.employeeId !== rowData.employeeId}
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
                        <TextArea
                          size="large"
                          rows={4}
                          disabled={userInfo?.employeeId !== rowData.employeeId}
                        />
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
                  disabled={userInfo?.employeeId !== rowData.employeeId}
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
              {userInfo.role === RoleEnum.TeamLead.name ? (
                <DatePicker
                  size="large"
                  style={{ width: "100%" }}
                  disabledDate={disabledDate}
                />
              ) : (
                <DatePicker
                  size="large"
                  style={{ width: "100%" }}
                  disabledDate={disabledDate}
                  disabled
                />
              )}
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
