// Test date logic untuk CREATE dan EDIT transaction

// Simulate frontend date handling
function formatDateForApi(date: Date | null): string {
  // dari page.tsx - return format yyyy-MM-dd
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Simulate backend parseToIso
function parseToIso(dateStr: string): string | null {
  if (!dateStr) return null;
  dateStr = dateStr.trim();
  const normalized = dateStr.replace(/[\.\/\s]+/g, '-');
  
  // already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;
  
  // DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY -> convert
  if (/^\d{2}-\d{2}-\d{4}$/.test(normalized)) {
    const [d, m, y] = normalized.split('-');
    return `${y}-${m}-${d}`;
  }
  
  return null;
}

// Simulate backend validateDateFormat
function validateDateFormat(isoDate: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(isoDate);
}

// Simulate backend convertDateToBackendFormat
function convertDateToBackendFormat(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return isoDate;
}

// Test CREATE flow
console.log("=== TEST CREATE FLOW ===");
const testDate = new Date(2026, 4, 8); // May 8, 2026
const apiDate = formatDateForApi(testDate);
console.log("1. Frontend formatDateForApi returns:", apiDate); // Should be "2026-05-08"

const isoDate = parseToIso(apiDate);
console.log("2. Backend parseToIso receives:", apiDate, "returns:", isoDate); // Should be "2026-05-08"

const isValid = validateDateFormat(isoDate || "");
console.log("3. Backend validateDateFormat:", isValid); // Should be true

const backendFormat = convertDateToBackendFormat(isoDate || "");
console.log("4. Backend convertDateToBackendFormat returns:", backendFormat); // Should be "08-05-2026"

// Test EDIT flow (same as CREATE since both use same logic)
console.log("\n=== TEST EDIT FLOW ===");
const editDate = new Date(2026, 0, 2); // Jan 2, 2026
const editApiDate = formatDateForApi(editDate);
console.log("1. Frontend formatDateForApi returns:", editApiDate); // Should be "2026-01-02"

const editIsoDate = parseToIso(editApiDate);
console.log("2. Backend parseToIso receives:", editApiDate, "returns:", editIsoDate); // Should be "2026-01-02"

const editIsValid = validateDateFormat(editIsoDate || "");
console.log("3. Backend validateDateFormat:", editIsValid); // Should be true

const editBackendFormat = convertDateToBackendFormat(editIsoDate || "");
console.log("4. Backend convertDateToBackendFormat returns:", editBackendFormat); // Should be "02-01-2026"

console.log("\n=== TEST INVALID INPUT ===");
const invalidInput = "invalid-date";
const invalidIso = parseToIso(invalidInput);
console.log("parseToIso('invalid-date'):", invalidIso); // Should be null
console.log("validateDateFormat on null:", validateDateFormat(invalidIso || "")); // Should be false
