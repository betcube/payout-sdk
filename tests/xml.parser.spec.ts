import { describe, it, expect } from 'vitest';
import {
  parseXml,
  parseXmlResponse,
  parseBalanceResponse,
  parseProvidersResponse,
  parsePaymentResponse,
  parsePrecheckResponse,
} from '../src/core/xml.parser';
import { PayoutXmlParseError } from '../src/errors/payout.errors';

describe('parseXml', () => {
  it('parses a self-closing element', () => {
    const el = parseXml('<tag />');
    expect(el.tag).toBe('tag');
    expect(el.children).toHaveLength(0);
    expect(el.text).toBe('');
  });

  it('parses an element with attributes', () => {
    const el = parseXml('<tag id="123" name="test" />');
    expect(el.attributes).toEqual({ id: '123', name: 'test' });
  });

  it('parses nested elements with text', () => {
    const el = parseXml('<root><child>hello</child></root>');
    expect(el.tag).toBe('root');
    expect(el.children).toHaveLength(1);
    expect(el.children[0].tag).toBe('child');
    expect(el.children[0].text).toBe('hello');
  });

  it('unescapes XML entities', () => {
    const el = parseXml('<tag attr="a&amp;b">&lt;test&gt;</tag>');
    expect(el.attributes['attr']).toBe('a&b');
    expect(el.text).toBe('<test>');
  });

  it('strips XML declaration', () => {
    const el = parseXml(
      '<?xml version="1.0" encoding="UTF-8"?><root />',
    );
    expect(el.tag).toBe('root');
  });

  it('throws PayoutXmlParseError on invalid XML', () => {
    expect(() => parseXml('not xml at all')).toThrow(PayoutXmlParseError);
  });
});

describe('parseXmlResponse', () => {
  it('parses a success response with action', () => {
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<response id="Agents.getBalance" result="0">' +
      '<action><balance currency="643">10314.77</balance></action>' +
      '</response>';
    const res = parseXmlResponse(xml);
    expect(res.responseId).toBe('Agents.getBalance');
    expect(res.resultCode).toBe(0);
    expect(res.actionElement).toBeDefined();
  });

  it('parses an error response without action', () => {
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<response result="101" />';
    const res = parseXmlResponse(xml);
    expect(res.resultCode).toBe(101);
    expect(res.actionElement).toBeUndefined();
  });
});

describe('parseBalanceResponse', () => {
  it('parses single currency balance', () => {
    const xml =
      '<response id="Agents.getBalance" result="0">' +
      '<action><balance currency="643">10314.77</balance></action>' +
      '</response>';
    const { actionElement } = parseXmlResponse(xml);
    const balances = parseBalanceResponse(actionElement!);
    expect(balances).toEqual([{ currency: '643', amount: '10314.77' }]);
  });

  it('parses multi-currency balance (ALL)', () => {
    const xml =
      '<response id="Agents.getBalance" result="0">' +
      '<action>' +
      '<balance currency="643">10314.77</balance>' +
      '<balance currency="840">500.00</balance>' +
      '<balance currency="978">200.50</balance>' +
      '</action></response>';
    const { actionElement } = parseXmlResponse(xml);
    const balances = parseBalanceResponse(actionElement!);
    expect(balances).toHaveLength(3);
    expect(balances[0]).toEqual({ currency: '643', amount: '10314.77' });
    expect(balances[1]).toEqual({ currency: '840', amount: '500.00' });
    expect(balances[2]).toEqual({ currency: '978', amount: '200.50' });
  });
});

describe('parseProvidersResponse', () => {
  it('parses providers with fields, commissions, and tags', () => {
    const xml =
      '<response id="Payments.getProviders" result="0"><action>' +
      '<provider id="1008" shortName="MegaFon" fullName="MegaFon Mobile"' +
      ' minAmount="10" maxAmount="15000">' +
      '<fields>' +
      '<field name="phone" title="Phone" type="text" description="Enter phone">' +
      '<validator regexp="^[0-9]{10}$" />' +
      '</field>' +
      '</fields>' +
      '<commissions>' +
      '<commission currency="643" minAmount="10" maxAmount="15000">' +
      '<range from="0" type="0" value="1.5" />' +
      '</commission>' +
      '</commissions>' +
      '<tag_list><tag title="mobile" /></tag_list>' +
      '</provider>' +
      '</action></response>';

    const { actionElement } = parseXmlResponse(xml);
    const providers = parseProvidersResponse(actionElement!);

    expect(providers).toHaveLength(1);
    const p = providers[0];
    expect(p.id).toBe('1008');
    expect(p.shortName).toBe('MegaFon');
    expect(p.fullName).toBe('MegaFon Mobile');
    expect(p.minAmount).toBe('10');
    expect(p.maxAmount).toBe('15000');

    expect(p.fields).toHaveLength(1);
    expect(p.fields[0].name).toBe('phone');
    expect(p.fields[0].validator).toEqual({ regexp: '^[0-9]{10}$' });

    expect(p.commissions).toHaveLength(1);
    expect(p.commissions[0].currency).toBe('643');
    expect(p.commissions[0].ranges).toEqual([
      { from: '0', type: '0', value: '1.5' },
    ]);

    expect(p.tags).toEqual([{ title: 'mobile' }]);
  });

  it('parses provider with select-type field items', () => {
    const xml =
      '<response result="0"><action>' +
      '<provider id="2000" shortName="Test" fullName="Test Provider">' +
      '<fields>' +
      '<field name="type" title="Type" type="select">' +
      '<item key="a" label="Option A" />' +
      '<item key="b" label="Option B" />' +
      '</field>' +
      '</fields>' +
      '</provider>' +
      '</action></response>';

    const { actionElement } = parseXmlResponse(xml);
    const providers = parseProvidersResponse(actionElement!);
    const field = providers[0].fields[0];
    expect(field.type).toBe('select');
    expect(field.items).toEqual([
      { key: 'a', label: 'Option A' },
      { key: 'b', label: 'Option B' },
    ]);
  });
});

