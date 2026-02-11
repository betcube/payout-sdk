"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseXml = parseXml;
exports.parseXmlResponse = parseXmlResponse;
exports.parseBalanceResponse = parseBalanceResponse;
exports.parseProvidersResponse = parseProvidersResponse;
exports.parsePaymentResponse = parsePaymentResponse;
exports.parsePrecheckResponse = parsePrecheckResponse;
const payout_errors_1 = require("../errors/payout.errors");
/**
 * Minimal XML parser for the subset used by Payout API responses.
 * Handles: elements with attributes, self-closing tags, text content, nesting.
 * Does NOT handle: namespaces, CDATA, comments, processing instructions.
 */
function parseXml(xml) {
    const stripped = xml.replace(/<\?xml[^?]*\?>\s*/, '');
    const result = parseElement(stripped.trim(), 0);
    return result.element;
}
function parseElement(xml, pos) {
    if (xml[pos] !== '<') {
        throw new payout_errors_1.PayoutXmlParseError(`Expected '<' at position ${pos}`, xml);
    }
    // Parse opening tag
    const tagEnd = xml.indexOf('>', pos);
    if (tagEnd === -1) {
        throw new payout_errors_1.PayoutXmlParseError('Unclosed tag', xml);
    }
    const tagContent = xml.slice(pos + 1, tagEnd);
    const selfClosing = tagContent.endsWith('/');
    const cleanTagContent = selfClosing
        ? tagContent.slice(0, -1).trim()
        : tagContent.trim();
    const spaceIdx = cleanTagContent.indexOf(' ');
    const tag = spaceIdx === -1 ? cleanTagContent : cleanTagContent.slice(0, spaceIdx);
    const attrString = spaceIdx === -1 ? '' : cleanTagContent.slice(spaceIdx + 1);
    const attributes = parseAttributes(attrString);
    if (selfClosing) {
        return {
            element: { tag, attributes, children: [], text: '' },
            endIndex: tagEnd + 1,
        };
    }
    // Parse children and text content
    const children = [];
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
        }
        else {
            // Text content
            const nextTag = xml.indexOf('<', cursor);
            if (nextTag === -1) {
                throw new payout_errors_1.PayoutXmlParseError('Unexpected end of XML', xml);
            }
            text += unescapeXml(xml.slice(cursor, nextTag));
            cursor = nextTag;
        }
    }
    throw new payout_errors_1.PayoutXmlParseError(`Missing closing tag for <${tag}>`, xml);
}
function parseAttributes(attrString) {
    const attrs = {};
    const regex = /([a-zA-Z_][\w.-]*)\s*=\s*"([^"]*)"/g;
    let match;
    while ((match = regex.exec(attrString)) !== null) {
        attrs[match[1]] = unescapeXml(match[2]);
    }
    return attrs;
}
function unescapeXml(str) {
    return str
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');
}
function parseXmlResponse(xml) {
    const root = parseXml(xml);
    const responseId = root.attributes['id'] ?? '';
    const resultCode = parseInt(root.attributes['result'] ?? '0', 10);
    const message = root.attributes['message'];
    const actionEl = root.children.find((c) => c.tag === 'action');
    return { responseId, resultCode, message, actionElement: actionEl };
}
// ─── Typed response parsers ─────────────────────────────────────────────────
function parseBalanceResponse(action) {
    return action.children
        .filter((c) => c.tag === 'balance')
        .map((c) => ({
        currency: c.attributes['currency'] ?? '643',
        amount: c.text,
    }));
}
function parseProvidersResponse(action) {
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
function parseFields(provider) {
    const fieldsEl = provider.children.find((c) => c.tag === 'fields');
    if (!fieldsEl)
        return [];
    return fieldsEl.children
        .filter((c) => c.tag === 'field')
        .map((f) => {
        const field = {
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
            .map((item) => ({
            key: item.attributes['key'] ?? '',
            label: item.attributes['label'] ?? item.text,
        }));
        if (items.length > 0) {
            field.items = items;
        }
        return field;
    });
}
function parseCommissions(provider) {
    const commissionsEl = provider.children.find((c) => c.tag === 'commissions');
    if (!commissionsEl)
        return [];
    return commissionsEl.children
        .filter((c) => c.tag === 'commission')
        .map((comm) => {
        const ranges = comm.children
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
function parseTags(provider) {
    const tagListEl = provider.children.find((c) => c.tag === 'tag_list');
    if (!tagListEl)
        return [];
    return tagListEl.children
        .filter((c) => c.tag === 'tag')
        .map((t) => ({ title: t.attributes['title'] ?? t.text }));
}
function parsePaymentResponse(action) {
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
        status: paymentEl.attributes['status'] !== undefined
            ? parseInt(paymentEl.attributes['status'], 10)
            : undefined,
        state: paymentEl.attributes['state'] !== undefined
            ? parseInt(paymentEl.attributes['state'], 10)
            : undefined,
        uid: paymentEl.attributes['uid'],
        message: paymentEl.attributes['message'],
    };
}
function parsePrecheckResponse(action) {
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
//# sourceMappingURL=xml.parser.js.map