import React, { useState } from 'react';
import { FileText, Download, User, Calendar, DollarSign, FileDown } from 'lucide-react';
import { PayrollCalculation } from '../types';
import { formatMonthYear } from '../utils/dateUtils';
import jsPDF from 'jspdf';

interface PayrollPreviewProps {
  monthlyPayrolls: Record<string, PayrollCalculation[]>;
}

export const PayrollPreview: React.FC<PayrollPreviewProps> = ({ monthlyPayrolls }) => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [showPayslips, setShowPayslips] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const availableMonths = Object.keys(monthlyPayrolls)
    .filter(month => monthlyPayrolls[month].length > 0)
    .sort((a, b) => b.localeCompare(a));

  const selectedPayroll = selectedMonth ? monthlyPayrolls[selectedMonth] || [] : [];

  const exportPayslipsTxt = () => {
    if (!selectedMonth || selectedPayroll.length === 0) return;

    const monthFormatted = formatMonthYear(selectedMonth);
    
    let txtContent = `DESPRENDIBLES DE PAGO - ${monthFormatted}\n`;
    txtContent += `Fecha de generación: ${new Date().toLocaleDateString()}\n`;
    txtContent += `${'='.repeat(50)}\n\n`;

    selectedPayroll
      .sort((a, b) => a.employee.name.localeCompare(b.employee.name))
      .forEach((calc, index) => {
        txtContent += `${index + 1}. ${calc.employee.name}\n`;
        txtContent += `   Cédula: ${calc.employee.cedula}\n`;
        txtContent += `   Contrato: ${calc.employee.contractType}\n`;
        txtContent += `   Fecha: ${new Date().toLocaleDateString()}\n`;
        txtContent += `   Salario Base: $${(calc.baseSalary ?? 0).toLocaleString()}\n`;
        txtContent += `   Días Trabajados: ${calc.workedDays}/${calc.totalDaysInMonth}\n`;
        txtContent += `   Salario Bruto: $${(calc.grossSalary ?? 0).toLocaleString()}\n`;
        
        if ((calc.transportAllowance ?? 0) > 0) {
          txtContent += `   Auxilio Transporte: $${(calc.transportAllowance ?? 0).toLocaleString()}\n`;
        }
        
        if ((calc.bonusCalculations?.total || 0) > 0) {
          txtContent += `   Adiciones:\n`;
          if ((calc.bonusCalculations?.fixedCompensation || 0) > 0) {
            txtContent += `     - Compensatorios fijos: $${(calc.bonusCalculations?.fixedCompensation || 0).toLocaleString()}\n`;
          }
          if ((calc.bonusCalculations?.salesBonus || 0) > 0) {
            txtContent += `     - Bonificación en venta: $${(calc.bonusCalculations?.salesBonus || 0).toLocaleString()}\n`;
          }
          if ((calc.bonusCalculations?.fixedOvertime || 0) > 0) {
            txtContent += `     - Horas extra fijas: $${(calc.bonusCalculations?.fixedOvertime || 0).toLocaleString()}\n`;
          }
          if ((calc.bonusCalculations?.unexpectedOvertime || 0) > 0) {
            txtContent += `     - Horas extra NE: $${(calc.bonusCalculations?.unexpectedOvertime || 0).toLocaleString()}\n`;
          }
          if ((calc.bonusCalculations?.nightSurcharge || 0) > 0) {
            txtContent += `     - Recargos nocturnos: $${(calc.bonusCalculations?.nightSurcharge || 0).toLocaleString()}\n`;
          }
          if ((calc.bonusCalculations?.sundayWork || 0) > 0) {
            txtContent += `     - Festivos: $${(calc.bonusCalculations?.sundayWork || 0).toLocaleString()}\n`;
          }
          if ((calc.bonusCalculations?.gasAllowance || 0) > 0) {
            txtContent += `     - Auxilio de gasolina: $${(calc.bonusCalculations?.gasAllowance || 0).toLocaleString()}\n`;
          }
          if ((calc.bonusCalculations?.studyLicense || 0) > 0) {
            txtContent += `     - Licencia por estudio: $${(calc.bonusCalculations?.studyLicense || 0).toLocaleString()}\n`;
          }
          txtContent += `     - Total Adiciones: $${(calc.bonusCalculations?.total || 0).toLocaleString()}\n`;
        }
        
        txtContent += `   TOTAL DEVENGADO: $${(calc.totalEarned ?? 0).toLocaleString()}\n`;
        txtContent += `   Deducciones:\n`;
        txtContent += `     - Salud: $${(calc.deductions?.health ?? 0).toLocaleString()}\n`;
        txtContent += `     - Pensión: $${(calc.deductions?.pension ?? 0).toLocaleString()}\n`;
        
        if ((calc.deductions?.solidarity ?? 0) > 0) {
          txtContent += `     - Solidaridad: $${(calc.deductions?.solidarity ?? 0).toLocaleString()}\n`;
        }
        if ((calc.deductions?.absence ?? 0) > 0) {
          txtContent += `     - Ausencias: $${(calc.deductions?.absence ?? 0).toLocaleString()}\n`;
        }
        if ((calc.deductions?.planCorporativo ?? 0) > 0) {
          txtContent += `     - Plan corporativo: $${(calc.deductions?.planCorporativo ?? 0).toLocaleString()}\n`;
        }
        if ((calc.deductions?.recordar ?? 0) > 0) {
          txtContent += `     - Recordar: $${(calc.deductions?.recordar ?? 0).toLocaleString()}\n`;
        }
        if ((calc.deductions?.inventariosCruces ?? 0) > 0) {
          txtContent += `     - Inventarios y cruces: $${(calc.deductions?.inventariosCruces ?? 0).toLocaleString()}\n`;
        }
        if ((calc.deductions?.multas ?? 0) > 0) {
          txtContent += `     - Multas: $${(calc.deductions?.multas ?? 0).toLocaleString()}\n`;
        }
        if ((calc.deductions?.fondoEmpleados ?? 0) > 0) {
          txtContent += `     - Fondo empleados: $${(calc.deductions?.fondoEmpleados ?? 0).toLocaleString()}\n`;
        }
        if ((calc.deductions?.carteraEmpleados ?? 0) > 0) {
          txtContent += `     - Cartera empleados: $${(calc.deductions?.carteraEmpleados ?? 0).toLocaleString()}\n`;
        }
        if ((calc.deductions?.advance ?? 0) > 0) {
          txtContent += `     - Anticipo Quincena: $${(calc.deductions?.advance ?? 0).toLocaleString()}\n`;
        }
        
        txtContent += `     - Total Deducciones: $${(calc.deductions?.total ?? 0).toLocaleString()}\n`;
        txtContent += `   SALARIO NETO: $${(calc.netSalary ?? 0).toLocaleString()}\n`;
        txtContent += `\n${'-'.repeat(50)}\n\n`;
      });

    const totalNet = selectedPayroll.reduce((sum, calc) => sum + (calc.netSalary ?? 0), 0);
    txtContent += `TOTAL NÓMINA NETA: $${totalNet.toLocaleString()}\n`;

    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `desprendibles_nomina_${selectedMonth}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPayslipsPDF = async () => {
    if (!selectedMonth || selectedPayroll.length === 0) return;
    
    setIsGeneratingPDF(true);
    const monthFormatted = formatMonthYear(selectedMonth);
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    
    const sortedPayroll = selectedPayroll.sort((a, b) => a.employee.name.localeCompare(b.employee.name));
    
    for (let i = 0; i < sortedPayroll.length; i++) {
      const calc = sortedPayroll[i];
      
      if (i > 0) {
        pdf.addPage();
      }
      
      // Header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DESPRENDIBLE DE PAGO', pageWidth / 2, margin, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${monthFormatted}`, pageWidth / 2, margin + 8, { align: 'center' });
      
      // Employee info
      let yPos = margin + 25;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Empleado: ${calc.employee.name}`, margin, yPos);
      
      yPos += 8;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Cédula: ${calc.employee.cedula}`, margin, yPos);
      
      yPos += 6;
      pdf.text(`Contrato: ${calc.employee.contractType}`, margin, yPos);
      
      yPos += 6;
      pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, margin, yPos);
      
      // Earnings section
      yPos += 20;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DEVENGADO', margin, yPos);
      
      yPos += 10;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Salario Base:`, margin, yPos);
      pdf.text(`$${(calc.baseSalary ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      
      yPos += 6;
      pdf.text(`Días Trabajados: ${calc.workedDays}/${calc.totalDaysInMonth}`, margin, yPos);
      
      yPos += 6;
      pdf.text(`Salario Bruto:`, margin, yPos);
      pdf.text(`$${(calc.grossSalary ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      
      if ((calc.transportAllowance ?? 0) > 0) {
        yPos += 6;
        pdf.text(`Auxilio Transporte:`, margin, yPos);
        pdf.text(`$${(calc.transportAllowance ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      }
      
      // Bonuses
      if ((calc.bonusCalculations?.total || 0) > 0) {
        if ((calc.bonusCalculations?.fixedCompensation || 0) > 0) {
          yPos += 6;
          pdf.text(`Compensatorios Fijos:`, margin, yPos);
          pdf.text(`$${(calc.bonusCalculations?.fixedCompensation || 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
        }
        if ((calc.bonusCalculations?.salesBonus || 0) > 0) {
          yPos += 6;
          pdf.text(`Bonificación en Venta:`, margin, yPos);
          pdf.text(`$${(calc.bonusCalculations?.salesBonus || 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
        }
        if ((calc.bonusCalculations?.fixedOvertime || 0) > 0) {
          yPos += 6;
          pdf.text(`Horas Extra Fijas:`, margin, yPos);
          pdf.text(`$${(calc.bonusCalculations?.fixedOvertime || 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
        }
        if ((calc.bonusCalculations?.unexpectedOvertime || 0) > 0) {
          yPos += 6;
          pdf.text(`Horas Extra NE:`, margin, yPos);
          pdf.text(`$${(calc.bonusCalculations?.unexpectedOvertime || 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
        }
        if ((calc.bonusCalculations?.nightSurcharge || 0) > 0) {
          yPos += 6;
          pdf.text(`Recargos Nocturnos:`, margin, yPos);
          pdf.text(`$${(calc.bonusCalculations?.nightSurcharge || 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
        }
        if ((calc.bonusCalculations?.sundayWork || 0) > 0) {
          yPos += 6;
          pdf.text(`Festivos:`, margin, yPos);
          pdf.text(`$${(calc.bonusCalculations?.sundayWork || 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
        }
        if ((calc.bonusCalculations?.gasAllowance || 0) > 0) {
          yPos += 6;
          pdf.text(`Auxilio de Gasolina:`, margin, yPos);
          pdf.text(`$${(calc.bonusCalculations?.gasAllowance || 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
        }
        if ((calc.bonusCalculations?.studyLicense || 0) > 0) {
          yPos += 6;
          pdf.text(`Licencia por Estudio:`, margin, yPos);
          pdf.text(`$${(calc.bonusCalculations?.studyLicense || 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
        }
      }
      
      yPos += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text(`TOTAL DEVENGADO:`, margin, yPos);
      pdf.text(`$${(calc.totalEarned ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      
      // Deductions section
      yPos += 15;
      pdf.text('DEDUCCIONES', margin, yPos);
      
      yPos += 10;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Salud:`, margin, yPos);
      pdf.text(`$${(calc.deductions?.health ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      
      yPos += 6;
      pdf.text(`Pensión:`, margin, yPos);
      pdf.text(`$${(calc.deductions?.pension ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      
      if ((calc.deductions?.solidarity ?? 0) > 0) {
        yPos += 6;
        pdf.text(`Solidaridad:`, margin, yPos);
        pdf.text(`$${(calc.deductions?.solidarity ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      }
      
      if ((calc.deductions?.absence ?? 0) > 0) {
        yPos += 6;
        pdf.text(`Ausencias:`, margin, yPos);
        pdf.text(`$${(calc.deductions?.absence ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      }
      
      if ((calc.deductions?.planCorporativo ?? 0) > 0) {
        yPos += 6;
        pdf.text(`Plan Corporativo:`, margin, yPos);
        pdf.text(`$${(calc.deductions?.planCorporativo ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      }
      
      if ((calc.deductions?.recordar ?? 0) > 0) {
        yPos += 6;
        pdf.text(`Recordar:`, margin, yPos);
        pdf.text(`$${(calc.deductions?.recordar ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      }
      
      if ((calc.deductions?.inventariosCruces ?? 0) > 0) {
        yPos += 6;
        pdf.text(`Inventarios y Cruces:`, margin, yPos);
        pdf.text(`$${(calc.deductions?.inventariosCruces ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      }
      
      if ((calc.deductions?.multas ?? 0) > 0) {
        yPos += 6;
        pdf.text(`Multas:`, margin, yPos);
        pdf.text(`$${(calc.deductions?.multas ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      }
      
      if ((calc.deductions?.fondoEmpleados ?? 0) > 0) {
        yPos += 6;
        pdf.text(`Fondo Empleados:`, margin, yPos);
        pdf.text(`$${(calc.deductions?.fondoEmpleados ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      }
      
      if ((calc.deductions?.carteraEmpleados ?? 0) > 0) {
        yPos += 6;
        pdf.text(`Cartera Empleados:`, margin, yPos);
        pdf.text(`$${(calc.deductions?.carteraEmpleados ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      }
      
      if ((calc.deductions?.advance ?? 0) > 0) {
        yPos += 6;
        pdf.text(`Anticipo Quincena:`, margin, yPos);
        pdf.text(`$${(calc.deductions?.advance ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      }
      
      yPos += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text(`TOTAL DEDUCCIONES:`, margin, yPos);
      pdf.text(`$${(calc.deductions?.total ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      
      // Net salary
      yPos += 15;
      pdf.setFontSize(14);
      pdf.text(`SALARIO NETO:`, margin, yPos);
      pdf.text(`$${(calc.netSalary ?? 0).toLocaleString()}`, pageWidth - margin - 30, yPos, { align: 'right' });
      
      // Footer
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Generado el ${new Date().toLocaleDateString()} - Droguerías Popular`, 
        pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
    
    pdf.save(`desprendibles_nomina_${selectedMonth}.pdf`);
    setIsGeneratingPDF(false);
  };

  const totalPayroll = selectedPayroll.reduce((sum, calc) => sum + (calc.netSalary ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Previsualización de Nóminas</h2>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar Mes
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setShowPayslips(false);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Seleccionar mes</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {formatMonthYear(month)}
                </option>
              ))}
            </select>
          </div>
          {selectedMonth && selectedPayroll.length > 0 && (
            <button
              onClick={() => setShowPayslips(!showPayslips)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>{showPayslips ? 'Ocultar' : 'Ver'} Desprendibles</span>
            </button>
          )}
        </div>
      </div>

      {selectedMonth && selectedPayroll.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="h-6 w-6" />
            <span className="text-lg font-medium">Nómina - {formatMonthYear(selectedMonth)}</span>
          </div>
          <p className="text-3xl font-bold">${totalPayroll.toLocaleString()}</p>
          <p className="text-indigo-100 text-sm">
            {selectedPayroll.length} empleados procesados
          </p>
        </div>
      )}

      {showPayslips && selectedPayroll.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-indigo-900">
                Desprendibles de Pago - {formatMonthYear(selectedMonth)}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportPayslipsTxt}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar TXT</span>
                </button>
                <button
                  onClick={exportPayslipsPDF}
                  disabled={isGeneratingPDF}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <FileDown className="h-4 w-4" />
                  <span>{isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedPayroll
                .sort((a, b) => a.employee.name.localeCompare(b.employee.name))
                .map((calc) => (
                  <div key={calc.employee.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{calc.employee.name}</h4>
                        <p className="text-sm text-gray-500">C.C. {calc.employee.cedula}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Contrato:</span>
                        <span className="font-medium">{calc.employee.contractType}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Días Trabajados:</span>
                        <span className="font-medium">{calc.workedDays}/{calc.totalDaysInMonth}</span>
                      </div>
                      
                      <div className="border-t border-indigo-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Salario Bruto:</span>
                          <span className="font-medium text-green-600">${(calc.grossSalary ?? 0).toLocaleString()}</span>
                        </div>
                        
                        {(calc.transportAllowance ?? 0) > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Aux. Transporte:</span>
                            <span className="font-medium text-green-600">${(calc.transportAllowance ?? 0).toLocaleString()}</span>
                          </div>
                        )}
                        
                        {(calc.bonusCalculations?.total || 0) > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Adiciones:</span>
                            <span className="font-medium text-green-600">${(calc.bonusCalculations?.total || 0).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="border-t border-indigo-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-indigo-800">TOTAL DEVENGADO:</span>
                          <span className="font-bold text-indigo-700">${(calc.totalEarned ?? 0).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-indigo-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-indigo-800">DEDUCCIONES:</span>
                          <span className="font-bold text-red-600">${(calc.deductions?.total ?? 0).toLocaleString()}</span>
                        </div>
                        
                        {/* Detalles de deducciones */}
                        <div className="mt-2 space-y-1">
                          {(calc.deductions?.health ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">• Salud:</span>
                              <span className="text-xs text-red-600">-${(calc.deductions?.health ?? 0).toLocaleString()}</span>
                            </div>
                          )}
                          
                          {(calc.deductions?.pension ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">• Pensión:</span>
                              <span className="text-xs text-red-600">-${(calc.deductions?.pension ?? 0).toLocaleString()}</span>
                            </div>
                          )}
                          
                          {(calc.deductions?.solidarity ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">• Solidaridad:</span>
                              <span className="text-xs text-red-600">-${(calc.deductions?.solidarity ?? 0).toLocaleString()}</span>
                            </div>
                          )}
                          
                          {(calc.deductions?.absence ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">• Ausencias:</span>
                              <span className="text-xs text-red-600">-${(calc.deductions?.absence ?? 0).toLocaleString()}</span>
                            </div>
                          )}
                          
                          {(calc.deductions?.planCorporativo ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">• Plan Corporativo:</span>
                              <span className="text-xs text-red-600">-${(calc.deductions?.planCorporativo ?? 0).toLocaleString()}</span>
                            </div>
                          )}
                          
                          {(calc.deductions?.recordar ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">• Recordar:</span>
                              <span className="text-xs text-red-600">-${(calc.deductions?.recordar ?? 0).toLocaleString()}</span>
                            </div>
                          )}
                          
                          {(calc.deductions?.inventariosCruces ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">• Inventarios y Cruces:</span>
                              <span className="text-xs text-red-600">-${(calc.deductions?.inventariosCruces ?? 0).toLocaleString()}</span>
                            </div>
                          )}
                          
                          {(calc.deductions?.multas ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">• Multas:</span>
                              <span className="text-xs text-red-600">-${(calc.deductions?.multas ?? 0).toLocaleString()}</span>
                            </div>
                          )}
                          
                          {(calc.deductions?.fondoEmpleados ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">• Fondo Empleados:</span>
                              <span className="text-xs text-red-600">-${(calc.deductions?.fondoEmpleados ?? 0).toLocaleString()}</span>
                            </div>
                          )}
                          
                          {(calc.deductions?.carteraEmpleados ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">• Cartera Empleados:</span>
                              <span className="text-xs text-red-600">-${(calc.deductions?.carteraEmpleados ?? 0).toLocaleString()}</span>
                            </div>
                          )}
                          
                          {(calc.deductions?.advance ?? 0) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">• Anticipo Quincena:</span>
                              <span className="text-xs text-red-600">-${(calc.deductions?.advance ?? 0).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="border-t border-indigo-300 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-indigo-800">SALARIO NETO:</span>
                          <span className="font-bold text-indigo-700 text-lg">${(calc.netSalary ?? 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {availableMonths.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay nóminas calculadas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Primero calcula una nómina en la sección "Pago Nómina" para poder previsualizarla aquí.
          </p>
        </div>
      )}

      {selectedMonth && selectedPayroll.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos para este mes</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron cálculos de nómina para el mes seleccionado.
          </p>
        </div>
      )}
    </div>
  );
};