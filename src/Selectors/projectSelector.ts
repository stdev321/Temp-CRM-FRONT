import { createSelector } from "reselect";

// types
import IRootState from "../models/IRootState";

export const isLoadingSelector = createSelector(
  (state: IRootState) => state.project,
  (project) => project.loading
);

export const projectSelector = createSelector(
  (state: IRootState) => state.project,
  (project) => project?.data
);

export const projectError = createSelector(
  (state: IRootState) => state.project,
  (project) => project.msg
);

// export const isLoadingMemberSelector = createSelector(
//     (state: IRootState) => state.projectMember,
//     (projectMember) => projectMember.loading
// );

// export const projectMemberSelector = createSelector(
//     (state: IRootState) => state.projectMember,
//     (projectMember) => projectMember.msg
// );

// export const projectMemberError = createSelector(
//     (state: IRootState) => state.projectMember,
//     (projectMember) => projectMember.msg
// );
