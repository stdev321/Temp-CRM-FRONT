import React, {
  FC,
  ReactNode,
  startTransition,
  useEffect,
  useState,
} from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
// import stLogo from "../assets/images/logo.jpg";
import stLogo from "../assets/images/supreme_logo_footer-white.svg";
import { Layout, Menu, Button, theme, Row, Col, Divider } from "antd";
import TopBar from "./TopBar/TopBar";
import BreadCrumb from "./Breadcrumb/Breadcrumb";
import { useNavigate } from "react-router-dom";
import NavbarItems from "./NavbarItems";
import authService from "../services/authServices";
import empService from "../services/empRequest";
import { useDispatch, useSelector } from "react-redux";
import { deptSelector } from "../Selectors/departmentSelector";
import { RoleEnum } from "../features/Employee/EmployeeModel";
import deptService from "../services/deptRequest";
import { empSelector } from "../Selectors/employeeSelector";
import { PATH_NAME } from "../Config";

const { Header, Sider, Content } = Layout;

type Props = {
  children: ReactNode;
  loading: (progress: number, value: any) => void;
};

const MainLayout: FC<Props> = (typeProps: Props) => {
  // Required Selectors and States
  const userInfo: any = JSON.parse(authService.getUser());
  const dispatch = useDispatch();
  const deptData = useSelector(deptSelector);
  const empData = useSelector(empSelector);
  const navigate = useNavigate();

  const { children, loading } = typeProps;
  const [collapsed, setCollapsed] = useState(false);

  // Required UseEffects

  useEffect(() => {
    if (!deptData) {
      if (
        userInfo?.role === RoleEnum.BDM.name ||
        userInfo?.role === RoleEnum.BD.name ||
        userInfo?.role === RoleEnum.Admin.name ||
        userInfo?.role === RoleEnum.TeamLead.name ||
        userInfo?.role === RoleEnum.Employee.name
      ) {
        dispatch<any>(deptService.fetchDepartmentList());
      }
    }
  }, [deptData]);

  useEffect(() => {
    if (!empData) {
      dispatch<any>(empService.fetchEmpList());
    }
  }, [empData]);

  let loggedInUser: any = [];
  const isPersonating = localStorage.getItem("impersonating");
  if (authService.getUser()) {
    loggedInUser = JSON.parse(authService.getUser());
  }

  const handleStopImpersonation = async () => {
    try {
      // Retrieve the authenticated user's ID from the localStorage or your authentication system.
      // Adjust the key based on how the user ID is stored in the token.
      loading(10, true);
      const loggedInUser = JSON.parse(authService.getUser());
      localStorage.getItem(loggedInUser.employeeId);
      const adminId = localStorage.getItem("impersonator");
      if (adminId && loggedInUser) {
        const response = await empService.stopImpersonation(
          loggedInUser.employeeId,
          adminId
        );

        // Check the response status to handle success or error
        if (response.status == 200) {
          localStorage.removeItem("impersonating");
          authService.setSession("accessToken", response.data.api_token);
          authService.setSession("user", JSON.stringify(response.data.user));
          authService.setSession("role", response.data.user.role);
          if (authService.getRole() === "Admin") {
            navigate(`${PATH_NAME.ADMIN}${PATH_NAME.EMPLOYEE}`);
          }
          window.location.reload();
        } else {
          // Handle API errors if needed
          console.error("Error stopping impersonation:", response.data.Message);
        }
      }
    } catch (error) {
      // Handle any other errors that might occur (e.g., network issues)
      console.error("Error stopping impersonation:", error);
    }
  };

  return (
    <>
      <Layout
        className="mainBody"
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
        }}
      >
        <Sider
          // theme="dark"
          className="sideNav"
          width={250}
          trigger={null}
          collapsible
          collapsed={collapsed}
        >
          <div className="mainLogo">
            <img
              onClick={() => navigate(PATH_NAME.DASHBOARD)}
              src={stLogo}
              style={{
                maxHeight: "100%",
                width: "90%",
                borderRadius: "0px",
                margin: "10px",
              }}
              alt="logo"
            />
          </div>
          <Divider className="devider" />
          <div className="scrollAbleY" style={{ height: "100%" }}>
            <NavbarItems loading={loading} />
          </div>
          <Divider className="devider bottomDevider" />
          <div className="footer">
            <h1>Version 2.0</h1>
          </div>
        </Sider>
        <Layout>
          <Header
            style={{
              zIndex: "1000",
              marginBottom: "10px",
              padding: "0px",
              margin: "10px 5px",
              borderRadius: "10px",
            }}
          >
            <Row
              gutter={{ xs: 3, sm: 6 }}
              style={{ justifyContent: "space-between" }}
            >
              <Col className="gutter-row" span={9}>
                <Button
                  type="text"
                  icon={
                    collapsed ? (
                      <MenuUnfoldOutlined style={{ color: "#000" }} />
                    ) : (
                      <MenuFoldOutlined style={{ color: "#000" }} />
                    )
                  }
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                    fontSize: "16px",
                    width: 64,
                    height: 64,
                    borderRadius: "10px",
                  }}
                />
              </Col>
              <Col span={13}>
                <div>
                  {/* Display "Stop Impersonation" button when impersonation is true */}
                  {isPersonating === "true" && (
                    <Col>
                      <Button
                        color="secondary"
                        size="large"
                        onClick={handleStopImpersonation}
                      >
                        Stop Impersonation
                      </Button>
                    </Col>
                  )}
                </div>
              </Col>
              <Col span={2}>
                <TopBar />
              </Col>
            </Row>
          </Header>
          <div className="MainLayout">
            <BreadCrumb />
            <Content className="content">{children}</Content>
          </div>
        </Layout>
      </Layout>
    </>
  );
};

export default MainLayout;
