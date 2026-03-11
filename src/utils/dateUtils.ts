import { Project, MaterialLeadTime } from '../types';

export const calculateDeadline = (project: Project, lt: MaterialLeadTime) => {
  const rules: Record<string, { dateField: keyof Project, offset: number }> = {
    '1.1 Chapones para estructura principal': { dateField: 'fabricationStartDate', offset: 1 },
    '1.2 Perfiles laminados en caliente para estructura principal': { dateField: 'fabricationStartDate', offset: 1 },
    '2. Pletinas': { dateField: 'platesAssemblyStartDate', offset: 7 },
    '3.1 Uniones principales': { dateField: 'mainStructureAssemblyStartDate', offset: 1 },
    '3.2 Uniones secundarias': { dateField: 'secondaryStructureAssemblyStartDate', offset: 1 },
    '4.1 Correas de cubierta': { dateField: 'secondaryStructureAssemblyStartDate', offset: 1 },
    '4.2 Correas de lateral': { dateField: 'secondaryStructureAssemblyStartDate', offset: 1 },
    '4.3 Tensores': { dateField: 'fabricationStartDate', offset: 1 },
    '4.4 Tillas': { dateField: 'roofCladdingAssemblyStartDate', offset: 7 },
    '4.5 Tornapuntas': { dateField: 'mainStructureAssemblyStartDate', offset: 7 },
    '5.1 Aislante': { dateField: 'roofCladdingAssemblyStartDate', offset: 1 },
    '5.2 Malla Tenax': { dateField: 'roofCladdingAssemblyStartDate', offset: 1 },
    '5.3 Cintas e insumos': { dateField: 'roofCladdingAssemblyStartDate', offset: 1 },
    '6.1 Chapas de cubierta': { dateField: 'roofCladdingAssemblyStartDate', offset: 1 },
    '6.2 Chapas de lateral': { dateField: 'sideCladdingAssemblyStartDate', offset: 1 },
    '6.3 Paneles de cubierta': { dateField: 'roofCladdingAssemblyStartDate', offset: 1 },
    '6.4 Paneles de lateral': { dateField: 'sideCladdingAssemblyStartDate', offset: 1 },
    '6.5 Insumos de cubierta': { dateField: 'roofCladdingAssemblyStartDate', offset: 1 },
    '6.6 Insumos de lateral': { dateField: 'sideCladdingAssemblyStartDate', offset: 1 },
    '7.1 Chapa prepintada': { dateField: 'roofCladdingAssemblyStartDate', offset: 10 },
    '7.2 Chapa galvanizada': { dateField: 'roofCladdingAssemblyStartDate', offset: 10 },
    '7.3 Compriband': { dateField: 'roofCladdingAssemblyStartDate', offset: 10 },
    '8.1 Chapa para canaleta': { dateField: 'roofCladdingAssemblyStartDate', offset: 7 },
    '8.2 Grampas': { dateField: 'roofCladdingAssemblyStartDate', offset: 7 },
    '8.3 Tillas': { dateField: 'secondaryStructureAssemblyStartDate', offset: 7 },
    '8.4 Boquetas y bajadas': { dateField: 'roofCladdingAssemblyStartDate', offset: 7 },
    '9.1 Losetas': { dateField: 'mainStructureAssemblyStartDate', offset: 1 },
    '10.1 Fondo epoxi': { dateField: 'fabricationStartDate', offset: 1 },
    '10.2 Poliuretano': { dateField: 'fabricationStartDate', offset: 1 },
    '10.3 Diluyente': { dateField: 'fabricationStartDate', offset: 1 },
  };

  const rule = rules[lt.subCategory || lt.category];
  if (!rule) return undefined;

  const baseDateStr = project[rule.dateField] as string;
  if (!baseDateStr) return undefined;

  const baseDate = new Date(baseDateStr);
  const totalDaysToSubtract = lt.leadTimeDays + rule.offset;
  
  const deadlineDate = new Date(baseDate);
  deadlineDate.setDate(deadlineDate.getDate() - totalDaysToSubtract);
  
  return deadlineDate.toISOString().split('T')[0];
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};
