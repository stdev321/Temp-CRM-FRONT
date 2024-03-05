import axios from "axios";
import { IJobReportActionTypes } from "../models/IJobReportState";
import { Dispatch } from "redux";
import authService from "./authServices";

const baseURL = process.env.REACT_APP_ENDPOINT_URL;

class WeeklyJobReportService {
  fetchWeeklyJobReports = () => (dispatch: Dispatch<any>) => {
    dispatch({
      type: IJobReportActionTypes.Job_Report_REQUEST,
    });

    axios
      .get(`${baseURL}/Report/weeklyJobReport`, {
        headers: { Authorization: `Bearer ${authService.getAccessToken()}` },
      })
      .then((response) => {
        dispatch({
          type: IJobReportActionTypes.Job_Report_SUCCESS,
          payload: { data: response.data },
        });
      })
      .catch((error) => {
        dispatch({
          type: IJobReportActionTypes.Job_Report_FAILURE,
          payload: { msg: error },
        });
      });
  };
}
const weeklyJobReportService = new WeeklyJobReportService();

export default weeklyJobReportService;
