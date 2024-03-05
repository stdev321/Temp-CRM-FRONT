import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jobReportsSelector } from "../../Selectors/jobReportSelector";
import { Col, Row, Table, Card } from "antd";
import SkeletonTable from "../../Layout/SkeletonTable";
import { SkeletonTableColumnsType } from "../../Layout/SkeletonTable/SkeletonTable";
import weeklyJobReportService from "../../services/jobReportsRequest";

interface DataType {
  employeeName?: string;
  totalApplied?: string;
  totalLeads?: string;
  totalHired?: string;
  totalConnectUsed?: string;
}

interface Props {
  loading: (progress: number, value: boolean) => void;
}

const JobReportList = (props: Props) => {
  const { loading } = props;
  const dispatch = useDispatch();
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [jobRow, setJobRow] = useState(null);
  const [rowData, setRowData] = useState(null);

  const jobReportsData = useSelector(jobReportsSelector);

  useEffect(() => {
    if (jobReportsData === null) {
      loading(20, false);
      dispatch<any>(weeklyJobReportService.fetchWeeklyJobReports());
      loading(100, false);
    } else {
      loading(100, false);
      const rows = jobReportsData.map((jobReport: any, index: number) => ({
        jobId: jobReport.jobId,
        employeeName: jobReport.employeeName,
        totalApplied: jobReport.totalApplied,
        totalLeads: jobReport.totalLeads,
        totalHired: jobReport.totalHired,
        totalConnectUsed: jobReport.totalConnectUsed,
      }));
      setRowData(rows);
      loading(100, false);
    }
  }, [jobReportsData]);

  const columns = [
    {
      title: "Employee Name",
      dataIndex: "employeeName",
      key: "employeeName",
    },
    {
      title: "Total Applied",
      dataIndex: "totalApplied",
      key: "totalApplied",
    },
    {
      title: "Total Leads",
      dataIndex: "totalLeads",
      key: "totalLeads",
    },
    {
      title: "Total Hired",
      dataIndex: "totalHired",
      key: "totalHired",
    },
    {
      title: "Total Connect Used",
      dataIndex: "totalConnectUsed",
      key: "totalConnectUsed",
    },
  ];

  const data: DataType[] =
    jobReportsData &&
    jobReportsData.length > 0 &&
    jobReportsData.map((data: any, id: number) => {
      return {
        jobId: data.jobId,
        employeeName: data.employeeName,
        totalApplied: data.totalApplied,
        totalLeads: data.totalApplied,
        totalHired: data.totalHired,
        totalConnectUsed: data.totalConnectUsed,
      };
    });

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
        <Col span={24}>
          <Card
            bordered={false}
            className="criclebox tablespace mb-24"
            title={`Sales Team Reports`}
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
};

export default JobReportList;
