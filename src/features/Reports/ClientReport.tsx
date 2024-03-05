import { useEffect, useState } from "react";
import {
  Col,
  Row,
  Card,
  Select,
  Table,
  Tooltip,
  Button,
  Space,
  Divider,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import SkeletonTable from "../../Layout/SkeletonTable";
import { SkeletonTableColumnsType } from "../../Layout/SkeletonTable/SkeletonTable";
import {
  reportSelector,
  isReportLoadingSelector,
} from "../../Selectors/reportSelector";
import reportService from "../../services/reportRequest";
import { clientSelector } from "../../Selectors/clientSelector";
import { countries } from "../../Helper/countries";
import moment from "moment";
import { InfoCircleOutlined } from "@ant-design/icons";
import {
  AccountTypes,
  ContractType,
} from "../../Enums/LeadsConnect/BillingStatus";

interface Props {
  loading: (progress: number, value: boolean) => void;
}
const ClientReport = (props: Props) => {
  //Main page
  const dispatch = useDispatch();
  const { loading } = props;
  const reportData = useSelector(reportSelector);

  //States
  const [filters, setFilters] = useState({
    clientName: "",
    department: "",
    country: "",
  });
  const [rowData, setRowData] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<any>([]);

  const clientOptions = reportData?.map((item: any) => {
    return {
      label: `${item.clientName}`,
      value: item.clientId,
    };
  });

  const countryList = countries.map((item: any) => {
    return { label: item.label, value: item.code };
  });

  //Use effects
  useEffect(() => {
    if (!reportData) {
      dispatch<any>(reportService.fetchClientReports());
    }
  }, [dispatch, reportData]);

  useEffect(() => {
    loading(100, false);
    if (reportData !== null) {
      const rows = reportData.map((client: any) => ({
        clientId: client.clientId,
        clientName: client.clientName,
        clientEmail: client.clientEmail,
        contactNo: client.contactNo,
        accounts: client.accounts,
        marketPlaceAccountId: client.marketPlaceAccountId,
        marketPlaceName: client.marketPlaceName,
        lastFollowUpRemark: client.lastFollowUpRemark,
        lastFollowUpDate: client.lastFollowUpDate,
        project: client.project,
        country: client.country,
      }));
      setRowData(rows);
    }
  }, [dispatch, reportData]);

  // other workings

  const filteredData = rowData
    .filter((row: any) => {
      // Check each filter condition
      const clientCondition =
        !filters.clientName || row.clientId === filters.clientName;

      const countryCondition =
        !filters.country || row.country === filters.country;

      // const clientOption =
      //   !filters.clientName || row.clientId === filters.clientName;
      // // Return true if all conditions are met
      return clientCondition && countryCondition;

      //return null;
    })
    ?.map((data: Record<string, any>) => ({ ...data, key: data.clientId }));

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

  const filterTableData = (type: any, data: any) => {
    switch (type) {
      case "country":
        setFilters({
          ...filters,
          country: data?.value,
        });
        break;
      case "client":
        setFilters({
          ...filters,
          clientName: data?.value,
        });
    }
  };

  const columns = [
    {
      title: "Client Name",
      dataIndex: "clientName",
      key: "clientName",
    },
    {
      title: "Upwork ID",
      dataIndex: "marketPlaceName",
      key: "marketPlaceName",
    },
    {
      title: "Last FollowUp Date",
      dataIndex: "lastFollowUpDate",
      key: "lastFollowUpDate",
      render: (date: moment.MomentInput) => {
        if (date === null || date === undefined || date === "") {
          return "N/A";
        }

        return moment(date).format("DD MMMM YYYY");
      },
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      render: (e: any, row: any) => {
        const country = countries.find((c) => c.code === row.country);
        return country ? country.label : undefined;
      },
    },
    {
      title: "Actions",
      dataIndex: "action",
      key: "action",
      description: "Project history",
      render: (e: any, rowData: any) => (
        <Space>
          {/* <Tooltip title="Project History">
            <Button type="link" onClick={() => showHistoryModal(rowData.key)}>
              <HistoryOutlined style={{ color: "red" }} />
            </Button>
          </Tooltip> */}
          <Tooltip title="Information">
            <Button
              type="link"
              onClick={() =>
                handleExpand(
                  !expandedRowKeys.includes(rowData.clientId),
                  rowData
                )
              }
            >
              <InfoCircleOutlined style={{ color: "green" }} />
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

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

  const expendableRows = (record: any) => {
    const accounts = getEnumNameFromValue(record.accounts, AccountTypes);
    const projectName = record.project?.map((item: any) => item.contractName);

    return (
      <Row style={{ padding: 20 }} gutter={[16, 16]}>
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <b>Client Email Address:</b>
              {record.clientEmail ? record.clientEmail : "N/A"}
            </Col>
            <Col span={8}>
              <b>Client Contract Number:</b>
              {record.contactNo ? record.record.contactNo : "N/A"}
            </Col>
            <Col span={8}>
              <b>Last Follow Up Remarks:</b> {record.lastFollowUpRemark}
            </Col>
          </Row>
          <Divider />
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <b>Account Type:</b> {accounts}
            </Col>
            <Col span={6}>
              <b>Projects:</b> {projectName?.join(", ")}
            </Col>
          </Row>
        </Col>
      </Row>
    );
  };

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
        <>
          <Col span={21}>
            <Row gutter={[16, 16]}>
              <Col>
                <Select
                  style={{ width: 250 }}
                  showSearch
                  placeholder="Country"
                  size="large"
                  allowClear
                  options={countryList}
                  onChange={(_, value) => filterTableData("country", value)}
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
                  style={{ width: 250 }}
                  showSearch
                  placeholder="Search Client"
                  size="large"
                  allowClear
                  options={clientOptions}
                  onChange={(_, value) => filterTableData("client", value)}
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
    </>
  );
};

export default ClientReport;
