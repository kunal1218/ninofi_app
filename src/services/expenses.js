import api from './api';

export const expenseAPI = {
  // Expenses
  logExpense: async (expenseData) => api.post('/expenses', expenseData),
  getProjectExpenses: async (projectId) => api.get(`/expenses/project/${projectId}`),
  getContractorExpenses: async (contractorId) => api.get(`/expenses/contractor/${contractorId}`),
  deleteExpense: async (expenseId) => api.delete(`/expenses/${expenseId}`),
  getProjectExpenseSummary: async (projectId) => api.get(`/expenses/project/${projectId}/summary`),

  // Work Hours
  logWorkHours: async (hoursData) => api.post('/work-hours', hoursData),
  getProjectWorkHours: async (projectId) => api.get(`/work-hours/project/${projectId}`),
  getContractorWorkHours: async (contractorId) => api.get(`/work-hours/contractor/${contractorId}`),
  deleteWorkHours: async (entryId) => api.delete(`/work-hours/${entryId}`),
  getProjectWorkHoursSummary: async (projectId) => api.get(`/work-hours/project/${projectId}/summary`),
};
