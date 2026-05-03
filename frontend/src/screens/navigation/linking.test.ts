import { navigationLinking } from './linking';

describe('navigationLinking', () => {
  it('registers app scheme and email auth paths', () => {
    expect(navigationLinking.prefixes).toContain('meuagito://');
    expect(navigationLinking.config?.screens).toEqual(
      expect.objectContaining({
        VerifyEmail: 'verify-email',
        ForgotPassword: 'reset-password',
      })
    );
  });
});
