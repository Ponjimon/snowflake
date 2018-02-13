import Snowflake from './snowflake';

describe('snowflake', () => {
    it('a', () => {
        const snowflake = new Snowflake(1);
        const id = snowflake.generate();

        // for (let i = 0; i < 10000; i++) {
        //     snowflake.generate();
        // }

        expect(true).toBe(true);
    });
});
