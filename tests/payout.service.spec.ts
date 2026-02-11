import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayoutService } from '../src/payout.service';
import { PayoutHttpClient } from '../src/core/http.client';
import type { XmlResponse, XmlElement } from '../src/core/xml.parser';
import { PayoutApiError } from '../src/errors/payout.errors';

function makeAction(children: XmlElement[]): XmlElement {
  return { tag: 'action', attributes: {}, children, text: '' };
}

function makePayment(attrs: Record<string, string>): XmlElement {
  return { tag: 'payment', attributes: attrs, children: [], text: '' };
}

function createMockHttpClient(): PayoutHttpClient {
  return { postXml: vi.fn() } as unknown as PayoutHttpClient;
}

describe('PayoutService', () => {
  let service: PayoutService;
  let http: PayoutHttpClient;

  beforeEach(() => {
    http = createMockHttpClient();
    service = new PayoutService(http);
  });

  describe('getBalance', () => {
    it('calls postXml with correct XML and returns parsed balances', async () => {
      const action = makeAction([
        {
          tag: 'balance',
          attributes: { currency: '643' },
          children: [],
          text: '10314.77',
        },
      ]);
      vi.mocked(http.postXml).mockResolvedValue({
        responseId: 'Agents.getBalance',
        resultCode: 0,
        actionElement: action,
      });

      const result = await service.getBalance();

      expect(http.postXml).toHaveBeenCalledOnce();
      const xmlArg = vi.mocked(http.postXml).mock.calls[0][0];
      expect(xmlArg).toContain('Agents.getBalance');
      expect(result.balances).toEqual([
        { currency: '643', amount: '10314.77' },
      ]);
    });

    it('passes currency parameter when provided', async () => {
      const action = makeAction([
        {
          tag: 'balance',
          attributes: { currency: '840' },
          children: [],
          text: '500.00',
        },
      ]);
      vi.mocked(http.postXml).mockResolvedValue({
        responseId: 'Agents.getBalance',
        resultCode: 0,
        actionElement: action,
      });

      await service.getBalance({ currency: 840 });

      const xmlArg = vi.mocked(http.postXml).mock.calls[0][0];
      expect(xmlArg).toContain('<currency>840</currency>');
    });
  });

  describe('getProviders', () => {
    it('calls postXml and returns provider array', async () => {
      const action = makeAction([
        {
          tag: 'provider',
          attributes: {
            id: '1008',
            shortName: 'MegaFon',
            fullName: 'MegaFon Mobile',
          },
          children: [],
          text: '',
        },
      ]);
      vi.mocked(http.postXml).mockResolvedValue({
        responseId: 'Payments.getProviders',
        resultCode: 0,
        actionElement: action,
      });

      const result = await service.getProviders();

      const xmlArg = vi.mocked(http.postXml).mock.calls[0][0];
      expect(xmlArg).toContain('Payments.getProviders');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1008');
      expect(result[0].shortName).toBe('MegaFon');
    });
  });

  describe('verifyPayment', () => {
    it('builds correct XML with fields and returns parsed result', async () => {
      const action = makeAction([
        makePayment({ id: '10', result: '0', state: '0' }),
      ]);
      vi.mocked(http.postXml).mockResolvedValue({
        responseId: '',
        resultCode: 0,
        actionElement: action,
      });

      const result = await service.verifyPayment({
        paymentId: 10,
        serviceId: 1008,
        fields: { phone: '9237500001' },
        amount: 20,
      });

      const xmlArg = vi.mocked(http.postXml).mock.calls[0][0];
      expect(xmlArg).toContain('Payments.verifyPayment');
      expect(xmlArg).toContain('<serviceId>1008</serviceId>');
      expect(xmlArg).toContain('<phone>9237500001</phone>');
      expect(xmlArg).toContain('<amount>20</amount>');
      expect(result.result).toBe(0);
      expect(result.state).toBe(0);
    });
  });

  describe('createPayment', () => {
    it('builds correct XML and returns uid on success', async () => {
      const action = makeAction([
        makePayment({
          id: '10',
          result: '0',
          status: '0',
          uid: '006064-000091',
        }),
      ]);
      vi.mocked(http.postXml).mockResolvedValue({
        responseId: '',
        resultCode: 0,
        actionElement: action,
      });

      const result = await service.createPayment({
        paymentId: 10,
        serviceId: 1008,
        fields: { phone: '9237500001' },
        amount: 20,
        dateTime: '2024-01-01 12:00:00',
        comment: 'test payment',
      });

      const xmlArg = vi.mocked(http.postXml).mock.calls[0][0];
      expect(xmlArg).toContain('Payments.createPayment');
      expect(xmlArg).toContain('<dateTime>2024-01-01 12:00:00</dateTime>');
      expect(xmlArg).toContain('<comment>test payment</comment>');
      expect(result.uid).toBe('006064-000091');
      expect(result.status).toBe(0);
    });

    it('throws PayoutApiError on terminal failure (status=2)', async () => {
      const action = makeAction([
        makePayment({
          id: '10',
          result: '2',
          status: '2',
          message: 'Invalid phone',
        }),
      ]);
      vi.mocked(http.postXml).mockResolvedValue({
        responseId: '',
        resultCode: 0,
        actionElement: action,
      });

      await expect(
        service.createPayment({
          paymentId: 10,
          serviceId: 1008,
          fields: { phone: 'bad' },
          amount: 20,
          dateTime: '2024-01-01 12:00:00',
          comment: 'test',
        }),
      ).rejects.toThrow(PayoutApiError);
    });
  });

  describe('getPaymentStatus', () => {
    it('builds correct XML with uid and returns status', async () => {
      const action = makeAction([
        makePayment({
          uid: '006064-000091',
          result: '0',
          status: '1',
          message: 'Payment successful',
        }),
      ]);
      vi.mocked(http.postXml).mockResolvedValue({
        responseId: '',
        resultCode: 0,
        actionElement: action,
      });

      const result = await service.getPaymentStatus({
        uid: '006064-000091',
      });

      const xmlArg = vi.mocked(http.postXml).mock.calls[0][0];
      expect(xmlArg).toContain('Payments.getPaymentStatus');
      expect(xmlArg).toContain('uid="006064-000091"');
      expect(result.status).toBe(1);
      expect(result.message).toBe('Payment successful');
    });
  });

  describe('getPrecheckStatus', () => {
    it('builds correct XML and returns coupon list', async () => {
      const action: XmlElement = {
        tag: 'action',
        attributes: {},
        children: [
          { tag: 'country', attributes: {}, children: [], text: 'Russia' },
          {
            tag: 'operator',
            attributes: {},
            children: [],
            text: 'Megafon',
          },
          {
            tag: 'coupon_list',
            attributes: {},
            children: [
              {
                tag: 'coupon',
                attributes: { cost: '1.22USD', charge: '1.10USD' },
                children: [],
                text: '50RUB',
              },
            ],
            text: '',
          },
        ],
        text: '',
      };
      vi.mocked(http.postXml).mockResolvedValue({
        responseId: '',
        resultCode: 0,
        actionElement: action,
      });

      const result = await service.getPrecheckStatus({
        serviceId: 9999,
        phone: '+79234567890',
      });

      const xmlArg = vi.mocked(http.postXml).mock.calls[0][0];
      expect(xmlArg).toContain('Payments.getPrecheckStatus');
      expect(xmlArg).toContain('phone="+79234567890"');
      expect(xmlArg).toContain('service="9999"');
      expect(result.country).toBe('Russia');
      expect(result.couponList).toHaveLength(1);
      expect(result.couponList[0].value).toBe('50RUB');
    });
  });
});
