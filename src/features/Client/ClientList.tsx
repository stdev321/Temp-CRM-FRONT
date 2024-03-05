import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clientSelector } from "../../Selectors/clientSelector";
import {
  Col,
  Row,
  Table,
  Card,
  message,
  Modal,
  Tooltip,
  Select,
  Button,
  Switch,
  TableProps,
  Input,
} from "antd";
import clientService from "../../services/clientRequest";
import SkeletonTable from "../../Layout/SkeletonTable";
import { SkeletonTableColumnsType } from "../../Layout/SkeletonTable/SkeletonTable";
import {
  EditOutlined,
  CheckCircleTwoTone,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import EditClient from "./EditClient";
import {
  AccountTypes,
  ProjectStatus,
} from "../../Enums/LeadsConnect/BillingStatus";
import { countries } from "../../Helper/countries";
import moment from "moment";
import { marketPlaceAccountSelector } from "../../Selectors/marketPlaceAccountSelector";
import authService from "../../services/authServices";
import marketPlaceAccountService from "../../services/marketPlaceAccountRequest";
import jobService from "../../services/leadsConnectService";
import { projectSelector } from "../../Selectors/projectSelector";
import projectService from "../../services/projectRequest";
import { Key } from "antd/lib/table/interface";
import { Space, DatePicker } from "antd";
import dayjs from "dayjs";

interface DataType {
  key: string;
  clientName: string;
  clientEmail?: string;
  contactNo?: string;
  jobId: string;
  departmentId: string;
  marketPlaceAccountId: string;
  communicationId: string;
  accountType: string;
  country?: string;
  amountSpent: string;
  lastFollowUpRemark?: string;
  lastFollowUpDate?: string;
  startDate?: string;
}

interface Props {
  loading: (progress: number, value: boolean) => void;
}

const ClientList = (props: Props) => {
  //Main pages
  const { loading } = props;
  const dispatch = useDispatch();
  const clientData = useSelector(clientSelector);
  const accountData = useSelector(marketPlaceAccountSelector);
  const refFile = useRef<any>();
  const projectData = useSelector(projectSelector);

  // States
  const [rowData, setRowData] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [copiedRowIndex, setCopiedRowIndex] = useState<number | null>(null);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [fileList, setFileList] = useState<FileList | null>(null);
  const [activeClients, setActiveClients] = useState(false); // State for toggle button
  const { YearPicker } = DatePicker;

  const [filters, setFilters] = useState({
    marketplaceName: "",
    country: "",
    clientName: "",
  });
  const profileList = accountData?.map((item: any) => {
    return { label: item.name, value: item.id };
  });

  const clientOptions = clientData?.map((item: any) => {
    return {
      label: `${item.clientName}`,
      value: item.clientId,
    };
  });

  const countryList = countries.map((item: any) => {
    return { label: item.label, value: item.code };
  });

  // UseEffects ========================
  useEffect(() => {
    if (!accountData) {
      dispatch<any>(marketPlaceAccountService.fetchMarketPlaceAccountList());
    }
  }, [accountData]);

  useEffect(() => {
    if (!clientData) {
      dispatch<any>(clientService.fetchClientList());
    }
  }, [dispatch, clientData]);

  useEffect(() => {
    if (!projectData) {
      dispatch<any>(projectService.fetchProjectList());
    }
  }, [dispatch, projectData]);

  useEffect(() => {
    loading(100, false);
    if (accountData !== null && clientData !== null && projectData) {
      const rows = clientData.map((client: any, index: number) => ({
        clientId: client.clientId,
        clientName: client.clientName,
        clientEmail: client.clientEmail,
        contactNo: client.contactNo,
        departmentId: client.departmentId,
        marketplaceName: client.marketplaceName,
        marketPlaceAccountId: client.marketPlaceAccountId,
        accounts: client.accounts,
        country: client.country,
        lastFollowUpRemark: client.lastFollowUpRemark,
        communicationId: client.communicationId,
        communicationName: client.communicationName,
        lastFollowUpDate: client.lastFollowUpDate,
        startDate: client.startDate,
      }));
      setRowData(rows);
    }
  }, [dispatch, clientData, accountData, projectData]);

  // Other Workings
  const onClickEditClient = async (clientId: any) => {
    loading(10, false);
    setEditRow(null);
    const response = await clientService.fetchClientById(clientId);
    if (response.error) {
      message.error(response.message);
    } else {
      const clientAccount =
        Object.values(AccountTypes).find(
          (rate: any) => rate.value === response?.data.client.accounts
        )?.name || null;
      setIsOpenEditModal(true);
      setEditRow({
        ...response?.data.client,
        accounts: clientAccount,
      });
      loading(100, false);
    }
  };

  const handleCloseEditModal = () => {
    setIsOpenEditModal(false);
  };

  const filteredData = rowData.filter((row: any) => {
    // Check each filter condition

    const profileCondition =
      !filters.marketplaceName ||
      row.marketPlaceAccountId === filters.marketplaceName;

    const countryCondition =
      !filters.country || row.country === filters.country;

    const clientOption =
      !filters.clientName || row.clientId === filters.clientName;

    // Return true if all conditions are met
    return profileCondition && countryCondition && clientOption;
  });

  // Filter active clients based on project data
  const getActiveClients = () => {
    if (activeClients) {
      const activeClientIds = projectData.reduce((acc: any, project: any) => {
        if (project.endDate === null) {
          acc.add(project.clientId);
        }
        return acc;
      }, new Set<string>());
      return filteredData.filter((row: any) =>
        activeClientIds.has(row.clientId)
      );
    }
    return filteredData;
  };

  const filterTableData = (type: any, data: any) => {
    switch (type) {
      case "country":
        setFilters({
          ...filters,
          country: data?.value,
        });
        break;
      case "profile":
        setFilters({
          ...filters,
          marketplaceName: data?.value,
        });
        break;
      case "client":
        setFilters({
          ...filters,
          clientName: data?.value,
        });
    }
  };

  const handleCopyToClipboard = (text: string, rowIndex: number) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    setCopiedRowIndex(rowIndex);
    message.success("issue copied to clipboard");
    setTimeout(() => {
      setCopiedRowIndex(null);
    }, 3000); // Reset copiedRowIndex state after 3 seconds
  };

  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return ""; // return an empty string for invalid dates
    } else {
      return date;
    }
  };

  const columns = [
    {
      title: "Client Name",
      dataIndex: "clientName",
      key: "clientName",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div style={{ padding: 8 }}>
          <Select
            placeholder="Select client name"
            showSearch
            value={selectedKeys[0]}
            options={clientOptions}
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
          return record.clientId.toLowerCase().includes(value.toLowerCase());
        }
        // Handle other cases if necessary
        return false; // Default return value if value is not a string
      },
      render: (text: string) => text,
    },
    {
      title: "Year",
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a: any, b: any) => {
        return (
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      },
      render: (text: string | number | Date) => {
        const formattedDate = formatDate(text);
        return formattedDate ? formattedDate.getFullYear() : "";
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }: any) => (
        <div style={{ padding: 8 }}>
          <Space direction="vertical" style={{ width: 200 }}>
            <YearPicker
              placeholder="Select year"
              defaultValue={
                selectedKeys[0] ? dayjs(selectedKeys[0], "YYYY") : undefined
              }
              onChange={(value) => {
                setSelectedKeys(value ? [value.format("YYYY")] : []);
                confirm(); // Confirm the filter when a year is picked
              }}
            />
          </Space>
        </div>
      ),
      filterIcon: (filtered: any) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value: string | boolean | Key, record: any) => {
        if (typeof value === "string") {
          const year = Number(value);
          if (!isNaN(year)) {
            if (year === new Date().getFullYear()) {
              return true; // Include records for the current year
            } else {
              const startDateYear = new Date(record.startDate).getFullYear();
              return startDateYear === year;
            }
          }
        }
        return false;
      },
    },
    {
      title: "Month",
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a: any, b: any) => {
        return (
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      },
      render: (text: string | number | Date) => {
        const formattedDate = formatDate(text);
        return formattedDate
          ? formattedDate.toLocaleString("en-US", {
              month: "long",
            })
          : "";
      },
    },
    {
      title: "Upwork Hired Profile",
      dataIndex: "marketplaceName",
      key: "marketplaceName",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div style={{ padding: 8 }}>
          <Select
            showSearch // Add this property to enable search
            placeholder="Select Hired Profile"
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
          return record.marketPlaceAccountId
            .toLowerCase()
            .includes(value.toLowerCase());
        }
        // Handle other cases if necessary
        return false; // Default return value if value is not a string
      },
      render: (text: string) => text,
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div style={{ padding: 8 }}>
          <Select
            showSearch // Add this property to enable search
            placeholder="Select Country"
            value={selectedKeys[0]}
            options={countryList}
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
          return record.country.toLowerCase().includes(value.toLowerCase());
        }
        // Handle other cases if necessary
        return false; // Default return value if value is not a string
      },
      render: (e: any, item: any) => {
        const countryData = countries.find(
          (country: any) => country.code === item.country
        );
        return countryData ? countryData.label : e;
      },
    },
    {
      title: "Last Followup Remark",
      dataIndex: "lastFollowUpRemark",
      key: "lastFollowUpRemark",
      render: (lastFollowUpRemark: string, record: any, rowIndex: number) => (
        <span
          style={{
            cursor: "pointer",
            maxHeight: "none",
            width: "100%",
            maxWidth: "240px",
          }}
          onClick={() => handleCopyToClipboard(lastFollowUpRemark, rowIndex)}
        >
          <Tooltip
            overlayStyle={{
              position: "fixed",
              overflow: "auto",
              maxHeight: "160px",
            }}
            placement="topLeft"
            title={copiedRowIndex === rowIndex ? "Copied!" : lastFollowUpRemark}
            trigger="hover"
          >
            <span>
              {lastFollowUpRemark}{" "}
              {copiedRowIndex === rowIndex && (
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              )}
            </span>
          </Tooltip>
        </span>
      ),
    },
    {
      title: "Last Follow Up Date",
      dataIndex: "lastFollowUpDate",
      key: "lastFollowUpDate",
      render: (date: moment.MomentInput) => {
        if (date === null || date === undefined || date === "") {
          return "";
        }

        return moment(date).format("DD MMMM YYYY");
      },
    },
    {
      title: "Actions",
      dataIndex: "action",
      key: "action",
      description: "Edit Project Health",
      render: (e: any, rowData: any) => (
        <Space>
          <a href="#" onClick={() => onClickEditClient(rowData.clientId)}>
            <EditOutlined />
          </a>
        </Space>
      ),
    },
  ];

  const handelUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileList(e.target.files);
    loading(10, true);

    const response = await jobService.importJobExcel(e.target.files);
    if (response.status === 400) {
      message.error("Something Went Wrong");
    } else {
      message.success(response.data.message);
    }

    dispatch<any>(clientService.fetchClientList());
    loading(10, false);
    e.target.value = "";
  };

  const allProjectsHaveNullEndDate = projectData?.every(
    (project: any) => project.endDate === null
  );

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
        <>
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
        </>
        <Col span={24}>
          <Card
            bordered={false}
            className="criclebox tablespace mb-24"
            title={`Client List`}
          >
            <div className="table-responsive">
              <SkeletonTable
                columns={columns as SkeletonTableColumnsType[]}
                active
              >
                <Table
                  columns={columns}
                  dataSource={getActiveClients()} // Use filtered data based on activeClients state
                  size="large"
                />
              </SkeletonTable>
            </div>
          </Card>
          <div className="switchModeWrap">
            <Tooltip title="Show active clients when checked">
              <Switch
                checked={activeClients} // Bind toggle button state
                onChange={(checked) => setActiveClients(checked)} // Update toggle button state
                disabled={allProjectsHaveNullEndDate}
              />
            </Tooltip>
          </div>
        </Col>
      </Row>
      {editRow && (
        <Modal
          className="text-center"
          open={isOpenEditModal}
          title="Edit Client"
          onCancel={handleCloseEditModal}
          footer={null}
        >
          <EditClient
            handleCloseDialog={handleCloseEditModal}
            isOpen={isOpenEditModal}
            clientData={editRow}
          />
        </Modal>
      )}
    </>
  );
};

export default ClientList;
