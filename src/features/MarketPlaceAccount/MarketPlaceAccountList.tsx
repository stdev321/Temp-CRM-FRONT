import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { marketPlaceAccountSelector } from "../../Selectors/marketPlaceAccountSelector";
import { Col, Row, Table, Card, Space, Button, Modal, Select } from "antd";
import marketPlaceAccountService from "../../services/marketPlaceAccountRequest";
import SkeletonTable from "../../Layout/SkeletonTable";
import { SkeletonTableColumnsType } from "../../Layout/SkeletonTable/SkeletonTable";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import AddMarketPlaceAccount from "./AddMarketPlaceAccount";
import EditMarketPlaceAccount from "./EditMarketPlaceAccount";
import { AccountTypes } from "../../Enums/LeadsConnect/BillingStatus";
import { MarketPlaceAccountEnum } from "../../Enums/MarketPlaceAccountEnum/MarketPlaceAccountEnum";
import { empSelector } from "../../Selectors/employeeSelector";
import empService from "../../services/empRequest";

interface DataType {
  key: string;
  name: string;
  technology: string;
  status: string;
  jobSuccessrate: string;
  earning: string;
  remarks: string;
  accounts: number;
}

interface Props {
  loading: (progress: number, value: boolean) => void;
}

const MarketPlaceAccount = (props: Props) => {
  //Main pages
  const { loading } = props;
  const dispatch = useDispatch();
  const accountData = useSelector(marketPlaceAccountSelector);
  const employeeData = useSelector(empSelector);

  // States
  const [rowData, setRowData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [filters, setFilters] = useState({
    marketPlaceAccountsStatus: "",
    accounts: "",
    employee: "",
  });

  // UseEffects ========================
  useEffect(() => {
    if (!accountData) {
      dispatch<any>(marketPlaceAccountService.fetchMarketPlaceAccountList());
    }
  }, [dispatch, accountData]);

  useEffect(() => {
    loading(100, false);
    if (employeeData !== null && accountData !== null) {
      const rows = accountData.map((account: any, index: number) => ({
        id: account.id,
        name: account.name,
        technology: account.technology,
        marketPlaceAccountsStatus: account.marketPlaceAccountsStatus,
        jobSuccessRate: account.jobSuccessRate,
        earning: account.earning,
        remarks: account.remarks,
        accounts: account.accounts,
      }));
      setRowData(rows);
    }
  }, [dispatch, accountData, employeeData]);

  //Other workings
  const getEnumNameFromValue = (
    value: number | string,
    enumObject: Record<string, any>
  ) => {
    // Convert value to number
    const numericValue =
      typeof value === "string" ? parseInt(value, 10) : value;

    const match = Object.values(enumObject).find(
      (item) => item.value === numericValue
    );

    return match ? match.name : undefined;
  };

  const onClickEditUpworkId = async (id: any) => {
    setEditRow(null);
    const response =
      await marketPlaceAccountService.fetchMarketPlaceAccountById(id);
    setIsOpenEditModal(true);
    setEditRow(response.marketPlaceAccount);
  };

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const columns = [
    {
      title: "Upwork ID Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Technology",
      dataIndex: "technology",
      key: "technology",
    },
    {
      title: "Status",
      dataIndex: "marketPlaceAccountsStatus",
      key: "marketPlaceAccountsStatus",
      render: (value: number | string) =>
        getEnumNameFromValue(value, MarketPlaceAccountEnum),
    },
    {
      title: "Job Success rate",
      dataIndex: "jobSuccessRate",
      key: "jobSuccessRate",
    },
    {
      title: "Account Types",
      dataIndex: "accounts",
      key: "accounts",
      render: (value: number | string) =>
        getEnumNameFromValue(value, AccountTypes),
    },
    {
      title: "Earning",
      dataIndex: "earning",
      key: "earning",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
    },
    {
      title: "Actions",
      dataIndex: "action",
      key: "action",
      description: "Edit Project Health",
      render: (e: any, rowData: any) => (
        <Space>
          <a href="#" onClick={() => onClickEditUpworkId(rowData.id)}>
            <EditOutlined />
          </a>
        </Space>
      ),
    },
  ];

  const handleCloseEditModal = () => {
    setIsOpenEditModal(false);
  };

  const filterTableData = (type: any, data: any) => {
    switch (type) {
      case "marketPlaceAccountsStatus":
        setFilters({
          ...filters,
          marketPlaceAccountsStatus: data?.value,
        });
        break;
      case "employee":
        setFilters({
          ...filters,
          employee: data?.value,
        });
        break;
      case "accounts":
        setFilters({
          ...filters,
          accounts: data?.value,
        });
        break;
    }
  };

  const filteredData = rowData.filter((row: any) => {
    // Check each filter condition

    const nameCondition = !filters.employee || row.id === filters.employee;

    const accountCondition =
      !filters.accounts || row.accounts === filters.accounts;

    const statusCondition =
      !filters.marketPlaceAccountsStatus ||
      row.marketPlaceAccountsStatus === filters.marketPlaceAccountsStatus;

    // Return true if all conditions are met
    return nameCondition && accountCondition && statusCondition;
  });

  const employeeOptions = accountData?.map((item: any) => {
    return {
      label: `${item.name}`,
      value: item.id,
    };
  });

  const statusOptions = Object.values(MarketPlaceAccountEnum).map(
    (item: any) => {
      return { label: item.name, value: item.value };
    }
  );

  const accountOptions = Object.values(AccountTypes).map((item: any) => {
    return { label: item.name, value: item.value };
  });

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
        <Col span={24}>
          <>
            <Row style={{ display: "flex", justifyContent: "space-between" }}>
              <Col span={20}>
                <Row
                  gutter={[16, 16]}
                  style={{ display: "flex", flexDirection: "row" }}
                >
                  <Col>
                    <Select
                      style={{ width: 200 }}
                      showSearch
                      placeholder="Account"
                      size="large"
                      allowClear
                      options={accountOptions}
                      onChange={(_, value) =>
                        filterTableData("accounts", value)
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
                      showSearch
                      placeholder="Search Employee"
                      size="large"
                      allowClear
                      options={employeeOptions}
                      onChange={(_, value) =>
                        filterTableData("employee", value)
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
                      options={statusOptions}
                      onChange={(_, value) =>
                        filterTableData("marketPlaceAccountsStatus", value)
                      }
                    />
                  </Col>
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
                  Create Upwork Account
                </Button>
              </Col>
            </Row>
          </>
        </Col>
        <Col span={24}>
          <Card
            bordered={false}
            className="criclebox tablespace mb-24"
            title={`Upwork Accounts`}
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
                />
              </SkeletonTable>
            </div>
          </Card>
        </Col>
      </Row>
      {editRow && (
        <Modal
          style={{ textAlign: "center" }}
          open={isOpenEditModal}
          title="Edit Upwork Id's"
          onCancel={handleCloseEditModal}
          footer={null}
        >
          <EditMarketPlaceAccount
            handleCloseDialog={handleCloseEditModal}
            isOpen={isOpenEditModal}
            accountData={editRow}
            {...props}
          />
        </Modal>
      )}

      <Modal
        width={800}
        open={isOpen}
        destroyOnClose
        title="Create Upwork Account"
        style={{ textAlign: "center", paddingBottom: "30px" }}
        onCancel={() => {
          setIsOpen(false);
        }}
        footer={null}
      >
        <AddMarketPlaceAccount
          handleCloseDialog={handleCloseModal}
          isOpen={isOpen}
          accountData={accountData}
        />
      </Modal>
    </>
  );
};

export default MarketPlaceAccount;
