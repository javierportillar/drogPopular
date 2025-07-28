import React from 'react';
import { FileText, User, Calendar, DollarSign, AlertCircle, BarChart3, Download, TrendingUp, Users } from 'lucide-react';
import { PayrollCalculation } from '../types';
import { formatMonthYear } from '../utils/dateUtils';

interface PayrollPreviewProps {
  monthlyPayrolls: Record<string, PayrollCalculation[]>;
}

interface EmployeeAccumulated {
  employee: PayrollCalculation['employee'];
  totalWorkedDays: number;
  totalBaseSalary: number;
  totalGrossSalary: number;
  totalTransportAllowance: number;
  totalBonuses: number;
  totalEarned: number;
  totalHealthDeduction: number;
  totalPensionDeduction: number;
  totalSolidarityDeduction: number;
  totalAbsenceDeduction: number;
  totalPlanCorporativo: number;
  totalRecordar: number;
  totalInventariosCruces: number;
  totalMultas: number;
  totalFondoEmpleados: number;
  totalCarteraEmpleados: number;
  totalAdvanceDeduction: number;
  totalDeductions: number;
  totalNetSalary: number;
  monthlyDetails: {
    month: string;
    workedDays: number;
    baseSalary: number;
    grossSalary: number;
    transportAllowance: number;
    bonuses: number;
    totalEarned: number;
    healthDeduction: number;
    pensionDeduction: number;
    solidarityDeduction: number;
    absenceDeduction: number;
    planCorporativo: number;
    recordar: number;
    inventariosCruces: number;
    multas: number;
    fondoEmpleados: number;
    carteraEmpleados: number;
    advanceDeduction: number;
    totalDeductions: number;
    netSalary: number;
  }[];
}

interface GeneralAccumulated {
  totalWorkedDays: number;
  totalBaseSalary: number;
  totalGrossSalary: number;
  totalTransportAllowance: number;
  totalBonuses: number;
  totalEarned: number;
  totalHealthDeduction: number;
  totalPensionDeduction: number;
  totalSolidarityDeduction: number;
  totalAbsenceDeduction: number;
  totalPlanCorporativo: number;
  totalRecordar: number;
  totalInventariosCruces: number;
  totalMultas: number;
  totalFondoEmpleados: number;
  totalCarteraEmpleados: number;
  totalAdvanceDeduction: number;
  totalDeductions: number;
  totalNetSalary: number;
  monthlyDetails: {
    month: string;
    employeeCount: number;
    totalWorkedDays: number;
    totalBaseSalary: number;
    totalGrossSalary: number;
    totalTransportAllowance: number;
    totalBonuses: number;
    totalEarned: number;
    totalHealthDeduction: number;
    totalPensionDeduction: number;
    totalSolidarityDeduction: number;
    totalAbsenceDeduction: number;
    totalPlanCorporativo: number;
    totalRecordar: number;
    totalInventariosCruces: number;
    totalMultas: number;
    totalFondoEmpleados: number;
    totalCarteraEmpleados: number;
    totalAdvanceDeduction: number;
    totalDeductions: number;
    totalNetSalary: number;
  }[];
}

