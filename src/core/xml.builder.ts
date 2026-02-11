const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapAction(actionId: string, content: string): string {
  if (content) {
    return `${XML_HEADER}<request><action id="${actionId}">${content}</action></request>`;
  }
  return `${XML_HEADER}<request><action id="${actionId}" /></request>`;
}

export function buildGetBalanceXml(currency?: number | string): string {
  const content =
    currency !== undefined
      ? `<currency>${escapeXml(String(currency))}</currency>`
      : '';
  return wrapAction('Agents.getBalance', content);
}

export function buildGetProvidersXml(): string {
  return wrapAction('Payments.getProviders', '');
}

export function buildVerifyPaymentXml(params: {
  paymentId: string | number;
  serviceId: number;
  fields: Record<string, string>;
  amount: number;
  currency?: number;
}): string {
  let fieldsXml = '<fields>';
  for (const [key, val] of Object.entries(params.fields)) {
    fieldsXml += `<${key}>${escapeXml(val)}</${key}>`;
  }
  fieldsXml += '</fields>';

  const currencyXml =
    params.currency !== undefined
      ? `<currency>${params.currency}</currency>`
      : '';

  const content =
    `<payment id="${escapeXml(String(params.paymentId))}">` +
    `<serviceId>${params.serviceId}</serviceId>` +
    fieldsXml +
    `<amount>${params.amount}</amount>` +
    currencyXml +
    `</payment>`;

  return wrapAction('Payments.verifyPayment', content);
}

export function buildCreatePaymentXml(params: {
  paymentId: string | number;
  serviceId: number;
  fields: Record<string, string>;
  amount: number;
  dateTime: string;
  comment: string;
  currency?: number;
}): string {
  let fieldsXml = '<fields>';
  for (const [key, val] of Object.entries(params.fields)) {
    fieldsXml += `<${key}>${escapeXml(val)}</${key}>`;
  }
  fieldsXml += '</fields>';

  const currencyXml =
    params.currency !== undefined
      ? `<currency>${params.currency}</currency>`
      : '';

  const content =
    `<payment id="${escapeXml(String(params.paymentId))}">` +
    `<serviceId>${params.serviceId}</serviceId>` +
    fieldsXml +
    `<amount>${params.amount}</amount>` +
    `<dateTime>${escapeXml(params.dateTime)}</dateTime>` +
    `<comment>${escapeXml(params.comment)}</comment>` +
    currencyXml +
    `</payment>`;

  return wrapAction('Payments.createPayment', content);
}

export function buildGetPaymentStatusXml(uid: string): string {
  const content = `<payment uid="${escapeXml(uid)}" />`;
  return wrapAction('Payments.getPaymentStatus', content);
}

export function buildGetPrecheckStatusXml(
  serviceId: number,
  phone: string,
): string {
  const content = `<tocheck phone="${escapeXml(phone)}" service="${serviceId}" />`;
  return wrapAction('Payments.getPrecheckStatus', content);
}
