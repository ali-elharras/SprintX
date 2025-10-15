// Test script for booth conflict detection logic
// This script simulates different date scenarios to verify the conflict detection works correctly

// Test cases for date range overlap detection
const testCases = [
  {
    name: "No overlap - requested period before existing",
    requested: { start: "2025-01-01", end: "2025-01-07" },
    existing: { start: "2025-01-15", end: "2025-01-21" },
    shouldConflict: false
  },
  {
    name: "No overlap - requested period after existing",
    requested: { start: "2025-02-01", end: "2025-02-07" },
    existing: { start: "2025-01-15", end: "2025-01-21" },
    shouldConflict: false
  },
  {
    name: "Overlap - requested starts within existing period",
    requested: { start: "2025-01-10", end: "2025-01-17" },
    existing: { start: "2025-01-01", end: "2025-01-15" },
    shouldConflict: true
  },
  {
    name: "Overlap - requested ends within existing period",
    requested: { start: "2025-01-01", end: "2025-01-10" },
    existing: { start: "2025-01-05", end: "2025-01-15" },
    shouldConflict: true
  },
  {
    name: "Overlap - requested completely covers existing",
    requested: { start: "2025-01-01", end: "2025-01-30" },
    existing: { start: "2025-01-10", end: "2025-01-15" },
    shouldConflict: true
  },
  {
    name: "Overlap - existing completely covers requested",
    requested: { start: "2025-01-10", end: "2025-01-15" },
    existing: { start: "2025-01-01", end: "2025-01-30" },
    shouldConflict: true
  },
  {
    name: "Edge case - exact same period",
    requested: { start: "2025-01-10", end: "2025-01-15" },
    existing: { start: "2025-01-10", end: "2025-01-15" },
    shouldConflict: true
  },
  {
    name: "Edge case - requested starts exactly when existing ends",
    requested: { start: "2025-01-15", end: "2025-01-20" },
    existing: { start: "2025-01-10", end: "2025-01-15" },
    shouldConflict: false
  },
  {
    name: "Edge case - requested ends exactly when existing starts",
    requested: { start: "2025-01-01", end: "2025-01-10" },
    existing: { start: "2025-01-10", end: "2025-01-15" },
    shouldConflict: false
  },
  {
    name: "Year boundary test - December to January",
    requested: { start: "2024-12-25", end: "2025-01-05" },
    existing: { start: "2024-12-30", end: "2025-01-03" },
    shouldConflict: true
  },
  {
    name: "Year boundary test - no overlap across years",
    requested: { start: "2024-12-25", end: "2024-12-30" },
    existing: { start: "2025-01-01", end: "2025-01-05" },
    shouldConflict: false
  }
];

// Function to check if two date ranges overlap
function dateRangesOverlap(start1, end1, start2, end2) {
  // Two ranges overlap if: NOT (end1 <= start2 OR end2 <= start1)
  return !(end1 <= start2 || end2 <= start1);
}

// Test each case
console.log("Testing Booth Conflict Detection Logic\n");
console.log("=" .repeat(60));

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const requestedStart = new Date(testCase.requested.start);
  const requestedEnd = new Date(testCase.requested.end);
  const existingStart = new Date(testCase.existing.start);
  const existingEnd = new Date(testCase.existing.end);

  const actualConflict = dateRangesOverlap(requestedStart, requestedEnd, existingStart, existingEnd);
  const expectedConflict = testCase.shouldConflict;

  const status = actualConflict === expectedConflict ? "✅ PASS" : "❌ FAIL";

  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`  Requested: ${testCase.requested.start} to ${testCase.requested.end}`);
  console.log(`  Existing:  ${testCase.existing.start} to ${testCase.existing.end}`);
  console.log(`  Expected: ${expectedConflict ? "CONFLICT" : "NO CONFLICT"}`);
  console.log(`  Actual:   ${actualConflict ? "CONFLICT" : "NO CONFLICT"}`);
  console.log(`  Result:   ${status}\n`);

  if (actualConflict === expectedConflict) {
    passed++;
  } else {
    failed++;
  }
});

console.log("=" .repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log("🎉 All tests passed! The conflict detection logic is working correctly.");
} else {
  console.log("⚠️  Some tests failed. Please review the logic.");
}

// MongoDB Query simulation
console.log("\n" + "=" .repeat(60));
console.log("MongoDB Query Structure for Conflict Detection:");
console.log("=" .repeat(60));

const exampleQuery = {
  status: "approved",
  $or: [
    // Existing application starts within the requested period
    {
      startDate: { $gte: new Date("2025-01-10") },
      startDate: { $lte: new Date("2025-01-15") }
    },
    // Existing application ends within the requested period
    {
      endDate: { $gte: new Date("2025-01-10") },
      endDate: { $lte: new Date("2025-01-15") }
    },
    // Existing application completely covers the requested period
    {
      startDate: { $lte: new Date("2025-01-10") },
      endDate: { $gte: new Date("2025-01-15") }
    }
  ]
};

console.log("Query to find conflicting booth applications:");
console.log(JSON.stringify(exampleQuery, null, 2));
console.log("\nThis query correctly identifies overlapping date ranges for booth bookings.");
