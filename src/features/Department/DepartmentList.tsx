import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import deptService from "../../services/deptRequest";
import {
  deptSelector,
  isLoadingSelector,
} from "../../Selectors/departmentSelector";
import { Col, Row, Table, Card, Button, Tooltip, message, Modal } from "antd";
import SkeletonTable from "../../Layout/SkeletonTable";
import { SkeletonTableColumnsType } from "../../Layout/SkeletonTable/SkeletonTable";
import CustomSelect from "../../Components/CustomComponents/CustomSelect/CustomSelect";
import {
  EllipsisOutlined,
  ProjectOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  WindowsOutlined,
} from "@ant-design/icons";
import cardBackDrop from "../../assets/images/card-back.jpg";
import empService from "../../services/empRequest";
import { empSelector } from "../../Selectors/employeeSelector";
import DepartmentEmployee from "./DepartmentEmployees";
import { projectSelector } from "../../Selectors/projectSelector";
import projectService from "../../services/projectRequest";
import DepartmentProject from "./DepartmentProjects";

interface DataType {
  key: string;
  DepartmentName: string;
}

interface Props {
  loading: (progress: number, value: boolean) => void;
}

const DepartmentList = (props: Props) => {
  const { loading } = props;
  const deptData = useSelector(deptSelector);
  const isLoading = useSelector(isLoadingSelector);
  const dispatch = useDispatch();
  const [isOpenUp, setIsOpenUp] = useState(false);
  const [isOpenpProjectDepartments, setIsOpenpProjectDepartments] =
    useState(false);
  const empData = useSelector(empSelector);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [departmentProjects, setDepartmentProjects] = useState([]);
  const projectData = useSelector(projectSelector);

  const { Meta } = Card;

  useEffect(() => {
    loading(100, false);
    // dispatch<any>(deptService.fetchDepartmentList());
    // loading(100);
    loadDeptData();
  }, []);

  useEffect(() => {
    if (empData === null) {
      dispatch<any>(empService.fetchEmpList());
    }
  }, [dispatch, empData]);

  useEffect(() => {
    if (projectData === null) {
      dispatch<any>(projectService.fetchProjectList());
    }
  }, [dispatch, projectData]);

  const loadDeptData = async () => {
    await dispatch<any>(deptService.fetchDepartmentList());
    loading(100, false);
  };

  const columns = [
    {
      title: "Department Name",
      dataIndex: "departmentName",
      key: "departmentName",
    },
    {
      title: "Total Employee",
      dataIndex: "totaEmployees",
      key: "totaEmployees",
      align: "center" as const,
    },
    {
      title: "View All Employee",
      dataIndex: "actions",
      key: "actions",
      align: "center" as const,
      render: (params: any, rowData: any) => {
        return (
          <UnorderedListOutlined
            style={{ color: "#08c" }}
            onClick={() => onClickOnShowEmployeeIcon(rowData.actions)}
          />
        );
      },
    },
  ];

  const data: DataType[] =
    deptData &&
    deptData.length >= 0 &&
    deptData.map((data: any, id: number) => {
      return {
        departmentId: data.key,
        departmentName: data.departmentName,
        totaEmployees: data.employees.length,
        actions: data.departmentId,
      };
    });

  const onClickOnShowEmployeeIcon = async (id: string) => {
    setDepartmentEmployees([]);
    const data = empData.filter((item: any) => {
      return item.departmentId === id;
    });
    setDepartmentEmployees(data);
    setIsOpenUp(true);
  };

  const onClickShowProjectsIcon = async (id: string) => {
    setDepartmentProjects([]);
    const proData = deptData.flatMap((deptItem: any) =>
      deptItem.projectDepartments.filter(
        (projectItem: any) => projectItem.departmentId === id
      )
    );
    setDepartmentProjects(proData);
    setIsOpenpProjectDepartments(true);
  };

  const handleCloseEmployeeModal = () => {
    setIsOpenUp(false);
  };

  const handleCloseProjectModal = () => {
    setIsOpenpProjectDepartments(false);
  };

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
        {isLoading
          ? deptData &&
            deptData.map((items: any) => {
              return (
                <Col span={6}>
                  <Card
                    // style={{ width: 300 }}
                    cover={
                      <div className="overlayImgWrap">
                        <img alt="example" src={cardBackDrop} />
                        <div className="overlayImg">
                          <h3 className="secTitle">{items.departmentName}</h3>
                        </div>
                      </div>
                    }
                    actions={[
                      <>
                        <Tooltip title="Show Employees" placement="bottom">
                          <TeamOutlined
                            key="employeList"
                            onClick={(item: any) =>
                              onClickOnShowEmployeeIcon(items.departmentId)
                            }
                            style={{ color: "blueviolet" }}
                          />
                        </Tooltip>
                      </>,
                      <>
                        <Tooltip title="Show Projects" placement="bottom">
                          <ProjectOutlined
                            key="projectList"
                            onClick={(item: any) =>
                              onClickShowProjectsIcon(items.departmentId)
                            }
                            style={{ color: "greenyellow" }}
                          />
                        </Tooltip>
                      </>,
                    ]}
                  >
                    <Col
                      span={24}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <Meta title="Total Employees" />
                      <Meta
                        title={
                          items.employees.length ? items.employees.length : "0"
                        }
                      />
                    </Col>
                    <Col
                      span={24}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Meta title="Total Projects" />
                      <Meta
                        title={
                          items.projectDepartments.length
                            ? items.projectDepartments.length
                            : "0"
                        }
                      />
                    </Col>
                  </Card>
                </Col>
              );
            })
          : null}
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
        <Col span={24}>
          <Card
            bordered={false}
            className="criclebox tablespace mb-24 department-list-table"
            title={`Department List`}
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
      <Modal
        title="Employees"
        open={isOpenUp}
        onCancel={handleCloseEmployeeModal}
        footer={null}
        width={"100%"}
        style={{ maxWidth: 1200 }}
      >
        <DepartmentEmployee
          handleCloseDialog={handleCloseEmployeeModal}
          isOpen={isOpenUp}
          employeeData={departmentEmployees}
        />
      </Modal>
      <Modal
        title="Projects"
        open={isOpenpProjectDepartments}
        onCancel={handleCloseProjectModal}
        footer={null}
        width={"100%"}
        style={{ maxWidth: 1200 }}
      >
        <DepartmentProject
          handleCloseDialog={handleCloseProjectModal}
          isOpen={isOpenpProjectDepartments}
          projectData={departmentProjects}
        />
      </Modal>
    </>
  );
};

export default DepartmentList;
