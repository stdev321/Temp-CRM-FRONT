import axios from 'axios';

import { Dispatch } from 'redux';
import authService from './authServices';
import { IDashboardLeadsConnectActionTypes } from '../models/IDashboardState';

const baseURL = process.env.REACT_APP_ENDPOINT_URL;
const headers = {
    Authorization: `Bearer ${authService.getAccessToken()}`,
};

class DashBoardService {
    fetchDashBoardList = () => (dispatch: Dispatch<any>) => {
        dispatch({
            type: IDashboardLeadsConnectActionTypes.DashboardLeads_Connect_REQUEST,
        });

        axios
            .get(`${baseURL}/Dashboard/getDashboardData`, { headers })
            .then((response) => {
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
    fetchChartData = async (data: any) => { 
        const response = await axios.post(`${baseURL}/Dashboard/getProjectAndConnectsDetail`, data, { headers }).then((response) => {
            return response.data
        }).catch((error) => { 
            return error.response;
        })
        return response
    }
    fetchListData = async (data: any) => { 
        const response = await axios.post(`${baseURL}/Dashboard/capacityReport`, data, { headers }).then((response) => {
            return response.data
        }).catch((error) => { 
            return error.response;
        })
        return response
    }
    fetchNewEmpData = async () => { 
        const response = await axios.get(`${baseURL}/Dashboard/employeeDetails`, { headers }).then((response) => {
            return response.data
        }).catch((error) => { 
            return error.response;
        })
        return response
    }
    fetchContractRecordsForTL = async () => { 
        const response = await axios.get(`${baseURL}/Dashboard/getContractRecordsForTL `, { headers }).then((response) => {
            return response.data
        }).catch((error) => { 
            return error.response;
        })
        return response
    }

    fetchHoursAndCapacityForTL = async (startDate?: string | null,
        endDate?: string | null,
        dept?: string | null,
        emp?: string | null) => {
        const response = await axios
            .post(
                `${baseURL}/Dashboard/getHoursAndCapacityForTL`,
                {
                    startDate: startDate ?? null,
                    endDate: endDate ?? null,
                    departmentId: dept ?? null,
                    employeeId: emp ?? null,
                },
                { headers }).then((response) => {
    
                    return response.data
                }).catch((error) => {
                    return error.response;
                })
        return response
    }

    fetchProjectHoursDetails = async () => { 
        const response = await axios.get(`${baseURL}/Dashboard/getProjectHoursDetails `, { headers }).then((response) => {
            return response.data
        }).catch((error) => { 
            return error.response;
        })
        return response
    }

    fetchProjectHealthStatusForDashboard = async ( ) => {
        const response = await axios
            .get(
                `${baseURL}/Dashboard/getProjectHealthStatusForDashboard`,
                 
                { headers }).then((response) => {
    
                    return response.data
                }).catch((error) => {
                    return error.response;
                })
         console.log("response---getProjectHealthStatusForDashboard", response);
        return response
    }
}

const dashService = new DashBoardService();

export default dashService;
// function dispatch(arg0: { type: IEmpActionType; payload: { data: null } }) {
//   throw new Error('Function not implemented.');
// }
