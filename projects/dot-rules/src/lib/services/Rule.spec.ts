import { RuleService, RuleModel } from './Rule';
import { ApiRoot } from 'dotcms-js/dotcms-js';
import { UserModel } from 'dotcms-js/dotcms-js';

describe('Unit.api.rule-engine.Rule', () => {
    beforeEach(() => {});

    it('Isn\'t valid when new.', () => {
        const foo = new RuleModel({});
        expect(foo.isValid()).toEqual(false);
    });
});
