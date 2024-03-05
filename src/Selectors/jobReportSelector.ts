import { createSelector } from "reselect";

// types
import IRootState from "../models/IRootState";

export const isLoadingSelector = createSelector(
  (state: IRootState) => state.jobReports,
  (jobReports) => jobReports.loading
);

export const jobReportsSelector = createSelector(
  (state: IRootState) => state.jobReports,
  (jobReports) => jobReports.data
);

export const jobReportsError = createSelector(
  (state: IRootState) => state.jobReports,
  (jobReports) => jobReports.msg
);
