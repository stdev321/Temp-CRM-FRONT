import axios, { AxiosRequestConfig } from 'axios';
import { IExpenseCategoryActionTypes } from '../models/IExpenseCategoryState';
import { Dispatch } from 'react';
//import { IExpenseCategoryModel, IExpenseCategoryResponse } from 'features/ExpenseCategory/ExpenseCategoryModel';
//import saveAs from 'file-saver';
import authService from './authServices';

const baseURL = process.env.REACT_APP_ENDPOINT_URL;
class ExpenseCategoryService {
    fetchExpenseCategoryList = () => (dispatch: Dispatch<any>) => {
        dispatch({
            type: IExpenseCategoryActionTypes.ExpenseCategory_REQUEST,
        });

        axios
            .get(`${baseURL}/ExpenseCategory/getAllExpenseCategories`, {
                headers: { Authorization: `Bearer ${authService.getAccessToken()}` },
            })
            .then((response) => {
                dispatch({
                    type: IExpenseCategoryActionTypes.ExpenseCategory_SUCCESS,
                    payload: { data: response.data },
                });
            })
            .catch((error) => {
                dispatch({
                    type: IExpenseCategoryActionTypes.ExpenseCategory_FAILURE,
                    payload: { msg: error },
                });
            });
    };

    fetchExpenseCategoryById = async (expenseCategoryID: string) => {
        const response = await axios
            .get(`${baseURL}/ExpenseCategory/${expenseCategoryID}`, {
                headers: { Authorization: `Bearer ${authService.getAccessToken()}` },
            })
            .then((response) => response)
            .catch((error) => {
                return error.response;
            });
        return response;
    };

    addNewExpenseCategory = async (value: any): Promise<any> => {
        const headers = {
            Authorization: `Bearer ${authService.getAccessToken()}`,
        };
        const response = await axios
            .post(`${baseURL}/ExpenseCategory/createExpenseCategory`, { categoryName: value.categoryName, isActive: true }, { headers })
            .then((response) => response)
            .catch((error) => {
                return error.response;
            });

        return response;
    };

    deleteExpenseCategory = async (expenseCategoryId: string) => {
        const headers = {
            Authorization: `Bearer ${authService.getAccessToken()}`,
        };
        const response = await axios
            .delete(`${baseURL}/ExpenseCategory/deleteExpenseCategory/${expenseCategoryId}`, { headers })
            .then((response) => response)
            .catch((error) => {
                return error.response;
            });
        return response;
    };

    updateExpenseCategory = async (value: any) => {
        const data = {
            categoryName: value.categoryName,
            // status: value.status ? 1 : 0,
            expenseCategoryId: value.expenseCategoryId,
            isActive: true,
        };
        const headers = {
            Authorization: `Bearer ${authService.getAccessToken()}`,
        };
        const response = await axios
            .post(`${baseURL}/ExpenseCategory/createExpenseCategory`, data, { headers })
            .then((response) => response)
            .catch((error) => {
                return error.response;
            });

        return response;
    };

    // downloadExpenseCategory = async () => {
    //     const headers = {
    //         Authorization: `Bearer ${authService.getAccessToken()}`,
    //     };
    //     const instance = axios.create({ baseURL });
    //     const options: AxiosRequestConfig = {
    //         url: '/HRExpense/hrExpenseReport',
    //         method: 'post',
    //         responseType: 'blob',
    //         headers: headers,
    //     };
    //     return instance.request<any>(options).then((response) => {
    //         const url = window.URL.createObjectURL(new Blob([response.data]));
    //         saveAs(url, 'HR Expense.xlsx');
    //     });
    // };
}
const expenseCategoryService = new ExpenseCategoryService();

export default expenseCategoryService;
