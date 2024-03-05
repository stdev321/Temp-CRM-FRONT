import axios from "axios";
import { IEmployeeActionTypes } from "../models/IEmployeeState";
import { Dispatch } from "redux";
import authService from "./authServices";
import { IEmpResponse, IEmployee } from "../features/Employee/EmployeeModel";

const baseURL = process.env.REACT_APP_ENDPOINT_URL;
const headers = {
  Authorization: `Bearer ${authService.getAccessToken()}`,
};

class EmpService {
  fetchEmpList = () => async (dispatch: Dispatch<any>) => {
    dispatch({
      type: IEmployeeActionTypes.Employee_REQUEST,
    });
    axios
      .get(`${baseURL}/Employee/GetEmployees`, {
        headers: {
          Authorization: `Bearer ${authService.getAccessToken()}`,
        },
      })
      .then((response) => {
        dispatch({
          type: IEmployeeActionTypes.Employee_SUCCESS,
          payload: { data: response.data, msg: response.data.message },
        });
      })
      .catch((error) => {
        dispatch({
          type: IEmployeeActionTypes.Employee_FAILURE,
          payload: { msg: error },
        });
      });
  };

  fetchEmpListByDept =
    (dept?: any[] | null) => async (dispatch: Dispatch<any>) => {
      dispatch({
        type: IEmployeeActionTypes.Employee_REQUEST,
        payload: { data: null },
      });
      axios
        .post(
          `${baseURL}/Employee/GetEmployeesForDepartment`,
          {
            departmentIds: dept ?? null,
          },
          { headers }
        )
        .then((response) => {
          dispatch({
            type: IEmployeeActionTypes.Employee_SUCCESS,
            payload: { data: response.data, msg: response.data.message },
          });
        })
        .catch((error) => {
          dispatch({
            type: IEmployeeActionTypes.Employee_FAILURE,
            payload: { msg: error },
          });
        });
    };

  fetchEmpById = async (id: string) => {
    const response = await axios
      .get(`${baseURL}/Employee/getEmployee/${id}`, { headers })
      .then((response) => response)
      .catch((error) => {
        return error.response;
      });
    return response;
  };

  createEmployee = async (emp: IEmployee, file: any): Promise<IEmpResponse> => {
    if (emp.assignedTo === "") {
      emp.assignedTo = null;
    }
    if (emp.resignationDate === "") {
      emp.resignationDate = null;
    }

    const data = new FormData();
    if (file.length > 0) {
      data.append("file", file[0]);
    }

    const response = await axios
      .post(`${baseURL}/Employee/CreateEmployee`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authService.getAccessToken()}`,
        },
        params: emp,
      })
      .then((response) => response)
      .catch((error) => {
        return error.response;
      });

    return response;
  };

  updateEmployee = async (emp: IEmployee, file: any): Promise<IEmpResponse> => {
    const data = new FormData();
    if (file.length > 0) {
      data.append("file", file[0]);
    }

    const response = await axios
      .put(`${baseURL}/Employee/UpdateEmployee`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authService.getAccessToken()}`,
        },
        params: emp,
      })
      .then((response) => response)
      .catch((error) => {
        return error.response;
      });
    return response;
  };

  deleteEmployee = async (employeeId: string) => {
    const response = await axios
      .delete(
        `${process.env.REACT_APP_ENDPOINT_URL}/Employee/deleteEmployee/${employeeId}`,
        { headers }
      )
      .then((response) => response)
      .catch((error) => {
        return error.response;
      });

    return response;
  };

  updateProfilePicture = async (
    employeeId: string,
    profilePicture: string | null
  ) => {
    const response = await axios
      .put(
        `${baseURL}/Employee/updateProfilePicture`,
        {
          employeeId: employeeId ?? null,
          profilePicture: profilePicture ?? null,
        },
        { headers }
      )
      .then((response) => response)
      .catch((error) => {
        return error.response;
      });

    return response;
  };

  impersonateEmployee = async (
    ImpersonatedUserId: string,
    ImpersonatorId: string
  ) => {
    const response = await axios
      .post(
        `${baseURL}/Employee/ImpersonateEmployee/`,
        {
          ImpersonatorId: ImpersonatorId,
          ImpersonatedUserId: ImpersonatedUserId,
        },
        {
          headers: {
            Authorization: `Bearer ${authService.getAccessToken()}`,
          },
        }
      )
      .then((response) => response)
      .catch((error) => {
        return error.response;
      });
    return response;
  };

  stopImpersonation = async (
    ImpersonatedUserId: string,
    ImpersonatorId: string
  ) => {
    const response = await axios
      .post(
        `${baseURL}/Employee/StopImpersonation/`,
        {
          ImpersonatorId: ImpersonatorId,
          ImpersonatedUserId: ImpersonatedUserId,
        },
        { headers }
      )
      .then((response) => response)
      .catch((error) => {
        return error.response;
      });
    return response;
  };

  ImportEmployee = async (file: any) => {
    const headers = {
      Authorization: `Bearer ${authService.getAccessToken()}`,
    };

    const data = new FormData();
    data.append("file", file[0]);

    const response = await axios
      .post(`${baseURL}/Employee/UploadExcel`, data, { headers })
      .then((response) => response)
      .catch((error) => {
        return error.response;
      });

    return response;
  };
}

const empService = new EmpService();

export default empService;
// function dispatch(arg0: { type: IEmpActionType; payload: { data: null } }) {
//   throw new Error('Function not implemented.');
// }
