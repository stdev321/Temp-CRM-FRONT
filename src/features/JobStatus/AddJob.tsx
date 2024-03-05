import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import leadService from "../../services/leadsConnectService";
import { deptSelector } from "../../Selectors/departmentSelector";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Row,
  Select,
  message,
} from "antd";
import { IDept } from "../Department/DeptModel";
import {
  AccountTypes,
  BillingTypes,
  ContractStatus,
  ContractType,
  StatusEnum,
} from "../../Enums/LeadsConnect/BillingStatus";
import { marketPlaceAccountSelector } from "../../Selectors/marketPlaceAccountSelector";
import marketPlaceService from "../../services/marketPlaceAccountRequest";
import { IMarketPlaceAccount } from "../MarketPlaceAccount/MarketPlaceAccountModel";
import { useNavigate } from "react-router";
import { CountryType, countries } from "../../Helper/countries";
import authService from "../../services/authServices";
import { RoleEnum } from "../Employee/EmployeeModel";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import jobService from "../../services/leadsConnectService";
// import { Input } from 'antd';

const { TextArea } = Input;

type IProps = {
  isOpen: boolean;
  handleCloseDialog: () => void;
  employeeData: any;
  loading: (progress: number, value: boolean) => void;
};

type FieldType = {
  projectName: string;
  upworkId: string;
  accountTypes: string;
  jobUrl: string;
  jobdescription: string;
  connects: string;
  projectUrl: string;
  clientName: string;
  countryName: string;
  hiredProfile: string;
  email: string;
  mobile: string;
  communicationProfile: string;
  departmentId: string;
  contracType: 1;
  weeklyHours: string;
  jobStatus: string;
  startDate: string;
  billingType: string;
  billingStatus: string;
  communicationMode: string;
  amountSpent: number;
};
type SizeType = Parameters<typeof Form>[0]["size"];

