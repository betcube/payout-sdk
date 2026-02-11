"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PayoutModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutModule = void 0;
const common_1 = require("@nestjs/common");
const payout_constants_1 = require("./payout.constants");
const payout_service_1 = require("./payout.service");
const http_client_1 = require("./core/http.client");
let PayoutModule = PayoutModule_1 = class PayoutModule {
    static forRoot(options) {
        return {
            module: PayoutModule_1,
            global: true,
            providers: [
                {
                    provide: payout_constants_1.PAYOUT_MODULE_OPTIONS,
                    useValue: options,
                },
                http_client_1.PayoutHttpClient,
                payout_service_1.PayoutService,
            ],
            exports: [payout_service_1.PayoutService],
        };
    }
    static forRootAsync(options) {
        const asyncProvider = {
            provide: payout_constants_1.PAYOUT_MODULE_OPTIONS,
            useFactory: options.useFactory,
            inject: options.inject || [],
        };
        return {
            module: PayoutModule_1,
            global: true,
            imports: options.imports || [],
            providers: [asyncProvider, http_client_1.PayoutHttpClient, payout_service_1.PayoutService],
            exports: [payout_service_1.PayoutService],
        };
    }
};
exports.PayoutModule = PayoutModule;
exports.PayoutModule = PayoutModule = PayoutModule_1 = __decorate([
    (0, common_1.Module)({})
], PayoutModule);
//# sourceMappingURL=payout.module.js.map