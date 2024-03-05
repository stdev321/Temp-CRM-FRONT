import React, { useEffect, useState } from "react";
import { Card, Col, Row, Table } from "antd";
import SkeletonTable from "../../Layout/SkeletonTable";
import { SkeletonTableColumnsType } from "../../Layout/SkeletonTable/SkeletonTable";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { clientSelector } from "../../Selectors/clientSelector";
import clientService from "../../services/clientRequest";
import { marketPlaceAccountSelector } from "../../Selectors/marketPlaceAccountSelector";
import marketPlaceAccountService from "../../services/marketPlaceAccountRequest";

interface DataType {
  key: string;
  startDate: string;
  contractName: string;
  clientName: string;
  hoursPerWeek: string;
  upworkName: string;
  clientId: string;
  id: string;
  upworkId: string;
}

type IProps = {
  isOpen: boolean;
  handleCloseDialog: () => void;
  projectData: any;
};

export default function DepartmentProject({
  isOpen,
  handleCloseDialog,
  projectData,
}: IProps): JSX.Element {
  const dispatch = useDispatch();

  const clientData = useSelector(clientSelector);
  const upworkData = useSelector(marketPlaceAccountSelector);

  useEffect(() => {
    if (!clientData) {
      dispatch<any>(clientService.fetchClientList());
    }
  }, [dispatch, clientData]);

  useEffect(() => {
    if (!upworkData) {
      dispatch<any>(marketPlaceAccountService.fetchMarketPlaceAccountList());
    }
  }, [dispatch, upworkData]);

  const columns: any[] = [
    {
      title: "Contract Name",
      dataIndex: "contractName",
      key: "contractName",
      width: 50,
    },
    {
      title: "Client Name",
      dataIndex: "clientName",
      key: "clientName",
      width: 50,
    },
    {
      title: "Upwork Name",
      dataIndex: "upworkName",
      key: "upworkName",
      width: 50,
    },
    {
      title: "Weekly Hours",
      dataIndex: "hoursPerWeek",
      key: "hoursPerWeek",
      width: 50,
    },
    {
      title: "Contract Start Date",
      dataIndex: "startDate",
      key: "startDate",
      width: 50,
      render: (date: moment.MomentInput) => moment(date).format("DD MMMM YYYY"),
    },
  ];

  const data: DataType[] =
    projectData &&
    projectData.length > 0 &&
    projectData.map((data: any, item: number) => {
      const client = clientData?.find(
        (client: any) => client.clientId === data.project?.clientId
      );
      const upworkName = upworkData?.find(
        (item: any) => item.id === data.project?.upworkId
      );
      return {
        id: data.id,
        contractName: data.project?.contractName,
        clientId: data.project?.clientId,
        clientName: client ? client.clientName : "",
        upworkId: data.project?.upworkId,
        upworkName: upworkName ? upworkName.name : "",
        hoursPerWeek: data.project?.hoursPerWeek,
        startDate: data.project?.startDate,
      };
    });

  return (
    <>
      <Row gutter={[16, 16]} style={{ display: "block", width: "100%" }}>
        <Col span={24}>
          <Card
            bordered={false}
            className="criclebox tablespace mb-24"
            // title={`Project History`}
          >
            <div className="table-responsive">
              <SkeletonTable
                columns={columns as SkeletonTableColumnsType[]}
                active
              >
                <Table columns={columns} dataSource={data} size="large" />
              </SkeletonTable>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
}
