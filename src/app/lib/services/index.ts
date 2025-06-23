// src/app/services/index.ts
// This file exports all services for easier imports elsewhere in the app

import api from './api';
import { authService } from './api';
import { clientService } from './clientService';
import { employeeService } from './employeeService';
import { projectService } from './projectService';
import { requirementService } from './requirementService';
import { bugService } from './bugService';
import { paymentService } from './paymentService';
import { termsService } from './termsService';

export {
  api,
  authService,
  clientService,
  employeeService,
  projectService,
  requirementService,
  bugService,
  paymentService,
  termsService
};
