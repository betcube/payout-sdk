import { DynamicModule } from '@nestjs/common';
import type { PayoutModuleOptions, PayoutModuleAsyncOptions } from './interfaces/payout-module-options.interface';
export declare class PayoutModule {
    static forRoot(options: PayoutModuleOptions): DynamicModule;
    static forRootAsync(options: PayoutModuleAsyncOptions): DynamicModule;
}
//# sourceMappingURL=payout.module.d.ts.map