import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'

beforeEach(() => {
  // Ensure global confirm is reset between tests; vitest uses jsdom where confirm may be undefined.
  if (!('confirm' in window)) {
    // @ts-expect-error jsdom lacks confirm by default; provide a stub.
    window.confirm = () => true
  }
})
