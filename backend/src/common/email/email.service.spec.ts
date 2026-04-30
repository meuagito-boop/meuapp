import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

function createConfigService(values: Record<string, string | undefined>) {
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

describe('EmailService', () => {
  it('returns a configuration error when the provider is disabled', async () => {
    const service = new EmailService(
      createConfigService({
        EMAIL_PROVIDER: 'none',
      })
    );

    const result = await service.send({
      to: 'user@example.com',
      subject: 'Teste',
      text: 'Ola',
    });

    expect(result).toEqual({
      success: false,
      error: 'Email provider not configured',
    });
  });

  it('sends transactional email through SES when configured', async () => {
    const service = new EmailService(
      createConfigService({
        EMAIL_PROVIDER: 'ses',
        AWS_SES_REGION: 'sa-east-1',
        AWS_SES_FROM_EMAIL: 'noreply@meuagito.com',
      })
    );

    const send = jest.fn().mockResolvedValue({
      MessageId: 'ses-message-1',
    });
    (service as { sesClient: { send: typeof send } | null }).sesClient = { send };

    const result = await service.send({
      to: 'user@example.com',
      subject: 'Teste',
      text: 'Ola',
    });

    expect(result).toEqual({
      success: true,
      messageId: 'ses-message-1',
    });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('returns delivery failure details when SES rejects the message', async () => {
    const service = new EmailService(
      createConfigService({
        EMAIL_PROVIDER: 'ses',
        AWS_SES_REGION: 'sa-east-1',
        AWS_SES_FROM_EMAIL: 'noreply@meuagito.com',
      })
    );

    const send = jest.fn().mockRejectedValue(new Error('SES sandbox rejection'));
    (service as { sesClient: { send: typeof send } | null }).sesClient = { send };

    const result = await service.send({
      to: 'user@example.com',
      subject: 'Teste',
      text: 'Ola',
    });

    expect(result).toEqual({
      success: false,
      error: 'SES sandbox rejection',
    });
  });
});
