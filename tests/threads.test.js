const { sanitizeThreadName } = require('../app/utils/threads');

test('sanitized thread name should have emoji codes removed', () => {
	expect(sanitizeThreadName('<a:test:3945234> name')).toBe('test name');
});