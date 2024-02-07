export function testingConfig() {
    if (process.env.NODE_ENV !== 'test') return;
    process.env.PORT = '0';
}
