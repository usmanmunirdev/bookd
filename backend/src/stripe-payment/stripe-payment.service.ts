import { Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class StripePaymentService {
    private stripe: Stripe;

    constructor(
        private configService: ConfigService,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {
        const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY');

        if (!stripeSecret) {
            throw new Error('STRIPE_SECRET_KEY is not defined');
        }

        this.stripe = new Stripe(stripeSecret, {
            apiVersion: '2025-08-27.basil',
        });
    }

    async createSetupIntent(userId: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Ensure customer exists
        if (!user.stripeCustomerId) {
            const customer = await this.stripe.customers.create({
                email: user.email,
                metadata: { userId: user.id },
            });
            user.stripeCustomerId = customer.id;
            await this.userRepo.save(user);
        }

        const setupIntent = await this.stripe.setupIntents.create({
            customer: user.stripeCustomerId,
            usage: 'off_session', // 🔑 REQUIRED for auto charge
        });

        return {
            clientSecret: setupIntent.client_secret,
        };
    }

    async addPaymentMethod(userId: string, paymentMethodId: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // 🔒 Ensure Stripe customer exists
        if (!user.stripeCustomerId) {
            const customer = await this.stripe.customers.create({
                email: user.email,
                metadata: { userId: user.id },
            });

            user.stripeCustomerId = customer.id;
            await this.userRepo.save(user);
        }

        // ⛔ TypeScript now KNOWS this is a string
        const customerId = user.stripeCustomerId;

        // Detach old method (optional)
        if (user.paymentMethodId) {
            try {
                await this.stripe.paymentMethods.detach(user.paymentMethodId);
            } catch { }
        }

        // ✅ Attach payment method
        await this.stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });

        // Set as default
        await this.stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        const pm = await this.stripe.paymentMethods.retrieve(paymentMethodId);

        user.paymentMethodId = paymentMethodId;
        user.last4 = pm.card?.last4 ?? null;
        await this.userRepo.save(user);

        return {
            message: 'Payment method saved',
            paymentMethodId,
            last4: pm.card?.last4,
        };
    }

    // async addPaymentMethod(userId: string, cardToken: string) {
    //     try {
    //         if (!cardToken) {
    //             throw new Error('Card token is required');
    //         }

    //         // Fetch user
    //         const user = await this.userRepo.findOne({ where: { id: userId } });
    //         if (!user) throw new NotFoundException('User not found');

    //         // Create Stripe customer if not exists
    //         if (!user.stripeCustomerId) {
    //             const customer = await this.stripe.customers.create({
    //                 email: user.email,
    //                 metadata: { userId: user.id },
    //             });
    //             user.stripeCustomerId = customer.id;
    //         }

    //         // If user already has a payment method, detach it
    //         if (user.paymentMethodId) {
    //             try {
    //                 await this.stripe.paymentMethods.detach(user.paymentMethodId);
    //             } catch (err) {
    //                 console.warn('Failed to detach old payment method:', err);
    //             }
    //         }

    //         // Create a PaymentMethod from the card token
    //         const paymentMethod = await this.stripe.paymentMethods.create({
    //             type: 'card',
    //             card: { token: cardToken },
    //         });

    //         // Attach the PaymentMethod to the customer
    //         await this.stripe.paymentMethods.attach(paymentMethod.id, {
    //             customer: user.stripeCustomerId,
    //         });

    //         // Set as default payment method for invoices
    //         await this.stripe.customers.update(user.stripeCustomerId, {
    //             invoice_settings: {
    //                 default_payment_method: paymentMethod.id,
    //             },
    //         });

    //         // Save new payment method info in DB
    //         user.paymentMethodId = paymentMethod.id;
    //         user.last4 = paymentMethod.card?.last4 || null;
    //         await this.userRepo.save(user);

    //         return {
    //             message: 'Payment method added/updated successfully',
    //             paymentMethodId: paymentMethod.id,
    //             last4: paymentMethod.card?.last4,
    //         };
    //     } catch (error) {
    //         console.error('Error adding/updating payment method:', error);
    //         throw new Error(
    //             error instanceof Error ? error.message : 'Failed to add/update payment method'
    //         );
    //     }
    // }

    async listPaymentMethods(userId: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user || !user.stripeCustomerId)
            throw new NotFoundException('User not found or no Stripe customer');

        const methods = await this.stripe.paymentMethods.list({
            customer: user.stripeCustomerId,
            type: 'card',
        });

        return methods.data.map((m) => ({
            id: m.id,
            brand: m.card?.brand,
            last4: m.card?.last4,
            expMonth: m.card?.exp_month,
            expYear: m.card?.exp_year,
        }));
    }
}
