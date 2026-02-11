import { describe, it, expect } from 'vitest';
import {
  buildGetBalanceXml,
  buildGetProvidersXml,
  buildVerifyPaymentXml,
  buildCreatePaymentXml,
  buildGetPaymentStatusXml,
  buildGetPrecheckStatusXml,
} from '../src/core/xml.builder';

describe('xml.builder', () => {
  describe('buildGetBalanceXml', () => {
    it('builds XML without currency (default RUR)', () => {
      const xml = buildGetBalanceXml();
      expect(xml).toBe(
        '<?xml version="1.0" encoding="UTF-8"?><request><action id="Agents.getBalance" /></request>',
      );
    });

    it('builds XML with specific currency', () => {
      const xml = buildGetBalanceXml(840);
      expect(xml).toContain('<currency>840</currency>');
      expect(xml).toContain('id="Agents.getBalance"');
    });

    it('builds XML with ALL currency', () => {
      const xml = buildGetBalanceXml('ALL');
      expect(xml).toContain('<currency>ALL</currency>');
    });
  });

  describe('buildGetProvidersXml', () => {
    it('builds self-closing action', () => {
      const xml = buildGetProvidersXml();
      expect(xml).toBe(
        '<?xml version="1.0" encoding="UTF-8"?><request><action id="Payments.getProviders" /></request>',
      );
    });
  });

  describe('buildVerifyPaymentXml', () => {
    it('builds XML with fields and amount', () => {
      const xml = buildVerifyPaymentXml({
        paymentId: 10,
        serviceId: 1008,
        fields: { phone: '9237500001' },
        amount: 20,
      });
      expect(xml).toContain('id="Payments.verifyPayment"');
      expect(xml).toContain('<payment id="10">');
      expect(xml).toContain('<serviceId>1008</serviceId>');
      expect(xml).toContain('<phone>9237500001</phone>');
      expect(xml).toContain('<amount>20</amount>');
      expect(xml).not.toContain('<currency>');
    });

    it('includes optional currency', () => {
      const xml = buildVerifyPaymentXml({
        paymentId: 10,
        serviceId: 1008,
        fields: { phone: '9237500001' },
        amount: 20,
        currency: 840,
      });
      expect(xml).toContain('<currency>840</currency>');
    });
  });

  describe('buildCreatePaymentXml', () => {
    it('builds XML with all required fields', () => {
      const xml = buildCreatePaymentXml({
        paymentId: 10,
        serviceId: 1008,
        fields: { phone: '9237500001' },
        amount: 20,
        dateTime: '2014-09-24 14:06:06',
        comment: 'pay',
      });
      expect(xml).toContain('id="Payments.createPayment"');
      expect(xml).toContain('<payment id="10">');
      expect(xml).toContain('<serviceId>1008</serviceId>');
      expect(xml).toContain('<amount>20</amount>');
      expect(xml).toContain('<dateTime>2014-09-24 14:06:06</dateTime>');
      expect(xml).toContain('<comment>pay</comment>');
    });

    it('escapes special XML characters in comment', () => {
      const xml = buildCreatePaymentXml({
        paymentId: 1,
        serviceId: 100,
        fields: { phone: '123' },
        amount: 10,
        dateTime: '2024-01-01 00:00:00',
        comment: 'test <script>&amp;',
      });
      expect(xml).toContain(
        '<comment>test &lt;script&gt;&amp;amp;</comment>',
      );
    });
  });

  describe('buildGetPaymentStatusXml', () => {
    it('builds XML with uid attribute', () => {
      const xml = buildGetPaymentStatusXml('006064-000091');
      expect(xml).toContain('id="Payments.getPaymentStatus"');
      expect(xml).toContain('<payment uid="006064-000091" />');
    });
  });

  describe('buildGetPrecheckStatusXml', () => {
    it('builds XML with phone and service attributes', () => {
      const xml = buildGetPrecheckStatusXml(9999, '+79234567890');
      expect(xml).toContain('id="Payments.getPrecheckStatus"');
      expect(xml).toContain(
        '<tocheck phone="+79234567890" service="9999" />',
      );
    });
  });
});