export default function AddJob({
  isOpen,
  handleCloseDialog,
  employeeData,
  loading,
}: IProps): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const deptData = useSelector(deptSelector);
  const marketplace = useSelector(marketPlaceAccountSelector);
  const [showHired, setShowHired] = useState(false);
  const [nameRequired, setNameRequired] = useState(false);
  const [showaccountTypes, setshowaccountTypes] = useState(true);
  const userInfo: any = JSON.parse(authService.getUser());
  const refFile = useRef<any>();
  const [fileList, setFileList] = useState<FileList | null>(null);
  const [size, setSize] = useState<SizeType>("large");
  const [defaultStatus, setDefaultStatus] = useState(1); // Set your default value here

  useEffect(() => {
    loading(100, false);
    loadDeptData();
  }, []);

  const loadDeptData = async () => {
    await dispatch<any>(marketPlaceService.fetchMarketPlaceAccountList());
    loading(100, false);
  };

  const marketplaceOptions =
    marketplace &&
    marketplace.length &&
    marketplace?.map((market: IMarketPlaceAccount, key: number) => ({
      label: `${market.name}`,
      value: market.id,
    }));

  const filterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const onFinish = (value: FieldType) => {
    // loading(100, true);
    console.log({ value });
    const stringValue = {
      ...value,
      accountTypes: value.accountTypes !== undefined ? value.accountTypes : 1,
      jobStatus: value.jobStatus !== undefined ? value.jobStatus : 1,
      connects:
        value.connects === undefined || value.connects === ""
          ? "0"
          : value.connects,
      contracType: value.contracType !== undefined ? value.contracType : 1,
    };

    leadService
      .createJob(stringValue)
      .then((response) => {
        // Handle success
        if (response.data.success) {
          message.success("Job Created Successfully");
          // Reset form fields
          form.resetFields();
          loading(100, false);
        } else {
          message.error("Something Went Wrong");
          loading(100, false);
        }
        dispatch<any>(leadService.fetchJobsList());
        navigate("/operations/business-Developement/Job_Status");
      })
      .catch((error) => {
        message.error("Failed to create Job");
        loading(100, false);
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const downloadTxtFile = async () => {
    const response = await jobService.downloadExcel();
  };

  const handleStatusChange = (selectedValue: number) => {
    // Your existing logic for handling status change
    if (
      selectedValue === StatusEnum.Hired.value ||
      selectedValue === StatusEnum.Ended.value
    ) {
      setShowHired(true);
      setNameRequired(true);
    } else if (selectedValue === StatusEnum.Lead.value) {
      setShowHired(false);
      setNameRequired(false);
    } else {
      setShowHired(false);
      setNameRequired(false);
    }

    // Update the default status in state
    setDefaultStatus(selectedValue);
  };

  const handleAccountChange = (selectedValue: number) => {
    // Your existing logic for handling status change
    if (selectedValue === BillingTypes.OutOfUpwork.value) {
      setshowaccountTypes(false);
    } else {
      setshowaccountTypes(true);
    }
    setshowaccountTypes(false);
    // Update the default status in state
    setDefaultStatus(selectedValue);
  };

  const handelUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileList(e.target.files);
    loading(10, true);

    const response = await jobService.importJobExcel(e.target.files);
    if (response.status === 400) {
      message.error("Something Went Wrong");
    } else {
      message.success(response.data.message);
    }

    dispatch<any>(leadService.fetchJobsList());
    navigate("/operations/business-Developement/Job_Status");

    dispatch<any>(jobService.fetchJobsList());
    loading(10, false);
    e.target.value = "";
  };

  return (
    <Row style={{ padding: "20px" }}>
      <Col span={24}>
        {(userInfo?.role === RoleEnum.BDM.name ||
          userInfo?.role === RoleEnum.BD.name ||
          userInfo?.role === RoleEnum.Admin.name) && (
          <>
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
          </>
        )}
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
      <Col span={24}>
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          layout="vertical"
          autoFocus
          onFinish={onFinish}
          size={"large" as SizeType}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Row gutter={[30, 0]}>
            <Col span={24} className="form-fields-content">
              <Row gutter={[16, 16]}>
                <Col span={24} className="form-fields">
                  <Row gutter={[30, 30]}>
                    <Col span={12}>
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Form.Item
                            label="Client Name"
                            name="clientName"
                            rules={[
                              {
                                required: nameRequired,
                                message: "Please input ClientName!",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Project Name"
                            name="projectName"
                            rules={[
                              {
                                required: nameRequired,
                                message: "Please input Project Name!",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Form.Item
                            label="Upwork Id"
                            name="upworkId"
                            rules={[
                              {
                                required: true,
                                message: "Please input Upwork Id!",
                              },
                            ]}
                          >
                            <Select
                              showSearch={true}
                              placeholder="Select a Upwork Account"
                              filterOption={filterOption}
                              options={marketplaceOptions || []}
                            ></Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                              {
                                required: false,
                                type: "email",
                                message: "Please input Email!",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Form.Item
                            label="Job Url"
                            name="jobUrl"
                            rules={[
                              {
                                required: true,
                                message: "Please input Job Url!",
                              },
                              {
                                pattern: /^https:\/\//,
                                message: "Job Url must start with 'https://'",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Account Types"
                            name="accountTypes"
                            rules={[
                              {
                                required: false,
                                message: "Please input Account Types!",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Select a AccountTypes"
                              onChange={handleAccountChange}
                              defaultValue={defaultStatus}
                            >
                              {Object.values(AccountTypes).map((item: any) => (
                                <Select.Option
                                  key={item.value}
                                  value={item.value}
                                >
                                  {item.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Form.Item
                            label="Connects"
                            name="connects"
                            rules={[
                              {
                                required: showaccountTypes,
                                pattern: new RegExp("^\\+?[1-9][0-9]{0,99}$"),
                                message: "Please input Connects!",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Contract Type"
                            name="contracType"
                            rules={[
                              {
                                required: false,
                                message: "Please input Contract Type!",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Select a ContractType"
                              defaultValue={ContractType.Hourly}
                            >
                              {Object.values(ContractType).map((item: any) => (
                                <Select.Option
                                  key={item.value}
                                  value={item.value}
                                >
                                  {item.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        label="Job Description"
                        name="jobdescription"
                        rules={[
                          {
                            required: true,
                            message: "Please input Job description!",
                          },
                        ]}
                      >
                        <TextArea rows={6} />
                        {/* <TextArea rows={4} placeholder="maxLength is 6" maxLength={6} /> */}

                        {/* <Input /> */}
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Form.Item
                            label="Country Name"
                            name="countryName"
                            rules={[
                              {
                                required: true,
                                message: "Please input Country Name!",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Select a Country"
                              showSearch // Enable search functionality
                              optionFilterProp="children" // Search based on children elements (country names)
                              filterOption={(input, option) =>
                                (option?.children as unknown as string)
                                  .toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              } // Filter options based on input
                            >
                              {Object.values(countries).map(
                                (item: CountryType) => (
                                  <Select.Option
                                    key={item.code}
                                    value={item.code}
                                  >
                                    {item.label}
                                  </Select.Option>
                                )
                              )}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Communication Mode"
                            name="communicationMode"
                            rules={[
                              {
                                required: false,
                                message: "Please input a Communication Mode!",
                              },
                            ]}
                          >
                            <Input type="tel" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Form.Item
                            label="Mobile"
                            name="mobile"
                            rules={[
                              {
                                required: false,
                                pattern: new RegExp("^[0-9]{10}$"),
                                message:
                                  "Please input a 10-digit Mobile Number!",
                              },
                            ]}
                          >
                            <Input type="tel" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Department Name"
                            name="departmentId"
                            rules={[
                              {
                                required: true,
                                message: "Please select a Department Name!",
                              },
                            ]}
                          >
                            <Select placeholder="Select a Department">
                              {deptData &&
                                deptData.length &&
                                deptData.map((dept: IDept, key: number) => {
                                  return (
                                    <Select.Option
                                      value={dept.departmentId}
                                      key={key}
                                    >
                                      {dept.departmentName}
                                    </Select.Option>
                                  );
                                })}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        label="Status"
                        name="jobStatus"
                        rules={[
                          { required: false, message: "Please input Status!" },
                        ]}
                      >
                        <Select
                          placeholder="Select a Status"
                          onChange={handleStatusChange}
                          defaultValue={defaultStatus}
                        >
                          {Object.values(StatusEnum).map((item: any) => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      {/* Hired fields */}
                      {showHired ? (
                        <>
                          <Divider />
                          <Row gutter={[16, 16]}>
                            <Col span={12} className="form-fields">
                              <Form.Item
                                label="Weekly Hours"
                                name="weeklyHours"
                                rules={[
                                  {
                                    required: true,
                                    message: "Please input Weekly Hours!",
                                  },
                                ]}
                              >
                                <Input />
                              </Form.Item>
                            </Col>
                            <Col span={12} className="form-fields">
                              <Form.Item
                                label="Project Url"
                                name="projectUrl"
                                rules={[
                                  {
                                    required: false,
                                    message: "Please input Project Url!",
                                  },
                                ]}
                              >
                                <Input />
                              </Form.Item>
                            </Col>

                            <Col span={8} className="form-fields">
                              <Form.Item
                                label="Contract status"
                                name="billingStatus"
                                rules={[
                                  {
                                    required: true,
                                    message: "Please select a Contract status!",
                                  },
                                ]}
                              >
                                <Select placeholder="Select a Contract status">
                                  {Object.values(ContractStatus).map(
                                    (item: any) => (
                                      <Select.Option
                                        key={item.value}
                                        value={item.value}
                                      >
                                        {item.name}
                                      </Select.Option>
                                    )
                                  )}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={8} className="form-fields">
                              <Form.Item
                                label="BillingType"
                                name="billingType"
                                rules={[
                                  {
                                    required: true,
                                    message: "Please select a BillingType!",
                                  },
                                ]}
                              >
                                <Select placeholder="Select a BillingType">
                                  {Object.values(BillingTypes).map(
                                    (item: any) => (
                                      <Select.Option
                                        key={item.value}
                                        value={item.value}
                                      >
                                        {item.name}
                                      </Select.Option>
                                    )
                                  )}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={8} className="form-fields">
                              <Form.Item
                                label="Start Date"
                                name="startDate"
                                rules={[
                                  {
                                    required: true,
                                    message: "Please input Start Date!",
                                  },
                                ]}
                              >
                                <DatePicker style={{ width: "100%" }} />
                              </Form.Item>
                            </Col>
                            <Col span={8} className="form-fields">
                              <Form.Item
                                label="Amount Spent"
                                name="amountSpent"
                                rules={[
                                  {
                                    required: true,
                                    message: "Please input Start Date!",
                                  },
                                ]}
                              >
                                <Input />
                              </Form.Item>
                            </Col>
                          </Row>
                        </>
                      ) : null}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row gutter={[30, 30]}>
            <Col span={24}>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Col>
    </Row>
  );
}
