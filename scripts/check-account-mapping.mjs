import assert from 'node:assert/strict';
import { mapToFSLine } from '../src/lib/audit-bus.ts';

const cases = [
  ['بنك الأهلي', '1001', 'Other', 'cash'],
  ['ذمم مدينة تجارية', '1100', 'Other', 'receivables'],
  ['موردون', '2000', 'Other', 'trade-pay'],
  ['إيرادات المبيعات', '4000', 'Other', 'sales-rev'],
  ['أرض ومباني', '1501', 'Other', 'ppe'],
  ['مصاريف الرواتب', '5001', 'Other', 'sal-exp'],
];

for (const [name, code, category, expected] of cases) {
  const actual = mapToFSLine(name, code, category);
  assert.equal(actual, expected, `${name} (${category}) should map to ${expected}, got ${actual}`);
}

console.log('account mapping regression checks passed');
