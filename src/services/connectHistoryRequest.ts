import axios, { AxiosRequestConfig } from 'axios';
import { IConnectHistoryActionType } from '../models/IConnectHistoryState';
import { Dispatch } from 'redux';
//import { saveAs } from 'file-saver';
import authService from './authServices';

const baseURL = process.env.REACT_APP_ENDPOINT_URL;
const headers = {
    Authorization: `Bearer ${authService.getAccessToken()}`,
};

class ConnectHistoryReportService {
    fetchConnectHistoryReports =
        (week?: string | null, dept?: string | null, endDate?: string | null, startDate?: string | null) =>
            async (dispatch: Dispatch<any>) => {
                dispatch({
                    type: IConnectHistoryActionType.CONNECT_HISTORY_REQUEST,
                    payload: { data: null },
                });
                axios
                    .post(
                        `${baseURL}/report/connectReport`,
                        {
                            week: week ?? null,
                            departmentId: dept ?? null,
                            startDate: startDate ?? null,
                            endDate: endDate ?? null,
                        },
                        { headers },
                    )
                    .then((response) => {
                        dispatch({
                            type: IConnectHistoryActionType.CONNECT_HISTORY_REQUEST_SUCCESS,
                            payload: { data: response.data, msg: response.data.message },
                        });
                    })
                    .catch((error) => {
                        dispatch({
                            type: IConnectHistoryActionType.CONNECT_HISTORY_REQUEST_FAILURE,
                            payload: { msg: error },
                        });
                    });
            };

    //   exportConnectHistoryReport = async () => {
    //     const instance = axios.create({ baseURL });
    //     const options: AxiosRequestConfig = {
    //       url: '/report/exportConnectHistoryReport',
    //       method: 'post',
    //       responseType: 'blob',
    //       headers: headers,
    //     };
    //     return instance.request<any>(options).then((response) => {
    //       const url = window.URL.createObjectURL(new Blob([response.data]));
    //       saveAs(url, 'Connect History Report.xlsx');
    //     });
    //   };
}
const connectHistoryReportService = new ConnectHistoryReportService();

export default connectHistoryReportService;