import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    ownerId: integer('owner_id').references(() => employees.id),
    category: text('category'),
    status: text('status').default('En curso'), // e.g., En curso, Completado, Retrasado
    priority: text('priority').default('(2) Normal'),
    startDate: text('start_date'),
    endDate: text('end_date'),
    expectedIncome: real('expected_income').default(0),
    expectedUtility: real('expected_utility').default(0),
    budgetDays: real('budget_days').default(0),
    notes: text('notes'),
    observations: text('observations'),
    lastActionAt: text('last_action_at'),
    isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
});

export const employees = sqliteTable('employees', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    organization: text('organization'),
    position: text('position'),
    email: text('email'),
    phoneMobile: text('phone_mobile'),
    phoneWork: text('phone_work'),
    phoneHome: text('phone_home'),
    phoneFax: text('phone_fax'),
    address: text('address'),
    city: text('city'),
    stateProvince: text('state_province'),
    zipPostalCode: text('zip_postal_code'),
    countryRegion: text('country_region'),
    webPage: text('web_page'),
    notes: text('notes'),
});

export const movements = sqliteTable('movements', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(), // e.g., Servicios Profesionales, Retiro, Mano de obra
    type: text('type').default('Gasto'), // Ingreso or Gasto
});

export const documents = sqliteTable('documents', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(), // e.g., Factura Electrónica, Nota de Crédito
});

export const tasks = sqliteTable('tasks', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    projectId: integer('project_id').references(() => projects.id).notNull(),
    title: text('title').notNull(),
    employeeId: integer('employee_id').references(() => employees.id),
    movementId: integer('movement_id').references(() => movements.id),
    documentId: integer('document_id').references(() => documents.id),
    docNumber: text('doc_number'),
    status: text('status').default('En curso'),
    netValue: real('net_value').default(0),
    taxValue: real('tax_value').default(0), // 19% IVA
    totalValue: real('total_value').default(0),
    costDays: real('cost_days').default(0),
    startDate: text('start_date'),
    dueDate: text('due_date'),
    paymentDate: text('payment_date'),
    description: text('description'),
    observations: text('observations'),
    lastActionAt: text('last_action_at'),
});

export const vatPayments = sqliteTable('vat_payments', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    paymentDate: text('payment_date').notNull(),
    amount: real('amount').notNull().default(0),
    notes: text('notes'),
    createdAt: text('created_at'),
});

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    permissions: text('permissions'), // JSON string of permissions
    role: text('role').default('user'), // 'admin' | 'user'
    createdAt: text('created_at').default(new Date().toISOString()),
});