describe('parsePaymentResponse', () => {
  it('parses verifyPayment success', () => {
    const xml =
      '<response result="0"><action id="Payments.verifyPayment" result="0">' +
      '<payment id="10" result="0" state="0" />' +
      '</action></response>';
    const { actionElement } = parseXmlResponse(xml);
    const payment = parsePaymentResponse(actionElement!);
    expect(payment).toEqual({
      paymentId: '10',
      result: 0,
      status: undefined,
      state: 0,
      uid: undefined,
      message: undefined,
    });
  });

  it('parses verifyPayment error', () => {
    const xml =
      '<response result="0"><action id="Payments.verifyPayment" result="0">' +
      '<payment id="10" result="2" state="0" message="Invalid phone" />' +
      '</action></response>';
    const { actionElement } = parseXmlResponse(xml);
    const payment = parsePaymentResponse(actionElement!);
    expect(payment.result).toBe(2);
    expect(payment.message).toBe('Invalid phone');
  });

  it('parses createPayment success with uid', () => {
    const xml =
      '<response result="0"><action id="Payments.createPayment" result="0">' +
      '<payment id="10" result="0" status="0" uid="006064-000091" />' +
      '</action></response>';
    const { actionElement } = parseXmlResponse(xml);
    const payment = parsePaymentResponse(actionElement!);
    expect(payment.uid).toBe('006064-000091');
    expect(payment.status).toBe(0);
    expect(payment.result).toBe(0);
  });

  it('parses getPaymentStatus success', () => {
    const xml =
      '<response id="Agents.getPaymentStatus" result="0"><action>' +
      '<payment uid="006064-000091" result="0" status="1" message="Payment successful" />' +
      '</action></response>';
    const { actionElement } = parseXmlResponse(xml);
    const payment = parsePaymentResponse(actionElement!);
    expect(payment.uid).toBe('006064-000091');
    expect(payment.status).toBe(1);
    expect(payment.message).toBe('Payment successful');
  });

  it('handles action-level error when no payment element', () => {
    const xml =
      '<response result="0"><action id="Payments.createPayment" result="115" message="Payment exists" />' +
      '</response>';
    const { actionElement } = parseXmlResponse(xml);
    const payment = parsePaymentResponse(actionElement!);
    expect(payment.result).toBe(115);
    expect(payment.message).toBe('Payment exists');
  });
});

describe('parsePrecheckResponse', () => {
  it('parses precheck with coupons', () => {
    const xml =
      '<response id="Agents.getPrecheckStatus" result="0"><action>' +
      '<country>Russia</country>' +
      '<operator>Megafon-Siberia Russia</operator>' +
      '<coupon_list>' +
      '<coupon cost="1.22USD" charge="1.10USD">50RUB</coupon>' +
      '<coupon cost="2.41USD" charge="2.17USD">100RUB</coupon>' +
      '</coupon_list>' +
      '</action></response>';

    const { actionElement } = parseXmlResponse(xml);
    const result = parsePrecheckResponse(actionElement!);

    expect(result.country).toBe('Russia');
    expect(result.operator).toBe('Megafon-Siberia Russia');
    expect(result.couponList).toHaveLength(2);
    expect(result.couponList[0]).toEqual({
      cost: '1.22USD',
      charge: '1.10USD',
      value: '50RUB',
    });
    expect(result.couponList[1]).toEqual({
      cost: '2.41USD',
      charge: '2.17USD',
      value: '100RUB',
    });
  });

  it('returns empty couponList when no coupons', () => {
    const xml =
      '<response result="0"><action>' +
      '<country>Test</country>' +
      '</action></response>';
    const { actionElement } = parseXmlResponse(xml);
    const result = parsePrecheckResponse(actionElement!);
    expect(result.couponList).toEqual([]);
  });
});