export const PayrollPreview: React.FC<PayrollPreviewProps> = ({ monthlyPayrolls }) => {
  const [showReports, setShowReports] = React.useState(false);
  const [showPayslips, setShowPayslips] = React.useState(false);
  const [startMonth, setStartMonth] = React.useState(new Date().toISOString().slice(0, 7));
  const [endMonth, setEndMonth] = React.useState(new Date().toISOString().slice(0, 7));
  const [reportType, setReportType] = React.useState<'individual' | 'general'>('individual');
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string>('');
  
  const availableMonths = React.useMemo(() => Object.keys(monthlyPayrolls).sort(), [monthlyPayrolls]);
  
  // Estado independiente para el mes seleccionado en previsualización
  const [selectedMonth, setSelectedMonth] = React.useState(() => {
    return availableMonths.length > 0 ? availableMonths[availableMonths.length - 1] : new Date().toISOString().slice(0, 7);
  });
  
  const [employeeReportData, setEmployeeReportData] = React.useState<EmployeeAccumulated | null>(null);
  const [generalReportData, setGeneralReportData] = React.useState<GeneralAccumulated | null>(null);

  // Get all unique employees across all months
  const allEmployees = React.useMemo(() => {
    const employeeMap = new Map();
    Object.values(monthlyPayrolls).forEach(calculations => {
      calculations.forEach(calc => {
        if (!employeeMap.has(calc.employee.id)) {
          employeeMap.set(calc.employee.id, calc.employee);
        }
      });
    });
    return Array.from(employeeMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [monthlyPayrolls]);

  React.useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths, selectedMonth]);

  React.useEffect(() => {
    if (allEmployees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(allEmployees[0].id);
    }
  }, [allEmployees, selectedEmployeeId]);

  const generateEmployeeReport = () => {
    if (!selectedEmployeeId) return;

    const startDate = new Date(startMonth + '-01');
    const endDate = new Date(endMonth + '-01');

    const employeeData: EmployeeAccumulated = {
      employee: allEmployees.find(emp => emp.id === selectedEmployeeId)!,
      totalWorkedDays: 0,
      totalBaseSalary: 0,
      totalGrossSalary: 0,
      totalTransportAllowance: 0,
      totalBonuses: 0,
      totalEarned: 0,
      totalHealthDeduction: 0,
      totalPensionDeduction: 0,
      totalSolidarityDeduction: 0,
      totalAbsenceDeduction: 0,
      totalPlanCorporativo: 0,
      totalRecordar: 0,
      totalInventariosCruces: 0,
      totalMultas: 0,
      totalFondoEmpleados: 0,
      totalCarteraEmpleados: 0,
      totalAdvanceDeduction: 0,
      totalDeductions: 0,
      totalNetSalary: 0,
      monthlyDetails: []
    };

    Object.entries(monthlyPayrolls).forEach(([month, calculations]) => {
      const monthDate = new Date(month + '-01');
      if (monthDate >= startDate && monthDate <= endDate) {
        const employeeCalc = calculations.find(calc => calc.employee.id === selectedEmployeeId);
        if (employeeCalc) {
          // Add to totals
          employeeData.totalWorkedDays += employeeCalc.workedDays;
          employeeData.totalBaseSalary += employeeCalc.baseSalary;
          employeeData.totalGrossSalary += employeeCalc.grossSalary;
          employeeData.totalTransportAllowance += employeeCalc.transportAllowance;
          employeeData.totalBonuses += (employeeCalc.bonusCalculations?.total || employeeCalc.bonuses || 0);
          employeeData.totalEarned += employeeCalc.totalEarned;
          employeeData.totalHealthDeduction += employeeCalc.deductions.health;
          employeeData.totalPensionDeduction += employeeCalc.deductions.pension;
          employeeData.totalSolidarityDeduction += employeeCalc.deductions.solidarity;
          employeeData.totalAbsenceDeduction += employeeCalc.deductions.absence;
          employeeData.totalPlanCorporativo += employeeCalc.deductions.planCorporativo;
          employeeData.totalRecordar += employeeCalc.deductions.recordar;
          employeeData.totalInventariosCruces += employeeCalc.deductions.inventariosCruces;
          employeeData.totalMultas += employeeCalc.deductions.multas;
          employeeData.totalFondoEmpleados += employeeCalc.deductions.fondoEmpleados;
          employeeData.totalCarteraEmpleados += employeeCalc.deductions.carteraEmpleados;
          employeeData.totalAdvanceDeduction += employeeCalc.deductions.advance;
          employeeData.totalDeductions += employeeCalc.deductions.total;
          employeeData.totalNetSalary += employeeCalc.netSalary;

          // Add monthly detail
          employeeData.monthlyDetails.push({
            month,
            workedDays: employeeCalc.workedDays,
            baseSalary: employeeCalc.baseSalary,
            grossSalary: employeeCalc.grossSalary,
            transportAllowance: employeeCalc.transportAllowance,
            bonuses: (employeeCalc.bonusCalculations?.total || employeeCalc.bonuses || 0),
            totalEarned: employeeCalc.totalEarned,
            healthDeduction: employeeCalc.deductions.health,
            pensionDeduction: employeeCalc.deductions.pension,
            solidarityDeduction: employeeCalc.deductions.solidarity,
            absenceDeduction: employeeCalc.deductions.absence,
            planCorporativo: employeeCalc.deductions.planCorporativo,
            recordar: employeeCalc.deductions.recordar,
            inventariosCruces: employeeCalc.deductions.inventariosCruces,
            multas: employeeCalc.deductions.multas,
            fondoEmpleados: employeeCalc.deductions.fondoEmpleados,
            carteraEmpleados: employeeCalc.deductions.carteraEmpleados,
            advanceDeduction: employeeCalc.deductions.advance,
            totalDeductions: employeeCalc.deductions.total,
            netSalary: employeeCalc.netSalary
          });
        }
      }
    });

    employeeData.monthlyDetails.sort((a, b) => a.month.localeCompare(b.month));
    setEmployeeReportData(employeeData);
  };

  const generateGeneralReport = () => {
    const startDate = new Date(startMonth + '-01');
    const endDate = new Date(endMonth + '-01');

    const generalData: GeneralAccumulated = {
      totalWorkedDays: 0,
      totalBaseSalary: 0,
      totalGrossSalary: 0,
      totalTransportAllowance: 0,
      totalBonuses: 0,
      totalEarned: 0,
      totalHealthDeduction: 0,
      totalPensionDeduction: 0,
      totalSolidarityDeduction: 0,
      totalAbsenceDeduction: 0,
      totalPlanCorporativo: 0,
      totalRecordar: 0,
      totalInventariosCruces: 0,
      totalMultas: 0,
      totalFondoEmpleados: 0,
      totalCarteraEmpleados: 0,
      totalAdvanceDeduction: 0,
      totalDeductions: 0,
      totalNetSalary: 0,
      monthlyDetails: []
    };

    Object.entries(monthlyPayrolls).forEach(([month, calculations]) => {
      const monthDate = new Date(month + '-01');
      if (monthDate >= startDate && monthDate <= endDate) {
        let monthWorkedDays = 0;
        let monthBaseSalary = 0;
        let monthGrossSalary = 0;
        let monthTransportAllowance = 0;
        let monthBonuses = 0;
        let monthEarned = 0;
        let monthHealthDeduction = 0;
        let monthPensionDeduction = 0;
        let monthSolidarityDeduction = 0;
        let monthAbsenceDeduction = 0;
        let monthPlanCorporativo = 0;
        let monthRecordar = 0;
        let monthInventariosCruces = 0;
        let monthMultas = 0;
        let monthFondoEmpleados = 0;
        let monthCarteraEmpleados = 0;
        let monthAdvanceDeduction = 0;
        let monthDeductions = 0;
        let monthNetSalary = 0;

        calculations.forEach(calc => {
          monthWorkedDays += calc.workedDays;
          monthBaseSalary += calc.baseSalary;
          monthGrossSalary += calc.grossSalary;
          monthTransportAllowance += calc.transportAllowance;
          monthBonuses += (calc.bonusCalculations?.total || calc.bonuses || 0);
          monthEarned += calc.totalEarned;
          monthHealthDeduction += calc.deductions.health;
          monthPensionDeduction += calc.deductions.pension;
          monthSolidarityDeduction += calc.deductions.solidarity;
          monthAbsenceDeduction += calc.deductions.absence;
          monthPlanCorporativo += calc.deductions.planCorporativo;
          monthRecordar += calc.deductions.recordar;
          monthInventariosCruces += calc.deductions.inventariosCruces;
          monthMultas += calc.deductions.multas;
          monthFondoEmpleados += calc.deductions.fondoEmpleados;
          monthCarteraEmpleados += calc.deductions.carteraEmpleados;
          monthAdvanceDeduction += calc.deductions.advance;
          monthDeductions += calc.deductions.total;
          monthNetSalary += calc.netSalary;
        });

        // Add to totals
        generalData.totalWorkedDays += monthWorkedDays;
        generalData.totalBaseSalary += monthBaseSalary;
        generalData.totalGrossSalary += monthGrossSalary;
        generalData.totalTransportAllowance += monthTransportAllowance;
        generalData.totalBonuses += monthBonuses;
        generalData.totalEarned += monthEarned;
        generalData.totalHealthDeduction += monthHealthDeduction;
        generalData.totalPensionDeduction += monthPensionDeduction;
        generalData.totalSolidarityDeduction += monthSolidarityDeduction;
        generalData.totalAbsenceDeduction += monthAbsenceDeduction;
        generalData.totalPlanCorporativo += monthPlanCorporativo;
        generalData.totalRecordar += monthRecordar;
        generalData.totalInventariosCruces += monthInventariosCruces;
        generalData.totalMultas += monthMultas;
        generalData.totalFondoEmpleados += monthFondoEmpleados;
        generalData.totalCarteraEmpleados += monthCarteraEmpleados;
        generalData.totalAdvanceDeduction += monthAdvanceDeduction;
        generalData.totalDeductions += monthDeductions;
        generalData.totalNetSalary += monthNetSalary;

        // Add monthly detail
        generalData.monthlyDetails.push({
          month,
          employeeCount: calculations.length,
          totalWorkedDays: monthWorkedDays,
          totalBaseSalary: monthBaseSalary,
          totalGrossSalary: monthGrossSalary,
          totalTransportAllowance: monthTransportAllowance,
          totalBonuses: monthBonuses,
          totalEarned: monthEarned,
          totalHealthDeduction: monthHealthDeduction,
          totalPensionDeduction: monthPensionDeduction,
          totalSolidarityDeduction: monthSolidarityDeduction,
          totalAbsenceDeduction: monthAbsenceDeduction,
          totalPlanCorporativo: monthPlanCorporativo,
          totalRecordar: monthRecordar,
          totalInventariosCruces: monthInventariosCruces,
          totalMultas: monthMultas,
          totalFondoEmpleados: monthFondoEmpleados,
          totalCarteraEmpleados: monthCarteraEmpleados,
          totalAdvanceDeduction: monthAdvanceDeduction,
          totalDeductions: monthDeductions,
          totalNetSalary: monthNetSalary
        });
      }
    });

    generalData.monthlyDetails.sort((a, b) => a.month.localeCompare(b.month));
    setGeneralReportData(generalData);
  };

  const exportEmployeeReport = () => {
    if (!employeeReportData) return;

    const startFormatted = formatMonthYear(startMonth);
    const endFormatted = formatMonthYear(endMonth);
    
    let txtContent = `REPORTE INDIVIDUAL DE EMPLEADO\n`;
    txtContent += `Empleado: ${employeeReportData.employee.name}\n`;
    txtContent += `Cédula: ${employeeReportData.employee.cedula}\n`;
    txtContent += `Período: ${startFormatted} - ${endFormatted}\n`;
    txtContent += `Fecha de generación: ${new Date().toLocaleDateString()}\n`;
    txtContent += `${'='.repeat(80)}\n\n`;
    
    txtContent += `RESUMEN ACUMULADO DEL PERÍODO\n`;
    txtContent += `${'='.repeat(50)}\n`;
    txtContent += `Total Días Trabajados: ${employeeReportData.totalWorkedDays}\n`;
    txtContent += `Base Salarial Estándar: $${employeeReportData.totalBaseSalary.toLocaleString()}\n`;
    txtContent += `Salario Mes Total: $${employeeReportData.totalGrossSalary.toLocaleString()}\n`;
    txtContent += `Auxilio Transporte Total: $${employeeReportData.totalTransportAllowance.toLocaleString()}\n`;
    txtContent += `Bonificaciones Total: $${employeeReportData.totalBonuses.toLocaleString()}\n`;
    txtContent += `TOTAL DEVENGADO: $${employeeReportData.totalEarned.toLocaleString()}\n\n`;
    
    txtContent += `DEDUCCIONES ACUMULADAS:\n`;
    txtContent += `Salud: $${employeeReportData.totalHealthDeduction.toLocaleString()}\n`;
    txtContent += `Pensión: $${employeeReportData.totalPensionDeduction.toLocaleString()}\n`;
    if (employeeReportData.totalSolidarityDeduction > 0) {
      txtContent += `Solidaridad: $${employeeReportData.totalSolidarityDeduction.toLocaleString()}\n`;
    }
    if (employeeReportData.totalAbsenceDeduction > 0) {
      txtContent += `Ausencias: $${employeeReportData.totalAbsenceDeduction.toLocaleString()}\n`;
    }
    if (employeeReportData.totalPlanCorporativo > 0) {
      txtContent += `Plan Corporativo: $${employeeReportData.totalPlanCorporativo.toLocaleString()}\n`;
    }
    if (employeeReportData.totalRecordar > 0) {
      txtContent += `Recordar: $${employeeReportData.totalRecordar.toLocaleString()}\n`;
    }
    if (employeeReportData.totalInventariosCruces > 0) {
      txtContent += `Inventarios y Cruces: $${employeeReportData.totalInventariosCruces.toLocaleString()}\n`;
    }
    if (employeeReportData.totalMultas > 0) {
      txtContent += `Multas: $${employeeReportData.totalMultas.toLocaleString()}\n`;
    }
    if (employeeReportData.totalFondoEmpleados > 0) {
      txtContent += `Fondo Empleados: $${employeeReportData.totalFondoEmpleados.toLocaleString()}\n`;
    }
    if (employeeReportData.totalCarteraEmpleados > 0) {
      txtContent += `Cartera Empleados: $${employeeReportData.totalCarteraEmpleados.toLocaleString()}\n`;
    }
    if (employeeReportData.totalAdvanceDeduction > 0) {
      txtContent += `Anticipo Quincena: $${employeeReportData.totalAdvanceDeduction.toLocaleString()}\n`;
    }
    txtContent += `TOTAL DEDUCCIONES: $${employeeReportData.totalDeductions.toLocaleString()}\n\n`;
    txtContent += `SALARIO NETO TOTAL: $${employeeReportData.totalNetSalary.toLocaleString()}\n\n`;
    
    txtContent += `DETALLE MES A MES\n`;
    txtContent += `${'='.repeat(80)}\n`;
    employeeReportData.monthlyDetails.forEach(detail => {
      txtContent += `${formatMonthYear(detail.month).toUpperCase()}\n`;
      txtContent += `Días Trabajados: ${detail.workedDays}\n`;
      txtContent += `Base Salarial: $${detail.baseSalary.toLocaleString()}\n`;
      txtContent += `Salario Mes: $${detail.grossSalary.toLocaleString()}\n`;
      txtContent += `Auxilio Transporte: $${detail.transportAllowance.toLocaleString()}\n`;
      txtContent += `Bonificaciones: $${detail.bonuses.toLocaleString()}\n`;
      txtContent += `Total Devengado: $${detail.totalEarned.toLocaleString()}\n`;
      txtContent += `Total Deducciones: $${detail.totalDeductions.toLocaleString()}\n`;
      txtContent += `Salario Neto: $${detail.netSalary.toLocaleString()}\n`;
      txtContent += `${'-'.repeat(40)}\n`;
    });
    
    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_individual_${employeeReportData.employee.name.replace(/\s+/g, '_')}_${startMonth}_${endMonth}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportGeneralReport = () => {
    if (!generalReportData) return;

    const startFormatted = formatMonthYear(startMonth);
    const endFormatted = formatMonthYear(endMonth);
    
    let txtContent = `REPORTE GENERAL DE NÓMINA\n`;
    txtContent += `Período: ${startFormatted} - ${endFormatted}\n`;
    txtContent += `Fecha de generación: ${new Date().toLocaleDateString()}\n`;
    txtContent += `${'='.repeat(80)}\n\n`;
    
    txtContent += `RESUMEN ACUMULADO DEL PERÍODO - TODOS LOS EMPLEADOS\n`;
    txtContent += `${'='.repeat(60)}\n`;
    txtContent += `Total Días Trabajados: ${generalReportData.totalWorkedDays}\n`;
    txtContent += `Base Salarial Total: $${generalReportData.totalBaseSalary.toLocaleString()}\n`;
    txtContent += `Salario Mes Total: $${generalReportData.totalGrossSalary.toLocaleString()}\n`;
    txtContent += `Auxilio Transporte Total: $${generalReportData.totalTransportAllowance.toLocaleString()}\n`;
    txtContent += `Bonificaciones Total: $${generalReportData.totalBonuses.toLocaleString()}\n`;
    txtContent += `TOTAL DEVENGADO: $${generalReportData.totalEarned.toLocaleString()}\n\n`;
    
    txtContent += `DEDUCCIONES ACUMULADAS:\n`;
    txtContent += `Salud: $${generalReportData.totalHealthDeduction.toLocaleString()}\n`;
    txtContent += `Pensión: $${generalReportData.totalPensionDeduction.toLocaleString()}\n`;
    if (generalReportData.totalSolidarityDeduction > 0) {
      txtContent += `Solidaridad: $${generalReportData.totalSolidarityDeduction.toLocaleString()}\n`;
    }
    if (generalReportData.totalAbsenceDeduction > 0) {
      txtContent += `Ausencias: $${generalReportData.totalAbsenceDeduction.toLocaleString()}\n`;
    }
    if (generalReportData.totalPlanCorporativo > 0) {
      txtContent += `Plan Corporativo: $${generalReportData.totalPlanCorporativo.toLocaleString()}\n`;
    }
    if (generalReportData.totalRecordar > 0) {
      txtContent += `Recordar: $${generalReportData.totalRecordar.toLocaleString()}\n`;
    }
    if (generalReportData.totalInventariosCruces > 0) {
      txtContent += `Inventarios y Cruces: $${generalReportData.totalInventariosCruces.toLocaleString()}\n`;
    }
    if (generalReportData.totalMultas > 0) {
      txtContent += `Multas: $${generalReportData.totalMultas.toLocaleString()}\n`;
    }
    if (generalReportData.totalFondoEmpleados > 0) {
      txtContent += `Fondo Empleados: $${generalReportData.totalFondoEmpleados.toLocaleString()}\n`;
    }
    if (generalReportData.totalCarteraEmpleados > 0) {
      txtContent += `Cartera Empleados: $${generalReportData.totalCarteraEmpleados.toLocaleString()}\n`;
    }
    if (generalReportData.totalAdvanceDeduction > 0) {
      txtContent += `Anticipo Quincena: $${generalReportData.totalAdvanceDeduction.toLocaleString()}\n`;
    }
    txtContent += `TOTAL DEDUCCIONES: $${generalReportData.totalDeductions.toLocaleString()}\n\n`;
    txtContent += `SALARIO NETO TOTAL: $${generalReportData.totalNetSalary.toLocaleString()}\n\n`;
    
    txtContent += `DETALLE MES A MES\n`;
    txtContent += `${'='.repeat(80)}\n`;
    generalReportData.monthlyDetails.forEach(detail => {
      txtContent += `${formatMonthYear(detail.month).toUpperCase()}\n`;
      txtContent += `Empleados: ${detail.employeeCount}\n`;
      txtContent += `Días Trabajados: ${detail.totalWorkedDays}\n`;
      txtContent += `Base Salarial: $${detail.totalBaseSalary.toLocaleString()}\n`;
      txtContent += `Salario Mes: $${detail.totalGrossSalary.toLocaleString()}\n`;
      txtContent += `Auxilio Transporte: $${detail.totalTransportAllowance.toLocaleString()}\n`;
      txtContent += `Bonificaciones: $${detail.totalBonuses.toLocaleString()}\n`;
      txtContent += `Total Devengado: $${detail.totalEarned.toLocaleString()}\n`;
      txtContent += `Total Deducciones: $${detail.totalDeductions.toLocaleString()}\n`;
      txtContent += `Salario Neto: $${detail.totalNetSalary.toLocaleString()}\n`;
      txtContent += `${'-'.repeat(40)}\n`;
    });
    
    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_general_nomina_${startMonth}_${endMonth}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentCalculations = monthlyPayrolls[selectedMonth] || [];
  const totalPayroll = currentCalculations.reduce((sum, calc) => sum + calc.netSalary, 0);
  const totalDeductions = currentCalculations.reduce((sum, calc) => sum + calc.deductions.total, 0);
  const totalTransportAllowance = currentCalculations.reduce((sum, calc) => sum + calc.transportAllowance, 0);
  const totalAdvances = currentCalculations.reduce((sum, calc) => sum + calc.deductions.advance, 0);
  const totalBonuses = currentCalculations.reduce((sum, calc) => sum + (calc.bonusCalculations?.total || calc.bonuses || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Previsualización de Nómina</h2>
        <div className="flex items-center space-x-4">
          {availableMonths.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mes a Visualizar
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {availableMonths.map(month => (
                  <option key={month} value={month}>
                    {formatMonthYear(month)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={() => setShowReports(!showReports)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>{showReports ? 'Ocultar' : 'Generar'} Reporte</span>
          </button>
          <button
            onClick={() => setShowPayslips(!showPayslips)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>{showPayslips ? 'Ocultar' : 'Ver'} Desprendibles</span>
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Actualizado: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Reports Section */}
      {showReports && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Generador de Reportes</h3>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as 'individual' | 'general')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="individual">Empleado Individual</option>
                  <option value="general">Reporte General</option>
                </select>
              </div>
              {reportType === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {allEmployees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="month"
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="month"
                  value={endMonth}
                  onChange={(e) => setEndMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={reportType === 'individual' ? generateEmployeeReport : generateGeneralReport}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors mt-6"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Generar</span>
              </button>
            </div>
          </div>

          {/* Employee Individual Report */}
          {reportType === 'individual' && employeeReportData && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={exportEmployeeReport}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar Reporte</span>
                </button>
              </div>

              {/* Employee Summary Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{employeeReportData.employee.name}</h4>
                    <p className="text-sm text-gray-500">C.C. {employeeReportData.employee.cedula}</p>
                    <p className="text-sm text-gray-500">Período: {formatMonthYear(startMonth)} - {formatMonthYear(endMonth)}</p>
                  </div>
                </div>
                
                {/* Devengado Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-green-800 mb-3 text-center">DEVENGADO ACUMULADO</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Días Trabajados</p>
                      <p className="text-lg font-bold text-green-700">{employeeReportData.totalWorkedDays}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Base Salarial</p>
                      <p className="text-lg font-bold text-green-700">${employeeReportData.totalBaseSalary.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Salario Mes</p>
                      <p className="text-lg font-bold text-green-700">${employeeReportData.totalGrossSalary.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Aux. Transporte</p>
                      <p className="text-lg font-bold text-green-700">${employeeReportData.totalTransportAllowance.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Bonificaciones</p>
                      <p className="text-lg font-bold text-green-700">${employeeReportData.totalBonuses.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 font-semibold">Total Devengado</p>
                      <p className="text-xl font-bold text-green-800">${employeeReportData.totalEarned.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Deducciones Section */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-red-800 mb-3 text-center">DEDUCCIONES ACUMULADAS</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Salud</p>
                      <p className="text-lg font-bold text-red-700">${employeeReportData.totalHealthDeduction.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Pensión</p>
                      <p className="text-lg font-bold text-red-700">${employeeReportData.totalPensionDeduction.toLocaleString()}</p>
                    </div>
                    {employeeReportData.totalSolidarityDeduction > 0 && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Solidaridad</p>
                        <p className="text-lg font-bold text-red-700">${employeeReportData.totalSolidarityDeduction.toLocaleString()}</p>
                      </div>
                    )}
                    {employeeReportData.totalAdvanceDeduction > 0 && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Anticipo Quincena</p>
                        <p className="text-lg font-bold text-red-700">${employeeReportData.totalAdvanceDeduction.toLocaleString()}</p>
                      </div>
                    )}
                    <div className="text-center col-span-2 md:col-span-4">
                      <p className="text-sm text-gray-600 font-semibold">Total Deducciones</p>
                      <p className="text-xl font-bold text-red-800">${employeeReportData.totalDeductions.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Salario Neto */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-blue-800">SALARIO NETO ACUMULADO</p>
                    <p className="text-3xl font-bold text-blue-700">${employeeReportData.totalNetSalary.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Monthly Details Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h5 className="font-semibold text-gray-900">Detalle Mes a Mes</h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Salarial</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salario Mes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aux. Transporte</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonificaciones</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Devengado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deducciones</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salario Neto</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employeeReportData.monthlyDetails.map((detail) => (
                        <tr key={detail.month}>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {formatMonthYear(detail.month)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {detail.workedDays}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${detail.baseSalary.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${detail.grossSalary.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${detail.transportAllowance.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            ${detail.bonuses.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            ${detail.totalEarned.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                            ${detail.totalDeductions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700">
                            ${detail.netSalary.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* General Report */}
          {reportType === 'general' && generalReportData && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={exportGeneralReport}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar Reporte</span>
                </button>
              </div>

              {/* General Summary Card */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Reporte General de Nómina</h4>
                    <p className="text-sm text-gray-500">Período: {formatMonthYear(startMonth)} - {formatMonthYear(endMonth)}</p>
                  </div>
                </div>
                
                {/* Devengado Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-green-800 mb-3 text-center">DEVENGADO ACUMULADO - TODOS LOS EMPLEADOS</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Días Trabajados</p>
                      <p className="text-lg font-bold text-green-700">{generalReportData.totalWorkedDays}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Base Salarial</p>
                      <p className="text-lg font-bold text-green-700">${generalReportData.totalBaseSalary.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Salario Mes</p>
                      <p className="text-lg font-bold text-green-700">${generalReportData.totalGrossSalary.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Aux. Transporte</p>
                      <p className="text-lg font-bold text-green-700">${generalReportData.totalTransportAllowance.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Bonificaciones</p>
                      <p className="text-lg font-bold text-green-700">${generalReportData.totalBonuses.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 font-semibold">Total Devengado</p>
                      <p className="text-xl font-bold text-green-800">${generalReportData.totalEarned.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Deducciones Section */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-red-800 mb-3 text-center">DEDUCCIONES ACUMULADAS</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Salud</p>
                      <p className="text-lg font-bold text-red-700">${generalReportData.totalHealthDeduction.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Pensión</p>
                      <p className="text-lg font-bold text-red-700">${generalReportData.totalPensionDeduction.toLocaleString()}</p>
                    </div>
                    {generalReportData.totalSolidarityDeduction > 0 && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Solidaridad</p>
                        <p className="text-lg font-bold text-red-700">${generalReportData.totalSolidarityDeduction.toLocaleString()}</p>
                      </div>
                    )}
                    {generalReportData.totalAdvanceDeduction > 0 && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Anticipo Quincena</p>
                        <p className="text-lg font-bold text-red-700">${generalReportData.totalAdvanceDeduction.toLocaleString()}</p>
                      </div>
                    )}
                    <div className="text-center col-span-2 md:col-span-4">
                      <p className="text-sm text-gray-600 font-semibold">Total Deducciones</p>
                      <p className="text-xl font-bold text-red-800">${generalReportData.totalDeductions.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Salario Neto */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-blue-800">SALARIO NETO ACUMULADO TOTAL</p>
                    <p className="text-3xl font-bold text-blue-700">${generalReportData.totalNetSalary.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Monthly Details Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h5 className="font-semibold text-gray-900">Detalle Mes a Mes - Todos los Empleados</h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleados</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Salarial</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salario Mes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aux. Transporte</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonificaciones</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Devengado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deducciones</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salario Neto</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {generalReportData.monthlyDetails.map((detail) => (
                        <tr key={detail.month}>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {formatMonthYear(detail.month)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {detail.employeeCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {detail.totalWorkedDays}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${detail.totalBaseSalary.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${detail.totalGrossSalary.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${detail.totalTransportAllowance.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            ${detail.totalBonuses.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            ${detail.totalEarned.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                            ${detail.totalDeductions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700">
                            ${detail.totalNetSalary.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {currentCalculations.length > 0 ? (
        <>
          {/* Summary Cards */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <span className="text-lg font-semibold text-indigo-800">
                Nómina de {formatMonthYear(selectedMonth)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6" />
                <span className="text-sm font-medium">Total Nómina</span>
              </div>
              <p className="text-2xl font-bold">${totalPayroll.toLocaleString()}</p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6" />
                <span className="text-sm font-medium">Empleados</span>
              </div>
              <p className="text-2xl font-bold">{currentCalculations.length}</p>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6" />
                <span className="text-sm font-medium">Deducciones</span>
              </div>
              <p className="text-2xl font-bold">${totalDeductions.toLocaleString()}</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6" />
                <span className="text-sm font-medium">Aux. Transporte</span>
              </div>
              <p className="text-2xl font-bold">${totalTransportAllowance.toLocaleString()}</p>
            </div>
            
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6" />
                <span className="text-sm font-medium">Anticipo Quincena</span>
              </div>
              <p className="text-2xl font-bold">${totalAdvances.toLocaleString()}</p>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6" />
                <span className="text-sm font-medium">Bonificaciones</span>
              </div>
              <p className="text-2xl font-bold">${totalBonuses.toLocaleString()}</p>
          </div>
        </div>

        {!showPayslips && (
          <div className="text-center text-sm text-gray-500 my-4">
            Haz clic en "Ver Desprendibles" para mostrar los detalles.
          </div>
        )}

        {/* Detailed Employee Cards - New Layout */}
        {showPayslips && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentCalculations.map((calc) => (
              <div key={calc.employee.id} className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{calc.employee.name}</h3>
                    <p className="text-sm text-gray-500">{calc.employee.contractType}</p>
                  </div>
                </div>
                
                {/* Devengar Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-3 text-center">DEVENGADO</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Días trabajados al mes</span>
                      <span className="font-medium">
                        {calc.workedDays}/{calc.totalDaysInMonth}
                        {calc.discountedDays > 0 && (
                          <span className="text-red-600 ml-1">(-{calc.discountedDays})</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Base Salarial</span>
                      <span className="font-medium text-blue-700">${calc.baseSalary.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-green-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Salario Mes</span>
                      <span className="font-medium">${calc.grossSalary.toLocaleString()}</span>
                    </div>
                    </div>
                    
                    {calc.transportAllowance > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Auxilio Transporte</span>
                        <span className="font-medium text-green-600">${calc.transportAllowance.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {/* Novedades Adicionadas */}
                    {calc.novelties.filter(n => 
                      ['FIXED_COMPENSATION', 'SALES_BONUS', 'FIXED_OVERTIME', 'UNEXPECTED_OVERTIME', 'NIGHT_SURCHARGE', 'SUNDAY_WORK', 'GAS_ALLOWANCE','STUDY_LICENSE'].includes(n.type)
                    ).length > 0 && (
                      <div className="border-t border-green-300 pt-2 mt-2">
                        <h5 className="text-sm font-medium text-green-800 mb-2">Novedades Adicionadas:</h5>
                        {calc.bonusCalculations.fixedCompensation > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">Compensatorios fijos</span>
                            <span className="text-green-600 font-medium">${calc.bonusCalculations.fixedCompensation.toLocaleString()}</span>
                          </div>
                        )}
                        {calc.bonusCalculations.salesBonus > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">Bonificación en venta</span>
                            <span className="text-green-600 font-medium">${calc.bonusCalculations.salesBonus.toLocaleString()}</span>
                          </div>
                        )}
                        {calc.bonusCalculations.fixedOvertime > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                              Horas extra fijas {(() => {
                                const hoursNovelty = calc.novelties.find(n => n.type === 'FIXED_OVERTIME');
                                return hoursNovelty?.hours ? `(${hoursNovelty.hours} ${hoursNovelty.hours === 1 ? 'hora' : 'horas'})` : '';
                              })()}
                            </span>
                            <span className="text-green-600 font-medium">${calc.bonusCalculations.fixedOvertime.toLocaleString()}</span>
                          </div>
                        )}
                        {calc.bonusCalculations.unexpectedOvertime > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                              Horas extra NE {(() => {
                                const hoursNovelty = calc.novelties.find(n => n.type === 'UNEXPECTED_OVERTIME');
                                return hoursNovelty?.hours ? `(${hoursNovelty.hours} ${hoursNovelty.hours === 1 ? 'hora' : 'horas'})` : '';
                              })()}
                            </span>
                            <span className="text-green-600 font-medium">${calc.bonusCalculations.unexpectedOvertime.toLocaleString()}</span>
                          </div>
                        )}
                        {calc.bonusCalculations.nightSurcharge > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                              Recargos nocturnos {(() => {
                                const hoursNovelty = calc.novelties.find(n => n.type === 'NIGHT_SURCHARGE');
                                return hoursNovelty?.hours ? `(${hoursNovelty.hours} ${hoursNovelty.hours === 1 ? 'hora' : 'horas'})` : '';
                              })()}
                            </span>
                            <span className="text-green-600 font-medium">${calc.bonusCalculations.nightSurcharge.toLocaleString()}</span>
                          </div>
                        )}
                        {calc.bonusCalculations.sundayWork > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                              Festivos {(() => {
                                const daysNovelty = calc.novelties.find(n => n.type === 'SUNDAY_WORK');
                                return daysNovelty?.days ? `(${daysNovelty.days} ${daysNovelty.days === 1 ? 'día' : 'días'})` : '';
                              })()}
                            </span>
                            <span className="text-green-600 font-medium">${calc.bonusCalculations.sundayWork.toLocaleString()}</span>
                          </div>
                        )}
                        {calc.bonusCalculations.gasAllowance > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">Auxilio de gasolina</span>
                            <span className="text-green-600 font-medium">${calc.bonusCalculations.gasAllowance.toLocaleString()}</span>
                          </div>
                        )}
                        {calc.bonusCalculations.studyLicense > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">Licencia por estudio</span>
                            <span className="text-green-600 font-medium">${calc.bonusCalculations.studyLicense.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="border-t border-green-300 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-green-800">Total Devengado</span>
                        <span className="font-bold text-green-700 text-lg">${(calc.totalEarned || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deducciones Section */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-red-800 mb-3 text-center">DEDUCCIONES</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Salud</span>
                      <span className="text-red-600 font-medium">-${calc.deductions.health.toLocaleString()}</span>
                    </div>
                    
                    {!calc.employee.isPensioned && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Pensión</span>
                        <span className="text-red-600 font-medium">-${calc.deductions.pension.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {calc.deductions.solidarity > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Solidaridad</span>
                        <span className="text-red-600 font-medium">-${calc.deductions.solidarity.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {calc.deductions.absence > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Ausencias</span>
                        <span className="text-red-600 font-medium">-${calc.deductions.absence.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {calc.deductions.planCorporativo > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Plan Corp.</span>
                        <span className="text-red-600 font-medium">-${calc.deductions.planCorporativo.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {calc.deductions.recordar > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Recordar</span>
                        <span className="text-red-600 font-medium">-${calc.deductions.recordar.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {calc.deductions.inventariosCruces > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Inventario</span>
                        <span className="text-red-600 font-medium">-${calc.deductions.inventariosCruces.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {calc.deductions.multas > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Multas</span>
                        <span className="text-red-600 font-medium">-${calc.deductions.multas.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {calc.deductions.fondoEmpleados > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">FondoEMP</span>
                        <span className="text-red-600 font-medium">-${calc.deductions.fondoEmpleados.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {calc.deductions.carteraEmpleados > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">CarteraEMP</span>
                        <span className="text-red-600 font-medium">-${calc.deductions.carteraEmpleados.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {calc.deductions.advance > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Anticipo Quincena (valor original)</span>
                        <span className="text-red-600 font-medium">-${calc.deductions.advance.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-red-300 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-red-800">Total Deducciones</span>
                        <span className="font-bold text-red-700 text-lg">-${calc.deductions.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Salario Neto */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-800 text-lg">SALARIO NETO</span>
                    <span className="font-bold text-blue-700 text-2xl">${calc.netSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay nómina calculada</h3>
          <p className="mt-1 text-sm text-gray-500">
            Ve a la sección "Calculador" para procesar la nómina de tus empleados.
          </p>
        </div>
      )}
    </div>
  );
};