"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildGetBalanceXml = buildGetBalanceXml;
exports.buildGetProvidersXml = buildGetProvidersXml;
exports.buildVerifyPaymentXml = buildVerifyPaymentXml;
exports.buildCreatePaymentXml = buildCreatePaymentXml;
exports.buildGetPaymentStatusXml = buildGetPaymentStatusXml;
exports.buildGetPrecheckStatusXml = buildGetPrecheckStatusXml;
const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
function escapeXml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
function wrapAction(actionId, content) {
    if (content) {
        return `${XML_HEADER}<request><action id="${actionId}">${content}</action></request>`;
    }
    return `${XML_HEADER}<request><action id="${actionId}" /></request>`;
}
function buildGetBalanceXml(currency) {
    const content = currency !== undefined
        ? `<currency>${escapeXml(String(currency))}</currency>`
        : '';
    return wrapAction('Agents.getBalance', content);
}
function buildGetProvidersXml() {
    return wrapAction('Payments.getProviders', '');
}
function buildVerifyPaymentXml(params) {
    let fieldsXml = '<fields>';
    for (const [key, val] of Object.entries(params.fields)) {
        fieldsXml += `<${key}>${escapeXml(val)}</${key}>`;
    }
    fieldsXml += '</fields>';
    const currencyXml = params.currency !== undefined
        ? `<currency>${params.currency}</currency>`
        : '';
    const content = `<payment id="${escapeXml(String(params.paymentId))}">` +
        `<serviceId>${params.serviceId}</serviceId>` +
        fieldsXml +
        `<amount>${params.amount}</amount>` +
        currencyXml +
        `</payment>`;
    return wrapAction('Payments.verifyPayment', content);
}
function buildCreatePaymentXml(params) {
    let fieldsXml = '<fields>';
    for (const [key, val] of Object.entries(params.fields)) {
        fieldsXml += `<${key}>${escapeXml(val)}</${key}>`;
    }
    fieldsXml += '</fields>';
    const currencyXml = params.currency !== undefined
        ? `<currency>${params.currency}</currency>`
        : '';
    const content = `<payment id="${escapeXml(String(params.paymentId))}">` +
        `<serviceId>${params.serviceId}</serviceId>` +
        fieldsXml +
        `<amount>${params.amount}</amount>` +
        `<dateTime>${escapeXml(params.dateTime)}</dateTime>` +
        `<comment>${escapeXml(params.comment)}</comment>` +
        currencyXml +
        `</payment>`;
    return wrapAction('Payments.createPayment', content);
}
function buildGetPaymentStatusXml(uid) {
    const content = `<payment uid="${escapeXml(uid)}" />`;
    return wrapAction('Payments.getPaymentStatus', content);
}
function buildGetPrecheckStatusXml(serviceId, phone) {
    const content = `<tocheck phone="${escapeXml(phone)}" service="${serviceId}" />`;
    return wrapAction('Payments.getPrecheckStatus', content);
}
//# sourceMappingURL=xml.builder.js.map