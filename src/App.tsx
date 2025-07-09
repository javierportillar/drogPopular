import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { EmployeeManagement } from './components/EmployeeManagement';
import { NoveltyManagement } from './components/NoveltyManagement';
import { AdvanceManagement } from './components/AdvanceManagement';
import { PayrollCalculator } from './components/PayrollCalculator';
import { PayrollPreview } from './components/PayrollPreview';
import { SettingsManagement } from './components/SettingsManagement';
import { Employee, Novelty, PayrollCalculation, AdvancePayment, DeductionRates, DEFAULT_DEDUCTION_RATES } from './types';

function App() {
  const [activeSection, setActiveSection] = useState('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [novelties, setNovelties] = useState<Novelty[]>([]);
  const [advances, setAdvances] = useState<AdvancePayment[]>([]);
  const [payrollCalculations, setPayrollCalculations] = useState<PayrollCalculation[]>([]);
  const [deductionRates, setDeductionRates] = useState<DeductionRates>(DEFAULT_DEDUCTION_RATES);

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const storedEmployees = localStorage.getItem('employees');
      if (storedEmployees) {
        setEmployees(JSON.parse(storedEmployees));
      }

      const storedNovelties = localStorage.getItem('novelties');
      if (storedNovelties) {
        setNovelties(JSON.parse(storedNovelties));
      }

      const storedAdvances = localStorage.getItem('advances');
      if (storedAdvances) {
        setAdvances(JSON.parse(storedAdvances));
      }

      const storedPayrollCalculations = localStorage.getItem('payrollCalculations');
      if (storedPayrollCalculations) {
        setPayrollCalculations(JSON.parse(storedPayrollCalculations));
      }

      const storedDeductionRates = localStorage.getItem('deductionRates');
      if (storedDeductionRates) {
        setDeductionRates(JSON.parse(storedDeductionRates));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('employees', JSON.stringify(employees));
    } catch (error) {
      console.error("Failed to save employees to localStorage:", error);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem('novelties', JSON.stringify(novelties));
    } catch (error) {
      console.error("Failed to save novelties to localStorage:", error);
    }
  }, [novelties]);

  useEffect(() => {
    try {
      localStorage.setItem('advances', JSON.stringify(advances));
    } catch (error) {
      console.error("Failed to save advances to localStorage:", error);
    }
  }, [advances]);

  useEffect(() => {
    try {
      localStorage.setItem('payrollCalculations', JSON.stringify(payrollCalculations));
    } catch (error) {
      console.error("Failed to save payrollCalculations to localStorage:", error);
    }
  }, [payrollCalculations]);

  useEffect(() => {
    try {
      localStorage.setItem('deductionRates', JSON.stringify(deductionRates));
    } catch (error) {
      console.error("Failed to save deductionRates to localStorage:", error);
    }
  }, [deductionRates]);

  // Update worked days for all employees based on current date
  useEffect(() => {
    const updateWorkedDays = () => {
      const updatedEmployees = employees.map(employee => {
        if (!employee.createdDate) return employee;
        
        const created = new Date(employee.createdDate);
        const now = new Date();
        
        // Colombia timezone offset (UTC-5)
        const colombiaOffset = -5 * 60;
        const createdColombia = new Date(created.getTime() + (colombiaOffset * 60 * 1000));
        const nowColombia = new Date(now.getTime() + (colombiaOffset * 60 * 1000));
        
        const diffTime = nowColombia.getTime() - createdColombia.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const workedDays = Math.max(1, diffDays); // Remove the 30-day limit for total worked days
        
        return { ...employee, workedDays };
      });
      
      setEmployees(updatedEmployees);
    };

    // Update worked days every hour
    const interval = setInterval(updateWorkedDays, 60 * 60 * 1000);
    updateWorkedDays(); // Initial update
    
    return () => clearInterval(interval);
  }, [employees.length]); // Only depend on employee count, not novelties

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'employees':
        return <EmployeeManagement employees={employees} setEmployees={setEmployees} />;
      case 'novelties':
        return (
          <NoveltyManagement
            employees={employees}
            novelties={novelties}
            setNovelties={setNovelties}
            setEmployees={setEmployees}
          />
        );
      case 'advances':
        return (
          <AdvanceManagement
            employees={employees}
            advances={advances}
            setAdvances={setAdvances}
          />
        );
      case 'calculator':
        return (
          <PayrollCalculator
            employees={employees}
            novelties={novelties}
            advances={advances}
            deductionRates={deductionRates}
            setPayrollCalculations={setPayrollCalculations}
            payrollCalculations={payrollCalculations}
          />
        );
      case 'preview':
        return <PayrollPreview payrollCalculations={payrollCalculations} advances={advances} />;
      case 'settings':
        return (
          <SettingsManagement
            deductionRates={deductionRates}
            setDeductionRates={setDeductionRates}
          />
        );
      default:
        return <EmployeeManagement employees={employees} setEmployees={setEmployees} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveSection()}
      </main>
    </div>
  );
}

export default App;
