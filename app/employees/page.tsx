import { db } from '@/lib/db';
import { employees } from '@/lib/schema';
import EmployeeList from '@/components/EmployeeList';

export default async function EmployeesPage() {
    const allEmployees = await db.select().from(employees).all();

    return (
        <EmployeeList initialEmployees={allEmployees} />
    );
}
