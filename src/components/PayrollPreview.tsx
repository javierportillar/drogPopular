import React from 'react';
import { FileText, User, Calendar, DollarSign, AlertCircle, History, Download, TrendingUp } from 'lucide-react';
import { PayrollCalculation } from '../types';
import { formatMonthYear } from '../utils/dateUtils';

interface PayrollPreviewProps {
  payrollCalculations: PayrollCalculation[];
  advances: any[];
}

export const PayrollPreview: React.FC<PayrollPreviewProps> = ({ payrollCalculations, advances }) => {
  const [showHistory, setShowHistory] = React.useState(false);
  const [startMonth, setStartMonth] = React.useState(new Date().toISOString().slice(0, 7));
  const [endMonth, setEndMonth] = React.useState(new Date().toISOString().slice(0, 7));
  const [historicalData, setHistoricalData] = React.useState<any[]>([]);

  // Get all stored payroll calculations from localStorage
  const getAllStoredPayrolls = () => {
    try {
      const stored = localStorage.getItem('payrollCalculations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const generateHistoricalReport = () => {
    const allPayrolls = getAllStoredPayrolls();
    const startDate = new Date(startMonth + '-01');
    const endDate = new Date(endMonth + '-01');
    
    // Group payrolls by month and filter by date range
    const monthlyData: { [key: string]: PayrollCalculation[] } = {};
    
    allPayrolls.forEach((calc: PayrollCalculation) => {
      // Try to determine the month from the calculation date or use current month as fallback
      const calcMonth = calc.employee.createdDate?.slice(0, 7) || new Date().toISOString().slice(0, 7);
      const calcDate = new Date(calcMonth + '-01');
      
      if (calcDate >= startDate && calcDate <= endDate) {
        if (!monthlyData[calcMonth]) {
          monthlyData[calcMonth] = [];
        }
        monthlyData[calcMonth].push(calc);
      }
    });
    
    // Convert to array and sort by month
    const sortedData = Object.entries(monthlyData)
      .map(([month, calculations]) => ({
        month,
        calculations,
        totalNet: calculations.reduce((sum, calc) => sum + calc.netSalary, 0),
        totalDeductions: calculations.reduce((sum, calc) => sum + calc.deductions.total, 0),
        totalBonuses: calculations.reduce((sum, calc) => sum + (calc.bonusCalculations?.total || calc.bonuses || 0), 0),
        totalTransport: calculations.reduce((sum, calc) => sum + calc.transportAllowance, 0),
        employeeCount: calculations.length
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    setHistoricalData(sortedData);
  };

  const exportHistoricalReport = () => {
    const startFormatted = formatMonthYear(startMonth);
    const endFormatted = formatMonthYear(endMonth);
    
    let txtContent = `REPORTE HISTÓRICO DE NÓMINA\n`;
    txtContent += `Período: ${startFormatted} - ${endFormatted}\n`;
    txtContent += `Fecha de generación: ${new Date().toLocaleDateString()}\n`;
    txtContent += `${'='.repeat(80)}\n\n`;
    
    let totalPeriodNet = 0;
    let totalPeriodDeductions = 0;
    let totalPeriodBonuses = 0;
    let totalPeriodTransport = 0;
    
    historicalData.forEach((monthData) => {
      txtContent += `${formatMonthYear(monthData.month).toUpperCase()}\n`;
      txtContent += `${'='.repeat(50)}\n`;
      txtContent += `Empleados: ${monthData.employeeCount}\n`;
      txtContent += `Total Neto: $${monthData.totalNet.toLocaleString()}\n`;
      txtContent += `Total Deducciones: $${monthData.totalDeductions.toLocaleString()}\n`;
      txtContent += `Total Bonificaciones: $${monthData.totalBonuses.toLocaleString()}\n`;
      txtContent += `Total Aux. Transporte: $${monthData.totalTransport.toLocaleString()}\n`;
      txtContent += `\n`;
      
      totalPeriodNet += monthData.totalNet;
      totalPeriodDeductions += monthData.totalDeductions;
      totalPeriodBonuses += monthData.totalBonuses;
      totalPeriodTransport += monthData.totalTransport;
    });
    
    txtContent += `${'='.repeat(80)}\n`;
    txtContent += `RESUMEN DEL PERÍODO\n`;
    txtContent += `${'='.repeat(80)}\n`;
    txtContent += `Total meses analizados: ${historicalData.length}\n`;
    txtContent += `TOTAL NETO PERÍODO: $${totalPeriodNet.toLocaleString()}\n`;
    txtContent += `TOTAL DEDUCCIONES PERÍODO: $${totalPeriodDeductions.toLocaleString()}\n`;
    txtContent += `TOTAL BONIFICACIONES PERÍODO: $${totalPeriodBonuses.toLocaleString()}\n`;
    txtContent += `TOTAL AUX. TRANSPORTE PERÍODO: $${totalPeriodTransport.toLocaleString()}\n`;
    
    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_historico_${startMonth}_${endMonth}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPayroll = payrollCalculations.reduce((sum, calc) => sum + calc.netSalary, 0);
  const totalDeductions = payrollCalculations.reduce((sum, calc) => sum + calc.deductions.total, 0);
  const totalTransportAllowance = payrollCalculations.reduce((sum, calc) => sum + calc.transportAllowance, 0);
  const totalAdvances = advances ? advances.reduce((sum, adv) => sum + adv.amount, 0) : payrollCalculations.reduce((sum, calc) => sum + calc.deductions.advance, 0);
  const totalBonuses = payrollCalculations.reduce((sum, calc) => sum + (calc.bonusCalculations?.total || calc.bonuses || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Previsualización de Nómina</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <History className="h-4 w-4" />
            <span>{showHistory ? 'Ocultar' : 'Ver'} Histórico</span>
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Actualizado: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Historical Report Section */}
      {showHistory && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Reporte Histórico de Nómina</h3>
            <div className="flex items-center space-x-4">
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
                onClick={generateHistoricalReport}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors mt-6"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Generar Reporte</span>
              </button>
            </div>
          </div>
          
          {historicalData.length > 0 && (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={exportHistoricalReport}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar Reporte</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleados</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Neto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deducciones</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonificaciones</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aux. Transporte</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historicalData.map((monthData) => (
                      <tr key={monthData.month}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {formatMonthYear(monthData.month)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {monthData.employeeCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ${monthData.totalNet.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          ${monthData.totalDeductions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          ${monthData.totalBonuses.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                          ${monthData.totalTransport.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">TOTALES</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                        {historicalData.reduce((sum, data) => sum + data.employeeCount, 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-green-700">
                        ${historicalData.reduce((sum, data) => sum + data.totalNet, 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-red-700">
                        ${historicalData.reduce((sum, data) => sum + data.totalDeductions, 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-700">
                        ${historicalData.reduce((sum, data) => sum + data.totalBonuses, 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-purple-700">
                        ${historicalData.reduce((sum, data) => sum + data.totalTransport, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {payrollCalculations.length > 0 ? (
        <>
          {/* Summary Cards */}
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
              <p className="text-2xl font-bold">{payrollCalculations.length}</p>
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

          {/* Detailed Employee Cards - New Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {payrollCalculations.map((calc) => (
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
                  <h4 className="font-semibold text-green-800 mb-3 text-center">DEVENGAR</h4>
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
                      <span className="text-sm text-gray-700">Salario Base</span>
                      <span className="font-medium">${calc.baseSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Salario Bruto</span>
                      <span className="font-medium">${calc.grossSalary.toLocaleString()}</span>
                    </div>
                    
                    {calc.transportAllowance > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Auxilio Transporte</span>
                        <span className="font-medium text-green-600">${calc.transportAllowance.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {/* Novedades Adicionadas */}
                    {calc.novelties.filter(n => 
                      ['FIXED_COMPENSATION', 'SALES_BONUS', 'FIXED_OVERTIME', 'UNEXPECTED_OVERTIME', 'NIGHT_SURCHARGE', 'SUNDAY_WORK', 'GAS_ALLOWANCE'].includes(n.type)
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