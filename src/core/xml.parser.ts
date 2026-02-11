import { PayoutXmlParseError } from '../errors/payout.errors';
import type { BalanceEntry } from '../interfaces/balance.interface';
import type {
  Provider,
  ProviderField,
  ProviderFieldSelectItem,
  ProviderCommission,
  CommissionRange,
  ProviderTag,
} from '../interfaces/provider.interface';
import type { PrecheckCoupon } from '../interfaces/precheck.interface';

// ─── Low-level XML parser ───────────────────────────────────────────────────

export interface XmlElement {
  tag: string;
  attributes: Record<string, string>;
  children: XmlElement[];
  text: string;
}

/**
 * Minimal XML parser for the subset used by Payout API responses.
 * Handles: elements with attributes, self-closing tags, text content, nesting.
 * Does NOT handle: namespaces, CDATA, comments, processing instructions.
 */
export function parseXml(xml: string): XmlElement {
  const stripped = xml.replace(/<\?xml[^?]*\?>\s*/, '');
  const result = parseElement(stripped.trim(), 0);
  return result.element;
}

interface ParseResult {
  element: XmlElement;
  endIndex: number;
}

function parseElement(xml: string, pos: number): ParseResult {
  if (xml[pos] !== '<') {
    throw new PayoutXmlParseError(
      `Expected '<' at position ${pos}`,
      xml,
    );
  }

  // Parse opening tag
  const tagEnd = xml.indexOf('>', pos);
  if (tagEnd === -1) {
    throw new PayoutXmlParseError('Unclosed tag', xml);
  }

  const tagContent = xml.slice(pos + 1, tagEnd);
  const selfClosing = tagContent.endsWith('/');
  const cleanTagContent = selfClosing
    ? tagContent.slice(0, -1).trim()
    : tagContent.trim();

  const spaceIdx = cleanTagContent.indexOf(' ');
  const tag =
    spaceIdx === -1 ? cleanTagContent : cleanTagContent.slice(0, spaceIdx);
  const attrString =
    spaceIdx === -1 ? '' : cleanTagContent.slice(spaceIdx + 1);
  const attributes = parseAttributes(attrString);

  if (selfClosing) {
    return {
      element: { tag, attributes, children: [], text: '' },
      endIndex: tagEnd + 1,
    };
  }

  // Parse children and text content
  const children: XmlElement[] = [];
  let text = '';
  let cursor = tagEnd + 1;

  while (cursor < xml.length) {
    // Check for closing tag
    if (xml.startsWith(`</${tag}`, cursor)) {
      const closeEnd = xml.indexOf('>', cursor);
      return {
        element: { tag, attributes, children, text: text.trim() },
        endIndex: closeEnd + 1,
      };
    }

    // Check for child element
    if (xml[cursor] === '<') {
      const child = parseElement(xml, cursor);
      children.push(child.element);
      cursor = child.endIndex;
    } else {
      // Text content
      const nextTag = xml.indexOf('<', cursor);
      if (nextTag === -1) {
        throw new PayoutXmlParseError(
          'Unexpected end of XML',
          xml,
        );
      }
      text += unescapeXml(xml.slice(cursor, nextTag));
      cursor = nextTag;
    }
  }

  throw new PayoutXmlParseError(
    `Missing closing tag for <${tag}>`,
    xml,
  );
}

function parseAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const regex = /([a-zA-Z_][\w.-]*)\s*=\s*"([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(attrString)) !== null) {
    attrs[match[1]] = unescapeXml(match[2]);
  }
  return attrs;
}

function unescapeXml(str: string): string {
  return str
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}

// ─── High-level response parser ─────────────────────────────────────────────

export interface XmlResponse {
  responseId: string;
  resultCode: number;
  message?: string;
  actionElement?: XmlElement;
}

export function parseXmlResponse(xml: string): XmlResponse {
  const root = parseXml(xml);

  const responseId = root.attributes['id'] ?? '';
  const resultCode = parseInt(root.attributes['result'] ?? '0', 10);
  const message = root.attributes['message'];

  const actionEl = root.children.find((c) => c.tag === 'action');

  return { responseId, resultCode, message, actionElement: actionEl };
}

// ─── Typed response parsers ─────────────────────────────────────────────────

export function parseBalanceResponse(action: XmlElement): BalanceEntry[] {
  return action.children
    .filter((c) => c.tag === 'balance')
    .map((c) => ({
      currency: c.attributes['currency'] ?? '643',
      amount: c.text,
    }));
}

