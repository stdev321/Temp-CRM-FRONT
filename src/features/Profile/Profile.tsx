import React, { useEffect, useMemo, useState } from "react";
import backDrop from "../../assets/images/bg-profile.jpg";
import { Avatar, Card, Col, Descriptions, Row, Tabs } from "antd";
import { useSelector } from "react-redux";
import { UserOutlined } from "@ant-design/icons";
import TabPane from "antd/es/tabs/TabPane";
import authService from "../../services/authServices";
import { deptSelector } from "../../Selectors/departmentSelector";
import dayjs from "dayjs";
import moment from "moment";
import projectService from "../../services/projectRequest";

const Profile = () => {
  const loggedInUser = JSON.parse(authService.getUser());
  const profilePicture = loggedInUser.profilePicture;
  const [profile, setProfile] = useState("");
  const [changeTab, setChangeTab] = useState();
  const deptData = useSelector(deptSelector);
  const userDepartment = deptData?.find(
    (dept: { departmentId: any }) =>
      dept.departmentId === loggedInUser?.departmentId
  );

  useEffect(() => {
    setProfile(profilePicture);
  }, [profilePicture]);

  return (
    <>
      <div
        className="profile-nav-bg"
        style={{
          marginTop: "10px",
          backgroundImage: "url(" + backDrop + ")",
          boxShadow: "0px -5px 10px #b3b3b3",
        }}
      ></div>
      <Card
        className="card-profile-head"
        bodyStyle={{ display: "none" }}
        title={
          <Row justify="space-between" align="middle" gutter={[24, 0]}>
            <Col span={24} md={12} className="col-info">
              <Avatar.Group>
                <Avatar
                  style={{ marginTop: "2px" }}
                  size={120}
                  shape="square"
                  src={
                    profile ? (
                      `data:image/png;base64,${profile}`
                    ) : (
                      <UserOutlined />
                    )
                  }
                />

                <div className="avatar-info">
                  <h4 className="font-semibold m-0">
                    {loggedInUser?.firstName + " " + loggedInUser?.lastName}
                  </h4>
                  <p>{userDepartment?.departmentName}</p>
                </div>
              </Avatar.Group>
            </Col>
          </Row>
        }
      ></Card>
      <Row>
        <Tabs
          tabBarStyle={{ display: "none" }}
          style={{ width: "100vw" }}
          defaultActiveKey="1"
          activeKey={changeTab}
        >
          <TabPane key="1">
            <Row gutter={[24, 0]}>
              <Col span={24} md={8} className="mb-24">
                <Card
                  bordered={false}
                  title={
                    <h6 className="font-semibold m-0">Profile Information</h6>
                  }
                  className="header-solid h-full card-profile-information"
                  bodyStyle={{ paddingTop: 0, paddingBottom: 16 }}
                >
                  {/* <p className="text-dark">
                    {" "}
                    Hi, I’m Alec Thompson, Decisions: If you can’t decide, the
                    answer is no. If two equally difficult paths, choose the one
                    more painful in the short term (pain avoidance is creating
                    an illusion of equality).{" "}
                  </p> */}
                  <Descriptions>
                    <Descriptions.Item label="Employee Number" span={3}>
                      {loggedInUser?.employeeNumber}
                    </Descriptions.Item>
                    <Descriptions.Item label="Full Name" span={3}>
                      {loggedInUser?.firstName + " " + loggedInUser?.lastName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Department Name" span={3}>
                      {loggedInUser?.department?.departmentName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mobile" span={3}>
                      {loggedInUser.mobileNo}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email" span={3}>
                      {loggedInUser.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Location" span={3}>
                      {loggedInUser.address}
                    </Descriptions.Item>
                    <Descriptions.Item label="Joining Date" span={3}>
                      {
                        (loggedInUser.joiningDate = moment(
                          loggedInUser.joiningDate
                        ).format("DD MMMM YYYY"))
                      }
                    </Descriptions.Item>
                    <Descriptions.Item label="Casual Leave Left" span={3}>
                      {loggedInUser?.casualLeaves}
                    </Descriptions.Item>
                    <Descriptions.Item label="Sick Leave Left" span={3}>
                      {loggedInUser?.sickLeaves}
                    </Descriptions.Item>
                    <Descriptions.Item label="Date of birth" span={3}>
                      {loggedInUser?.dob}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Row>
    </>
  );
};

export default Profile;
