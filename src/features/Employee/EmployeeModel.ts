export type IEmployee = {
  firstName: string;
  lastName: string;
  address: string;
  gender?: string;
  email: string;
  mobileNo: string;
  role?: string;
  joiningDate?: string;
  resignationDate?: string | null;
  departmentId: string;
  assignedTo?: string | null;
  isActive: boolean;
  employeeNumber: string;
  employeeId: string | null;
  department?: string;
  employeeTargetedHours: string | null;
  profilePicture?: string;
  casualLeaves?: string;
  sickLeaves?: string;
  isInImpersonation?: string;
};
export type IEmpResponse = {
  // message: string;
  status: number;
  data: any;
};

export const GenderEnum = {
  Male: { name: "Male", value: 1 },
  Female: { name: "Female", value: 2 },
} as const;

export const RoleEnum = {
  Admin: { name: "Admin", value: 1 },
  BDM: { name: "BDM", value: 2 },
  BD: { name: "BD", value: 3 },
  TeamLead: { name: "TeamLead", value: 4 },
  Employee: { name: "Employee", value: 5 },
  HR: { name: "HR", value: 6 },
} as const;
