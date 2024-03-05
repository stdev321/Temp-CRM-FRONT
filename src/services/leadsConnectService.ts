import axios from "axios";
import {
  IDashboardLeadsConnectActionTypes,
  ILeadsConnectActionTypes,
} from "../models/ILeadsConnectState";
import { Dispatch } from "redux";
import authService from "./authServices";
import { saveAs } from "file-saver";

const baseURL = process.env.REACT_APP_ENDPOINT_URL;
const headers = {
  Authorization: `Bearer ${authService.getAccessToken()}`,
};

class leadsConnectService {
  fetchJobsList =
    (
      startDate?: string | null,
      endDate?: string | null,
      dept?: string | null,
      emp?: string | null
    ) =>
    (dispatch: Dispatch<any>) => {
      dispatch({
        type: ILeadsConnectActionTypes.Leads_Connect_REQUEST,
      });

      axios
        .post(
          `${baseURL}/Job/getAllJobs`,
          {
            startDate: startDate ?? null,
            endDate: endDate ?? null,
            departmentId: dept ?? null,
            employeeId: emp ?? null,
          },
          {
            headers: {
              Authorization: `Bearer ${authService.getAccessToken()}`,
            },
          }
        )
        .then((response) => {
          dispatch({
            type: ILeadsConnectActionTypes.Leads_Connect_SUCCESS,
            payload: { data: response.data },
          });
        })
        .catch((error) => {
          dispatch({
            type: ILeadsConnectActionTypes.Leads_Connect_FAILURE,
            payload: { msg: error },
          });
        });
    };

  //need to implement
  fetchJobById = async (id: string) => {
    const response = await axios
      .get(`${baseURL}/Job/getJobbyId/${id}`, { headers })
      .then((response) => response)
      .catch((error) => {
        return error.response;
      });

    return response;
  };

  fetchJobByDeptId = (id: string) => (dispatch: Dispatch<any>) => {
    axios
      .get(`${baseURL}/Job/getJobsByDepartmentId/${id}`, { headers })
      .then((response) => {
        dispatch({
          type: ILeadsConnectActionTypes.Leads_Connect_SUCCESS,
          payload: { data: response.data, msg: response.data.message },
        });
      })
      .catch((error) => {
        dispatch({
          type: ILeadsConnectActionTypes.Leads_Connect_FAILURE,
          payload: { msg: error },
        });
      });
  };

  createJob = async (jobData: any) => {
    const response = await axios
      .post(`${baseURL}/Job/createJob`, jobData, { headers })
      .then((response) => response)
      .catch((error) => {
        return error.response;
      });

    return response;
  };

  updatejobData = async (formData: any) => {
    const response = await axios
      .put(`${baseURL}/Job/updateJob`, formData, { headers })
      .then((response) => response)
      .catch((error) => {
        return error.response;
      });

    return response;
  };

  deleteJob = async (value: string) => {
    const response = await axios
      .delete(`${baseURL}/Job/${value}`, { headers })
      .then((response) => response)
      .catch((error) => {
        return error.response;
      });

    return response;
  };

  fetchjobscalculationslist = () => (dispatch: Dispatch<any>) => {
    dispatch({
      type: IDashboardLeadsConnectActionTypes.DashboardLeads_Connect_REQUEST,
    });

    axios
      .get(`${baseURL}/Job/getJobCalculations`, {
        headers: {
          Authorization: `Bearer ${authService.getAccessToken()}`,
        },
      })
      .then((response) => {
        console.log("response---", response);
        dispatch({
          type: IDashboardLeadsConnectActionTypes.DashboardLeads_Connect_SUCCESS,
          payload: { data: response.data, msg: response.data.message },
        });
      })
      .catch((error) => {
        dispatch({
          type: IDashboardLeadsConnectActionTypes.DashboardLeads_Connect_FAILURE,
          payload: { msg: error },
        });
      });
  };

  importJobExcel = async (file: any) => {
    const headers = {
      Authorization: `Bearer ${authService.getAccessToken()}`,
    };

    const data = new FormData();
    data.append("file", file[0]);

    const response = await axios
      .post(`${baseURL}/Job/uploadExcel`, data, { headers })
      .then((response) => response)
      .catch((error) => {
        return error.response;
      });

    return response;
  };

  downloadExcel = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/Job/downloadJobListSampleExcel`,
        {
          headers: {
            Authorization: `Bearer ${authService.getAccessToken()}`,
          },
          responseType: "blob",
        }
      );

      // Use file-saver to save the file locally
      saveAs(response.data, "JobRecords.xlsx");
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    }
  };
}

const jobService = new leadsConnectService();

export default jobService;
