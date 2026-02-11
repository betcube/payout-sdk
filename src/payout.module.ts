import { Module, DynamicModule, Provider } from '@nestjs/common';
import { PAYOUT_MODULE_OPTIONS } from './payout.constants';
import type {
  PayoutModuleOptions,
  PayoutModuleAsyncOptions,
} from './interfaces/payout-module-options.interface';
import { PayoutService } from './payout.service';
import { PayoutHttpClient } from './core/http.client';

@Module({})
export class PayoutModule {
  static forRoot(options: PayoutModuleOptions): DynamicModule {
    return {
      module: PayoutModule,
      global: true,
      providers: [
        {
          provide: PAYOUT_MODULE_OPTIONS,
          useValue: options,
        },
        PayoutHttpClient,
        PayoutService,
      ],
      exports: [PayoutService],
    };
  }

  static forRootAsync(options: PayoutModuleAsyncOptions): DynamicModule {
    const asyncProvider: Provider = {
      provide: PAYOUT_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: PayoutModule,
      global: true,
      imports: options.imports || [],
      providers: [asyncProvider, PayoutHttpClient, PayoutService],
      exports: [PayoutService],
    };
  }
}
