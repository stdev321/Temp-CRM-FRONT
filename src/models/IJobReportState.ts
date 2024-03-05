export enum IJobReportActionTypes {
  Job_Report_REQUEST = "Job_Report_REQUEST",
  Job_Report_SUCCESS = "Job_Report_SUCCESS",
  Job_Report_FAILURE = "Job_Report_FAILURE",
}

export type IJobReportState = {
  data: any | null;
  msg?: string | null;
  loading: boolean;
};

export type IJobReportActionCreator = {
  type: string;
  payload: IJobReportState;
  loading: boolean;
};
