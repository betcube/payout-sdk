# @betcube/payout-sdk

NestJS SDK for Payin-Payout payment system (Payout API).

The SDK handles XML protocol and RSA digital signatures internally. All communication is JSON-based from the consumer's perspective.

## Installation

```bash
npm install @betcube/payout-sdk
```

**Peer dependencies** (come with any NestJS project):

- `@nestjs/common` ^11.0.0
- `@nestjs/core` ^11.0.0
- `reflect-metadata`
- `rxjs` ^7.0.0

**Node.js >= 18** required (uses built-in `fetch`).

## Quick Start

### 1. Generate RSA keys

```bash
openssl rand -out random 1048576
openssl genrsa -out secret.key.pem -rand random 1024
openssl rsa -in secret.key.pem -pubout -outform DER -out public.key
openssl rsa -inform pem -in secret.key.pem -outform der -out secret.key
rm random secret.key.pem
```

Send `public.key` to Payin-Payout (`servicedesk@payin-payout.net`) to receive your Point ID. Keep `secret.key` private.

### 2. Register the module

**Static configuration:**

```typescript
import { Module } from '@nestjs/common'
import { readFileSync } from 'fs'
import { PayoutModule } from '@betcube/payout-sdk'

@Module({
	imports: [
		PayoutModule.forRoot({
			pointId: '12345',
			privateKey: readFileSync('keys/secret.key'),
			hashAlgorithm: 'sha256',
			sandbox: true,
		}),
	],
})
export class AppModule {}
```

**Async configuration (recommended for production):**

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { readFileSync } from 'fs'
import { PayoutModule } from '@betcube/payout-sdk'

@Module({
	imports: [
		ConfigModule.forRoot(),
		PayoutModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (config: ConfigService) => ({
				pointId: config.get('PAYOUT_POINT_ID'),
				privateKey: readFileSync(config.get('PAYOUT_KEY_PATH')),
				hashAlgorithm: 'sha256',
				sandbox: config.get('NODE_ENV') !== 'production',
			}),
			inject: [ConfigService],
		}),
	],
})
export class AppModule {}
```

### 3. Inject the service

```typescript
import { Injectable } from '@nestjs/common'
import { PayoutService } from '@betcube/payout-sdk'

@Injectable()
export class PaymentService {
	constructor(private readonly payout: PayoutService) {}

	async pay() {
		const result = await this.payout.createPayment({
			paymentId: 1001,
			serviceId: 1008,
			fields: { phone: '79161234567' },
			amount: 500,
			dateTime: '2026-02-07 14:30:00',
			comment: 'Mobile top-up',
		})

		console.log(result.uid) // e.g. "006064-000091"
		console.log(result.status) // 0 = processing
	}
}
```

## Configuration

| Option          | Type                          | Required | Default    | Description                                    |
| --------------- | ----------------------------- | -------- | ---------- | ---------------------------------------------- |
| `pointId`       | `string`                      | yes      | —          | Point ID (Amega-UserId)                        |
| `privateKey`    | `Buffer`                      | yes      | —          | RSA private key in DER format (PKCS#1)         |
| `hashAlgorithm` | `'md5' \| 'sha1' \| 'sha256'` | no       | `'sha256'` | Hash algorithm for RSA signing                 |
| `sandbox`       | `boolean`                     | no       | `false`    | Use test environment (`dev1.payin-payout.net`) |
| `baseUrl`       | `string`                      | no       | —          | Custom base URL (overrides `sandbox`)          |
| `timeout`       | `number`                      | no       | `30000`    | Request timeout in ms                          |

## API Methods

All methods are available through `PayoutService`. The SDK automatically builds XML requests, signs them with RSA, and parses XML responses into typed objects.

### getBalance

Get agent account balance.

```typescript
// Default — RUR only
const result = await this.payout.getBalance()
// result.balances: [{ currency: '643', amount: '10314.77' }]

// Specific currency
const usd = await this.payout.getBalance({ currency: PayoutCurrency.USD })

// All currencies
const all = await this.payout.getBalance({ currency: PayoutCurrency.ALL })
// all.balances: [
//   { currency: '643', amount: '10314.77' },
//   { currency: '840', amount: '500.00' },
//   { currency: '978', amount: '200.50' },
// ]
```

### getProviders

Get list of available payment providers.

```typescript
const providers = await this.payout.getProviders()

