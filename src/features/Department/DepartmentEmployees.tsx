import React, { useEffect, useState } from "react";
import { Card, Col, Row, Table } from "antd";
import SkeletonTable from "../../Layout/SkeletonTable";
import { SkeletonTableColumnsType } from "../../Layout/SkeletonTable/SkeletonTable";
import { RoleEnum } from "../Employee/EmployeeModel";

interface DataType {
  key: string;
  employeeName: string;
  role: string;
  employeeId: string;
  employeeNumber: string;
  email: string;
}

type IProps = {
  isOpen: boolean;
  handleCloseDialog: () => void;
  employeeData: any;
};

export default function DepartmentEmployee({
  isOpen,
  handleCloseDialog,
  employeeData,
}: IProps): JSX.Element {
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

  const columns: any[] = [
    {
      title: "Id",
      dataIndex: "employeeNumber",
      key: "employeeNumber",
      width: 50,
    },
    {
      title: "Name",
      dataIndex: "employeeName",
      key: "employeeName",
      width: 50,
      render: (employeeName: string) => employeeName?.substring(0, 20),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 50,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 50,
      render: (value: number) => getEnumNameFromValue(value, RoleEnum),
    },
  ];

  const data: DataType[] =
    employeeData &&
    employeeData.length > 0 &&
    employeeData.map((data: any, item: number) => {
      return {
        employeeId: data.employeeId,
        employeeName: `${data.firstName} ${data.lastName}`,
        role: data.role,
        employeeNumber: data.employeeNumber,
        email: data.email,
      };
    });

  console.log({ employeeData });

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
