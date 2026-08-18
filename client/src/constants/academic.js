export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7].map((n) => `Semester ${n}`);

export const DEPARTMENTS = [
  'Computer Science',
  'Information Science',
  'Electronics and Communication',
  'Electrical and Electronics',
  'Mechanical',
  'Civil',
  'Mathematics',
  'Physics'
];

const year = 2026;

export const ACADEMIC_YEARS = [
  `${year - 1}-${year}`,
  `${year}-${year + 1}`
];

export const departmentChoices = (loginDepartment) => {
  const extra = loginDepartment && !DEPARTMENTS.includes(loginDepartment)
    ? [loginDepartment]
    : [];
  return [...extra, ...DEPARTMENTS];
};