export function parseProvidersResponse(action: XmlElement): Provider[] {
  return action.children
    .filter((c) => c.tag === 'provider')
    .map((p) => ({
      id: p.attributes['id'] ?? '',
      groupId: p.attributes['groupId'],
      fullName: p.attributes['fullName'] ?? '',
      shortName: p.attributes['shortName'] ?? '',
      minAmount: p.attributes['minAmount'],
      maxAmount: p.attributes['maxAmount'],
      icon: p.attributes['icon'],
      iconHires: p.attributes['icon_hires'],
      fields: parseFields(p),
      commissions: parseCommissions(p),
      tags: parseTags(p),
    }));
}

function parseFields(provider: XmlElement): ProviderField[] {
  const fieldsEl = provider.children.find((c) => c.tag === 'fields');
  if (!fieldsEl) return [];

  return fieldsEl.children
    .filter((c) => c.tag === 'field')
    .map((f) => {
      const field: ProviderField = {
        name: f.attributes['name'] ?? '',
        title: f.attributes['title'] ?? '',
        type: f.attributes['type'] ?? 'text',
        description: f.attributes['description'],
      };

      const validatorEl = f.children.find((c) => c.tag === 'validator');
      if (validatorEl) {
        field.validator = { regexp: validatorEl.attributes['regexp'] ?? '' };
      }

      const items = f.children
        .filter((c) => c.tag === 'item')
        .map(
          (item): ProviderFieldSelectItem => ({
            key: item.attributes['key'] ?? '',
            label: item.attributes['label'] ?? item.text,
          }),
        );
      if (items.length > 0) {
        field.items = items;
      }

      return field;
    });
}

function parseCommissions(provider: XmlElement): ProviderCommission[] {
  const commissionsEl = provider.children.find(
    (c) => c.tag === 'commissions',
  );
  if (!commissionsEl) return [];

  return commissionsEl.children
    .filter((c) => c.tag === 'commission')
    .map((comm) => {
      const ranges: CommissionRange[] = comm.children
        .filter((c) => c.tag === 'range')
        .map((r) => ({
          from: r.attributes['from'] ?? '0',
          type: r.attributes['type'] ?? '0',
          value: r.attributes['value'] ?? '0',
        }));

      return {
        currency: comm.attributes['currency'],
        minAmount: comm.attributes['minAmount'],
        maxAmount: comm.attributes['maxAmount'],
        ranges,
      };
    });
}

function parseTags(provider: XmlElement): ProviderTag[] {
  const tagListEl = provider.children.find((c) => c.tag === 'tag_list');
  if (!tagListEl) return [];

  return tagListEl.children
    .filter((c) => c.tag === 'tag')
    .map((t) => ({ title: t.attributes['title'] ?? t.text }));
}

export function parsePaymentResponse(action: XmlElement): {
  paymentId?: string;
  result: number;
  status?: number;
  state?: number;
  uid?: string;
  message?: string;
} {
  const paymentEl = action.children.find((c) => c.tag === 'payment');
  if (!paymentEl) {
    return {
      result: parseInt(action.attributes['result'] ?? '0', 10),
      message: action.attributes['message'],
    };
  }

  return {
    paymentId: paymentEl.attributes['id'],
    result: parseInt(paymentEl.attributes['result'] ?? '0', 10),
    status:
      paymentEl.attributes['status'] !== undefined
        ? parseInt(paymentEl.attributes['status'], 10)
        : undefined,
    state:
      paymentEl.attributes['state'] !== undefined
        ? parseInt(paymentEl.attributes['state'], 10)
        : undefined,
    uid: paymentEl.attributes['uid'],
    message: paymentEl.attributes['message'],
  };
}

export function parsePrecheckResponse(action: XmlElement): {
  country?: string;
  operator?: string;
  couponList: PrecheckCoupon[];
} {
  const country = action.children.find((c) => c.tag === 'country')?.text;
  const operator = action.children.find((c) => c.tag === 'operator')?.text;
  const couponListEl = action.children.find((c) => c.tag === 'coupon_list');

  const couponList = (couponListEl?.children ?? [])
    .filter((c) => c.tag === 'coupon')
    .map((c) => ({
      cost: c.attributes['cost'] ?? '',
      charge: c.attributes['charge'] ?? '',
      value: c.text,
    }));

  return { country, operator, couponList };
}