// providers: Provider[]
// Each provider includes:
//   id, shortName, fullName, minAmount, maxAmount,
//   fields (with validators), commissions, tags
```

### verifyPayment

Verify payment data before creating a payment. Checks that the account/phone is valid.

```typescript
const result = await this.payout.verifyPayment({
	paymentId: 1001,
	serviceId: 1008,
	fields: { phone: '79161234567' },
	amount: 100,
	currency: 643, // optional
})

// result.result — 0 = OK, 1 = checking, 2 = error
// result.state  — 0 = final, 1 = not final
// result.message — error description (on failure)
```

### createPayment

Create (execute) a payment.

```typescript
const result = await this.payout.createPayment({
	paymentId: 1001,
	serviceId: 1008,
	fields: { phone: '79161234567' },
	amount: 100,
	dateTime: '2026-02-07 14:30:00',
	comment: 'Mobile top-up',
	currency: 643, // optional
})

// result.uid    — system payment UID (e.g. "006064-000091")
// result.status — 0 = processing, 1 = success, 2 = failed
// result.result — 0 = no error, otherwise error code
```

Throws `PayoutApiError` when `result !== 0` and `status === 2` (terminal failure).

### getPaymentStatus

Check the current status of a previously created payment.

```typescript
const status = await this.payout.getPaymentStatus({
	uid: '006064-000091', // UID from createPayment
})

// status.status  — 0 = processing, 1 = success, 2 = failed
// status.result  — 0 = no error, otherwise error code
// status.message — status description
```

**Payment statuses:**

| Status | Meaning                | Final |
| ------ | ---------------------- | ----- |
| `0`    | Processing             | No    |
| `1`    | Successfully completed | Yes   |
| `2`    | Fatal error            | Yes   |

### getPrecheckStatus

Get precheck information for services with fixed denominations (e.g. worldwide mobile top-ups).

```typescript
const result = await this.payout.getPrecheckStatus({
	serviceId: 9999,
	phone: '+79234567890',
})

// result.country  — "Russia"
// result.operator — "Megafon-Siberia Russia"
// result.couponList: [
//   { cost: '1.22USD', charge: '1.10USD', value: '50RUB' },
//   { cost: '2.41USD', charge: '2.17USD', value: '100RUB' },
// ]
```

Use coupon data when calling `verifyPayment` / `createPayment` for these services.

## Constants

```typescript
import {
	PayoutCurrency,
	PayoutPaymentStatus,
	PayoutResult,
	PayoutErrorCode,
} from '@betcube/payout-sdk'

PayoutCurrency.RUR // 643
PayoutCurrency.USD // 840
PayoutCurrency.EUR // 978
PayoutCurrency.ALL // 'ALL'

PayoutPaymentStatus.PROCESSING // 0
PayoutPaymentStatus.SUCCESS // 1
PayoutPaymentStatus.FAILED // 2

PayoutResult.OK // 0
PayoutResult.CHECKING // 1
PayoutResult.ERROR // 2

PayoutErrorCode.INSUFFICIENT_FUNDS // 5
PayoutErrorCode.PAYMENT_NOT_FOUND // 116
PayoutErrorCode.DAILY_LIMIT_EXCEEDED // 135
// ... and 23 more error codes
```

## Error Handling

```typescript
import {
  PayoutError,          // base class
  PayoutApiError,       // API or HTTP error
  PayoutNetworkError,   // network/timeout
  PayoutXmlParseError,  // malformed XML response
} from '@betcube/payout-sdk';

try {
  await this.payout.createPayment({ ... });
} catch (error) {
  if (error instanceof PayoutApiError) {
    console.log(error.message);      // error text
    console.log(error.httpStatus);    // HTTP status code
    console.log(error.apiErrorCode);  // API error code (0–135)
    console.log(error.responseBody);  // raw XML response
  }
  if (error instanceof PayoutNetworkError) {
    console.log(error.cause);        // original Error
  }
}
```

## Environments

| Environment | URL                                    |
| ----------- | -------------------------------------- |
| Production  | `https://lk.payin-payout.net/api_out/` |
| Sandbox     | `https://dev1.payin-payout.net/`       |

**Sandbox rules:** even amounts succeed (if test balance is sufficient), odd amounts fail with an error.

## DateTime Format

The `dateTime` field in `createPayment` uses the format `YYYY-MM-dd HH:mm:ss` (24-hour, zero-padded).

Example: `2026-02-07 14:30:00`

## License

Private. For internal use only.
