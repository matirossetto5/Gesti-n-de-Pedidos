export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'engineer' | 'viewer';
}

export interface OrderItemStatus {
  isApplied: boolean;
  isOrdered: boolean;
  orderDate?: string;
  purchaseDeadline?: string;
  manufacturingDeadline?: string;
  orderDeadline?: string;
}

export interface DateChangeLog {
  date: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  reason: string;
  changedBy: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  ownerId: string;
  responsibleName: string;
  createdAt: string;
  modelingStartDate?: string;
  fabricationStartDate?: string;
  mainStructureAssemblyStartDate?: string;
  secondaryStructureAssemblyStartDate?: string;
  roofCladdingAssemblyStartDate?: string;
  sideCladdingAssemblyStartDate?: string;
  platesAssemblyStartDate?: string;
  orderItems?: { [leadTimeId: string]: OrderItemStatus };
  dateChangeLogs?: DateChangeLog[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  dueDate: string;
}

export interface MaterialLeadTime {
  id: string;
  category: string;
  subCategory?: string;
  leadTimeDays: number;
  purchaseTimeDays: number;
  manufacturingTimeDays: number;
  ownerId: string;
}
