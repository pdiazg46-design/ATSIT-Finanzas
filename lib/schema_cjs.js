"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasks = exports.documents = exports.movements = exports.employees = exports.projects = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");

exports.projects = (0, sqlite_core_1.sqliteTable)('projects', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)('name').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    ownerId: (0, sqlite_core_1.integer)('owner_id'),
    category: (0, sqlite_core_1.text)('category'),
    status: (0, sqlite_core_1.text)('status').default('En curso'),
    priority: (0, sqlite_core_1.text)('priority').default('(2) Normal'),
    startDate: (0, sqlite_core_1.text)('start_date'),
    endDate: (0, sqlite_core_1.text)('end_date'),
    expectedIncome: (0, sqlite_core_1.real)('expected_income').default(0),
    expectedUtility: (0, sqlite_core_1.real)('expected_utility').default(0),
    budgetDays: (0, sqlite_core_1.real)('budget_days').default(0),
    notes: (0, sqlite_core_1.text)('notes'),
    observations: (0, sqlite_core_1.text)('observations'),
    lastActionAt: (0, sqlite_core_1.text)('last_action_at'),
    isArchived: (0, sqlite_core_1.integer)('is_archived', { mode: 'boolean' }).default(false),
});

exports.employees = (0, sqlite_core_1.sqliteTable)('employees', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    firstName: (0, sqlite_core_1.text)('first_name').notNull(),
    lastName: (0, sqlite_core_1.text)('last_name').notNull(),
    organization: (0, sqlite_core_1.text)('organization'),
    position: (0, sqlite_core_1.text)('position'),
    email: (0, sqlite_core_1.text)('email'),
    phoneMobile: (0, sqlite_core_1.text)('phone_mobile'),
    phoneWork: (0, sqlite_core_1.text)('phone_work'),
    phoneHome: (0, sqlite_core_1.text)('phone_home'),
    phoneFax: (0, sqlite_core_1.text)('phone_fax'),
    address: (0, sqlite_core_1.text)('address'),
    city: (0, sqlite_core_1.text)('city'),
    stateProvince: (0, sqlite_core_1.text)('state_province'),
    zipPostalCode: (0, sqlite_core_1.text)('zip_postal_code'),
    countryRegion: (0, sqlite_core_1.text)('country_region'),
    webPage: (0, sqlite_core_1.text)('web_page'),
    notes: (0, sqlite_core_1.text)('notes'),
});

exports.movements = (0, sqlite_core_1.sqliteTable)('movements', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)('name').notNull(),
    type: (0, sqlite_core_1.text)('type').default('Gasto'),
});

exports.documents = (0, sqlite_core_1.sqliteTable)('documents', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)('name').notNull(),
});

exports.tasks = (0, sqlite_core_1.sqliteTable)('tasks', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    projectId: (0, sqlite_core_1.integer)('project_id').notNull(),
    title: (0, sqlite_core_1.text)('title').notNull(),
    employeeId: (0, sqlite_core_1.integer)('employee_id'),
    movementId: (0, sqlite_core_1.integer)('movement_id'),
    documentId: (0, sqlite_core_1.integer)('document_id'),
    docNumber: (0, sqlite_core_1.text)('doc_number'),
    status: (0, sqlite_core_1.text)('status').default('En curso'),
    netValue: (0, sqlite_core_1.real)('net_value').default(0),
    taxValue: (0, sqlite_core_1.real)('tax_value').default(0),
    totalValue: (0, sqlite_core_1.real)('total_value').default(0),
    costDays: (0, sqlite_core_1.real)('cost_days').default(0),
    startDate: (0, sqlite_core_1.text)('start_date'),
    dueDate: (0, sqlite_core_1.text)('due_date'),
    paymentDate: (0, sqlite_core_1.text)('payment_date'),
    description: (0, sqlite_core_1.text)('description'),
    observations: (0, sqlite_core_1.text)('observations'),
    lastActionAt: (0, sqlite_core_1.text)('last_action_at'),
});
