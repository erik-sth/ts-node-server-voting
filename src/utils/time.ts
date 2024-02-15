export function isBetween(
    startDateTime: Date,
    endDateTime: Date,
    isBetweenDay: Date
): boolean {
    // Check if the current datetime is between start and end datetime (inclusive)
    return (
        isBetweenDay.valueOf() >= startDateTime.valueOf() &&
        isBetweenDay.valueOf() <= endDateTime.valueOf()
    );
}
