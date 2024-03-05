import {
  IJobReportActionCreator,
  IJobReportState,
  IJobReportActionTypes,
} from "../models/IJobReportState";

const initialState: IJobReportState = {
  data: null,
  msg: null,
  loading: false,
};

const reducer = (
  state = initialState,
  { type, payload }: IJobReportActionCreator
) => {
  switch (type) {
    case IJobReportActionTypes.Job_Report_REQUEST:
      return {
        ...state,
        data: null,
        loading: true,
      };
    case IJobReportActionTypes.Job_Report_SUCCESS:
      return {
        ...state,
        data: payload.data,
        msg: payload.msg,
        loading: false,
      };
    case IJobReportActionTypes.Job_Report_FAILURE:
      return {
        ...state,
        msg: payload.msg,
        loading: false,
      };
    default:
      return state;
  }
};

export default reducer;
