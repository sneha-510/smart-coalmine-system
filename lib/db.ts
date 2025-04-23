import { neon } from "@neondatabase/serverless"

// Database connection
const connectionString = process.env.NEON_DB_URL;

// Create a SQL query function using the Neon serverless driver
const sql = neon(connectionString)

// Initialize database tables if they don't exist
export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
      )
    `

    // Create shifts table
    await sql`
      CREATE TABLE IF NOT EXISTS shifts (
        id SERIAL PRIMARY KEY,
        date DATE,
        start_time TIME,
        end_time TIME,
        assigned_to INTEGER REFERENCES users(id),
        created_by INTEGER
      )
    `

    // Create attendance table
    await sql`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        shift_id INTEGER,
        check_in TIMESTAMP,
        check_out TIMESTAMP
      )
    `

    // Create alerts table
    await sql`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        shift_id INTEGER,
        message TEXT,
        timestamp TIMESTAMP,
        status TEXT
      )
    `

    // Create reports table
    await sql`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        auditor_id INTEGER,
        shift_id INTEGER,
        findings TEXT,
        timestamp TIMESTAMP
      )
    `

    // Check if default users exist
    const rows = await sql`SELECT * FROM users WHERE email = ${"admin@mine.com"}`

    // Insert default users if they don't exist
    if (rows.length === 0) {
      const defaultUsers = [
        { email: "admin@mine.com", password: "admin123", role: "admin", full_name: "Admin User" },
        { email: "worker1@mine.com", password: "worker123", role: "worker", full_name: "Worker One" },
        { email: "auditor1@mine.com", password: "auditor123", role: "auditor", full_name: "Auditor One" },
      ]

      for (const user of defaultUsers) {
        await sql`
          INSERT INTO users (full_name, email, password, role) 
          VALUES (${user.full_name}, ${user.email}, ${user.password}, ${user.role})
        `
      }
    }

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
  }
}

// Get user by email and password
export async function getUserByCredentials(email, password) {
  const rows = await sql`
    SELECT * FROM users WHERE email = ${email} AND password = ${password}
  `
  return rows[0]
}

// Get user by ID
export async function getUserById(id) {
  const rows = await sql`SELECT * FROM users WHERE id = ${id}`
  return rows[0]
}

// Get all users by role
export async function getUsersByRole(role) {
  const rows = await sql`SELECT * FROM users WHERE role = ${role}`
  return rows
}

// Get all users except admins
export async function getNonAdminUsers() {
  const rows = await sql`SELECT * FROM users WHERE role != ${"admin"}`
  return rows
}

// Create a new user
export async function createUser(fullName, email, password, role) {
  const rows = await sql`
    INSERT INTO users (full_name, email, password, role) 
    VALUES (${fullName}, ${email}, ${password}, ${role}) 
    RETURNING *
  `
  return rows[0]
}

// Update a user
export async function updateUser(id, fullName, email, password, role) {
  const rows = await sql`
    UPDATE users 
    SET full_name = ${fullName}, email = ${email}, password = ${password}, role = ${role} 
    WHERE id = ${id} 
    RETURNING *
  `
  return rows[0]
}

// Delete a user
export async function deleteUser(id) {
  await sql`DELETE FROM users WHERE id = ${id}`
}

// Create a new shift
export async function createShift(date, startTime, endTime, assignedTo, createdBy) {
  const rows = await sql`
    INSERT INTO shifts (date, start_time, end_time, assigned_to, created_by) 
    VALUES (${date}, ${startTime}, ${endTime}, ${assignedTo}, ${createdBy}) 
    RETURNING *
  `
  return rows[0]
}

// Get shifts by user ID
export async function getShiftsByUserId(userId) {
  const rows = await sql`
    SELECT shifts.*, users.full_name 
    FROM shifts 
    JOIN users ON shifts.assigned_to = users.id 
    WHERE assigned_to = ${userId}
  `
  return rows
}

// Get all shifts
export async function getAllShifts() {
  const rows = await sql`
    SELECT shifts.*, users.full_name 
    FROM shifts 
    JOIN users ON shifts.assigned_to = users.id
  `
  return rows
}

// Update a shift
export async function updateShift(id, date, startTime, endTime, assignedTo) {
  const rows = await sql`
    UPDATE shifts 
    SET date = ${date}, start_time = ${startTime}, end_time = ${endTime}, assigned_to = ${assignedTo} 
    WHERE id = ${id} 
    RETURNING *
  `
  return rows[0]
}

// Delete a shift
export async function deleteShift(id) {
  await sql`DELETE FROM shifts WHERE id = ${id}`
}

// Record attendance (check-in)
export async function checkIn(userId, shiftId) {
  const rows = await sql`
    INSERT INTO attendance (user_id, shift_id, check_in) 
    VALUES (${userId}, ${shiftId}, NOW()) 
    RETURNING *
  `
  return rows[0]
}

// Update attendance (check-out)
export async function checkOut(id) {
  const rows = await sql`
    UPDATE attendance 
    SET check_out = NOW() 
    WHERE id = ${id} 
    RETURNING *
  `
  return rows[0]
}

// Get attendance by user ID
export async function getAttendanceByUserId(userId) {
  const rows = await sql`
    SELECT attendance.*, shifts.date, shifts.start_time, shifts.end_time 
    FROM attendance 
    JOIN shifts ON attendance.shift_id = shifts.id 
    WHERE attendance.user_id = ${userId}
  `
  return rows
}

// Get all attendance records
export async function getAllAttendance() {
  const rows = await sql`
    SELECT attendance.*, shifts.date, shifts.start_time, shifts.end_time, users.full_name 
    FROM attendance 
    JOIN shifts ON attendance.shift_id = shifts.id 
    JOIN users ON attendance.user_id = users.id
  `
  return rows
}

// Create a new alert
export async function createAlert(userId, shiftId, message) {
  const rows = await sql`
    INSERT INTO alerts (user_id, shift_id, message, timestamp, status) 
    VALUES (${userId}, ${shiftId}, ${message}, NOW(), ${"Open"}) 
    RETURNING *
  `
  return rows[0]
}

// Get alerts by user ID
export async function getAlertsByUserId(userId) {
  const rows = await sql`SELECT * FROM alerts WHERE user_id = ${userId}`
  return rows
}

// Get all alerts
export async function getAllAlerts() {
  const rows = await sql`
    SELECT alerts.*, users.full_name 
    FROM alerts 
    JOIN users ON alerts.user_id = users.id
  `
  return rows
}

// Update alert status
export async function updateAlertStatus(id, status) {
  const rows = await sql`
    UPDATE alerts 
    SET status = ${status} 
    WHERE id = ${id} 
    RETURNING *
  `
  return rows[0]
}

// Create a new report
export async function createReport(auditorId, shiftId, findings) {
  const rows = await sql`
    INSERT INTO reports (auditor_id, shift_id, findings, timestamp) 
    VALUES (${auditorId}, ${shiftId}, ${findings}, NOW()) 
    RETURNING *
  `
  return rows[0]
}

// Get all reports
export async function getAllReports() {
  const rows = await sql`
    SELECT reports.*, users.full_name 
    FROM reports 
    JOIN users ON reports.auditor_id = users.id
  `
  return rows
}

// Get reports by auditor ID
export async function getReportsByAuditorId(auditorId) {
  const rows = await sql`SELECT * FROM reports WHERE auditor_id = ${auditorId}`
  return rows
}
