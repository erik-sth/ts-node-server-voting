// isBetween.test.ts

import { isBetween } from '../../src/utils/time';

describe('isBetween', () => {
    // Test case for current datetime within the range
    it('returns true when current datetime is within the range', () => {
        const startDateTime = new Date('2024-02-13T12:00:00');
        const endDateTime = new Date('2024-02-18T00:00:00');

        expect(
            isBetween(
                startDateTime,
                endDateTime,
                new Date('2024-02-14T15:30:00')
            )
        ).toBe(true);
    });

    // Test case for current datetime outside the range
    it('returns false when current datetime is outside the range', () => {
        const startDateTime = new Date('2024-02-15T16:00:00');
        const endDateTime = new Date('2024-02-17T18:00:00');

        expect(
            isBetween(
                startDateTime,
                endDateTime,
                new Date('2024-02-14T20:30:00')
            )
        ).toBe(false);
    });

    // Add more test cases as needed
});
