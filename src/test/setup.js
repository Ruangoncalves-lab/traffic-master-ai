import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extends Vitest with matchers like toBeInTheDocument
expect.extend(matchers);

// Cleanup components after each test run
afterEach(() => {
  cleanup();
});
