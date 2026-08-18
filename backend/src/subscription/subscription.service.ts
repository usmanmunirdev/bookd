import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Subscription } from './entities/subscription.entity';
import { User } from 'src/user/entities/user.entity';
import { Plan } from 'src/plans/entities/plan.entity';
import { SubscriptionPayment } from './entities/subscription-payment.entity';
import { GetSubscriptionPaymentsDto } from "./dto/get-subscription-payments.dto";

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private stripe: Stripe;

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
    @InjectRepository(SubscriptionPayment)
    private readonly paymentRepo: Repository<SubscriptionPayment>,

    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY')!,
      { apiVersion: '2025-08-27.basil' },
    );
  }

  /**
   * 🆕 Create initial free subscription on user signup
   */
  async createInitialSubscription(userId: string): Promise<Subscription> {
    try {
      const freePlan = await this.planRepo.findOne({
        where: { price: 0 },
      });

      if (!freePlan) {
        throw new InternalServerErrorException('Free plan not configured');
      }

      const subscription = this.subscriptionRepo.create({
        userId,
        planId: freePlan.id,
        status: 'active',
        stripeSubscriptionId: null,
        stripePriceId: null,
        pendingPlanId: null,
        pendingStripePriceId: null,
        cancelAtPeriodEnd: false,
      });

      await this.subscriptionRepo.save(subscription);
      this.logger.log(`Initial free subscription created for user ${userId}`);

      return subscription;
    } catch (error) {
      this.logger.error('Failed to create initial subscription', error);
      throw error;
    }
  }

  /**
   * 📦 Create or update subscription (handles upgrades/downgrades)
   */
  async createSubscription(userId: string, planId: string) {
    try {
      // 1️⃣ Validate user
      const user = await this.userRepo.findOne({
        where: { id: userId },
      });
      if (!user) throw new NotFoundException('User not found');

      if (!user.stripeCustomerId || !user.paymentMethodId) {
        return {
          success: false,
          code: 'PAYMENT_METHOD_REQUIRED',
          message: 'Please add a payment method first',
        };
      }

      // 2️⃣ Validate plan
      const plan = await this.planRepo.findOne({
        where: { id: planId },
      });
      if (!plan || !plan.stripePriceId) {
        throw new BadRequestException('Plan is not billable');
      }

      // 3️⃣ Get existing subscription (if any)
      let subscription = await this.subscriptionRepo.findOne({
        where: { userId: user.id },
        relations: ['plan'],
      });

      if (!subscription) {
        throw new NotFoundException('Subscription not found. Please contact support.');
      }

      // Don't allow switching to the same plan
      if (subscription.planId === planId) {
        return {
          success: false,
          code: 'SAME_PLAN',
          message: 'You are already on this plan',
        };
      }

      const isExistingSub = !!subscription.stripeSubscriptionId;
      const currentPlanPrice = subscription.plan?.price || 0;

      // 4️⃣ Detect upgrade / downgrade
      const planPrice = Number(plan.price);
      const currentPrice = Number(currentPlanPrice);

      const isUpgrade = planPrice > currentPrice;
      const isDowngrade = planPrice < currentPrice;


      let stripeSub: any;

      this.logger.log('Creating/updating subscription:', {
        isExistingSub,
        isUpgrade,
        isDowngrade,
        currentPlan: subscription.plan,
        newPlan: plan,
      });

      // 5️⃣ Handle different scenarios
      if (!isExistingSub && plan.price > 0) {
        // 🆕 FREE → PAID: Create new Stripe subscription
        stripeSub = await this.stripe.subscriptions.create({
          customer: user.stripeCustomerId,
          default_payment_method: user.paymentMethodId,
          items: [{ price: plan.stripePriceId }],
          metadata: {
            userId: user.id,
            planId: plan.id,
          },
          expand: ['latest_invoice.payment_intent'],
        });

        subscription.stripeSubscriptionId = stripeSub.id;
        subscription.pendingPlanId = plan.id;
        subscription.pendingStripePriceId = plan.stripePriceId;
        subscription.status = 'pending';

      } else if (isExistingSub && isUpgrade) {
        // ⬆️ UPGRADE: Apply immediately with prorations
        const currentSub = await this.stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId!,
        );

        this.logger.log(`Current subscription: ${currentSub.id}, status: ${currentSub.status}`);

        // 🔓 Check if subscription is managed by a schedule (from previous downgrade)
        let scheduleId: string | null = null;

        if (typeof currentSub.schedule === 'string') {
          scheduleId = currentSub.schedule;
        } else if (currentSub.schedule && typeof currentSub.schedule === 'object') {
          scheduleId = currentSub.schedule.id;
        }

        // If subscription has a schedule, release it first
        if (scheduleId) {
          this.logger.log(`Releasing subscription schedule ${scheduleId} for upgrade`);

          await this.stripe.subscriptionSchedules.release(scheduleId, {
            preserve_cancel_date: false,
          });

          this.logger.log(`Schedule ${scheduleId} released successfully`);
        }

        // Now update the subscription with immediate proration
        // stripeSub = await this.stripe.subscriptions.update(
        //   subscription.stripeSubscriptionId!,
        //   {
        //     items: [
        //       {
        //         id: currentSub.items.data[0].id,
        //         price: plan.stripePriceId,
        //       },
        //     ],
        //     proration_behavior: 'create_prorations',
        //     billing_cycle_anchor: 'unchanged',
        //     cancel_at_period_end: false,
        //     payment_behavior: 'error_if_incomplete',
        //     expand: ['latest_invoice.payment_intent'],
        //     metadata: {
        //       userId: user.id,
        //       pendingPlanId: plan.id,
        //       changeType: 'upgrade',
        //     },
        //   },
        // );
        stripeSub = await this.stripe.subscriptions.update(
          subscription.stripeSubscriptionId!,
          {
            items: [
              {
                id: currentSub.items.data[0].id,
                price: plan.stripePriceId,
              },
            ],
            proration_behavior: 'always_invoice',
            billing_cycle_anchor: 'unchanged',
            cancel_at_period_end: false,
            expand: ['latest_invoice.payment_intent'],
            metadata: {
              userId: user.id,
              pendingPlanId: plan.id,
              changeType: 'upgrade',
            },
          },
        );

        this.logger.log(`Upgrade completed. Latest invoice: ${stripeSub.latest_invoice}`);

        subscription.pendingPlanId = plan.id;
        subscription.pendingStripePriceId = plan.stripePriceId;
        subscription.status = stripeSub.status as any;
        subscription.canceledAt = null;
        subscription.cancelAtPeriodEnd = false;

      } else if (isExistingSub && isDowngrade && plan.price > 0) {

        await this.stripe.subscriptions.update(
          subscription.stripeSubscriptionId!,
          { cancel_at_period_end: false },
        );

        // ⬇️ DOWNGRADE: Schedule for next billing period (no charge)
        const currentSub: any = await this.stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId!,
        );

        // Check if there's already a schedule
        let scheduleId: string | null = null;

        if (typeof currentSub.schedule === 'string') {
          scheduleId = currentSub.schedule;
        } else if (currentSub.schedule && typeof currentSub.schedule === 'object') {
          scheduleId = currentSub.schedule.id;
        }

        if (scheduleId) {
          // Update existing schedule
          this.logger.log(`Updating existing schedule ${scheduleId}`);

          await this.stripe.subscriptionSchedules.update(scheduleId, {
            phases: [
              {
                items: [
                  {
                    price: currentSub.items.data[0].price.id,
                    quantity: 1,
                  },
                ],
                start_date: currentSub.current_period_start,
                end_date: currentSub.current_period_end,
              },
              {
                items: [
                  {
                    price: plan.stripePriceId,
                    quantity: 1,
                  },
                ],
                start_date: currentSub.current_period_end,
              },
            ],
            end_behavior: 'release',
            metadata: {
              userId: user.id,
              planId: plan.id,
              changeType: 'downgrade',
            },
          });
        } else {
          // Create new schedule for downgrade
          const schedule = await this.stripe.subscriptionSchedules.create({
            from_subscription: subscription.stripeSubscriptionId!,
          });

          await this.stripe.subscriptionSchedules.update(schedule.id, {
            phases: [
              {
                items: [
                  {
                    price: currentSub.items.data[0].price.id,
                    quantity: 1,
                  },
                ],
                start_date: currentSub.current_period_start,
                end_date: currentSub.current_period_end,
              },
              {
                items: [
                  {
                    price: plan.stripePriceId,
                    quantity: 1,
                  },
                ],
                start_date: currentSub.current_period_end,
              },
            ],
            end_behavior: 'release',
            metadata: {
              userId: user.id,
              planId: plan.id,
              changeType: 'downgrade',
            },
          });
        }

        stripeSub = currentSub;

        // Mark downgrade as pending
        subscription.pendingPlanId = plan.id;
        subscription.pendingStripePriceId = plan.stripePriceId;
        subscription.status = 'active';
      } else if (isExistingSub && isDowngrade && plan.price <= 0) {
        await this.cancelSubscription(user.id);
      }

      // 6️⃣ Handle 3DS / payment action required (ONLY for upgrades / new subs)
      let paymentIntent: Stripe.PaymentIntent | undefined;

      if (isUpgrade || !isExistingSub) {
        const invoice = stripeSub?.latest_invoice as any;
        paymentIntent = invoice?.payment_intent;
      }

      if (paymentIntent?.status === 'requires_action') {
        await this.subscriptionRepo.save(subscription);
        return {
          success: false,
          code: 'PAYMENT_ACTION_REQUIRED',
          clientSecret: paymentIntent.client_secret,
          subscriptionId: subscription.id,
        };
      }

      // 7️⃣ Save subscription
      await this.subscriptionRepo.save(subscription);

      return {
        success: true,
        status: subscription.status,
        subscriptionId: subscription.id,
        changeType: isUpgrade ? 'upgrade' : isDowngrade ? 'downgrade' : 'new',
        message: isUpgrade
          ? 'Plan upgraded successfully. You will be charged a prorated amount.'
          : isDowngrade
            ? 'Plan downgrade scheduled for next billing cycle'
            : 'Subscription created successfully',
        currentPeriodEnd: stripeSub.current_period_end
          ? new Date(stripeSub.current_period_end * 1000)
          : null,
      };
    } catch (error) {
      this.logger.error('Create subscription failed', error);

      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to create or update subscription',
      );
    }
  }

  /**
   * ❌ Cancel subscription (downgrade to free at period end)
   */
  async cancelSubscription(userId: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const subscription = await this.subscriptionRepo.findOne({
        where: { userId: user.id },
      });

      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new BadRequestException('No active subscription found');
      }

      const freePlan = await this.planRepo.findOne({
        where: { price: 0 },
      });

      if (!freePlan) {
        throw new InternalServerErrorException('Free plan not configured');
      }

      // Cancel at period end in Stripe
      const stripeSub: any = await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
          metadata: {
            userId: user.id,
            action: 'cancel_by_user',
            downgradeToPlanId: freePlan.id,
          },
        },
      );

      // Update local DB
      subscription.pendingPlanId = freePlan.id;
      subscription.pendingStripePriceId = null;
      subscription.cancelAtPeriodEnd = true;
      subscription.canceledAt = new Date();
      subscription.status = 'active'; // Still active until period ends
      subscription.currentPeriodEnd = stripeSub.current_period_end
        ? new Date(stripeSub.current_period_end * 1000)
        : subscription.currentPeriodEnd;

      await this.subscriptionRepo.save(subscription);

      return {
        success: true,
        message:
          'Subscription will be canceled at the end of the current billing period',
        currentPeriodEnd: subscription.currentPeriodEnd,
      };
    } catch (err) {
      this.logger.error('Cancel subscription failed', err);

      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  /**
   * 🔄 Reactivate a canceled subscription
   */
  async reactivateSubscription(userId: string) {
    try {
      const subscription = await this.subscriptionRepo.findOne({
        where: { userId },
        relations: ['plan'],
      });

      if (!subscription?.stripeSubscriptionId) {
        throw new BadRequestException('No subscription found');
      }

      if (!subscription.cancelAtPeriodEnd) {
        throw new BadRequestException(
          'Subscription is not scheduled for cancellation',
        );
      }

      // 1️⃣ Retrieve Stripe subscription
      const stripeSub = await this.stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
      );

      // 2️⃣ If a subscription schedule exists (from downgrade), RELEASE it
      if (stripeSub.schedule) {
        const scheduleId =
          typeof stripeSub.schedule === 'string'
            ? stripeSub.schedule
            : stripeSub.schedule.id;

        this.logger.log(
          `Releasing subscription schedule ${scheduleId} during reactivation`,
        );

        await this.stripe.subscriptionSchedules.release(scheduleId, {
          preserve_cancel_date: false,
        });
      }

      // 3️⃣ Reactivate subscription in Stripe
      await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: false,
          metadata: {
            userId,
            action: 'reactivated_by_user',
          },
        },
      );

      // 4️⃣ Update local DB
      subscription.cancelAtPeriodEnd = false;
      subscription.pendingPlanId = null;
      subscription.pendingStripePriceId = null;
      subscription.canceledAt = null; // cancel request cleared
      subscription.status = 'active';

      await this.subscriptionRepo.save(subscription);

      return {
        success: true,
        message: 'Subscription reactivated successfully',
      };
    } catch (err) {
      this.logger.error('Reactivate subscription failed', err);

      if (err instanceof BadRequestException) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Failed to reactivate subscription',
      );
    }
  }

  /**
   * 📊 Get user's current subscription details
   */
  async getSubscription(userId: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId },
      relations: ['plan'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Get pending plan details if exists
    let pendingPlan: any = null;
    if (subscription.pendingPlanId) {
      pendingPlan = await this.planRepo.findOne({
        where: { id: subscription.pendingPlanId },
      });
    }

    return {
      id: subscription.id,
      status: subscription.status,
      currentPlan: subscription.plan,
      pendingPlan,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      canceledAt: subscription.canceledAt,
    };
  }

  /**
   * 🎣 Handle Stripe webhooks
   */
  async handleWebhook(event: Stripe.Event) {
    this.logger.log(`Received Stripe event: ${event.type}`);

    try {
      switch (event.type) {
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(
            event.data.object as any,
          );
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(
            event.data.object as any,
          );
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(
            event.data.object as any,
          );
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(
            event.data.object as any,
          );
          break;

        default:
          this.logger.log(`Unhandled Stripe event: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Webhook handler failed for ${event.type}`, error);
      throw error;
    }
  }

  // ==================== WEBHOOK HANDLERS ====================

  private async handleSubscriptionUpdated(stripeSub: any) {
    this.logger.log(`Subscription updated: ${stripeSub.id}`);
    await this.syncSubscriptionStatus(stripeSub);
  }

  private async handleSubscriptionDeleted(stripeSub: any) {
    this.logger.log(`Subscription deleted: ${stripeSub.id}`);

    const subscription = await this.subscriptionRepo.findOne({
      where: { stripeSubscriptionId: stripeSub.id },
    });

    if (!subscription) {
      this.logger.warn(
        `Local subscription not found for Stripe ID: ${stripeSub.id}`,
      );
      return;
    }

    // Downgrade to free plan
    const freePlan = await this.planRepo.findOne({ where: { price: 0 } });

    if (freePlan) {
      subscription.plan = freePlan;
      subscription.planId = freePlan.id;
    }

    subscription.stripeSubscriptionId = null;
    subscription.stripePriceId = null;
    subscription.pendingPlanId = null;
    subscription.pendingStripePriceId = null;
    subscription.status = 'active';

    await this.subscriptionRepo.save(subscription);
    this.logger.log(`Subscription ${subscription.id} downgraded to free plan`);
  }

  private async handleInvoicePaymentSucceeded(invoice: any) {
    try {
      this.logger.log(`Invoice payment succeeded: ${invoice.id}`);

      const stripeSubId =
        typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice?.parent?.subscription_details?.subscription;

      if (!stripeSubId) {
        this.logger.warn('Invoice has no subscription');
        return;
      }

      const subscription = await this.subscriptionRepo.findOne({
        where: { stripeSubscriptionId: stripeSubId },
        relations: ['user'],
      });

      if (!subscription) {
        this.logger.warn(`Subscription not found for Stripe ID: ${stripeSubId}`);
        return;
      }

      this.logger.log(
        `Processing payment for subscription ${subscription.id}, pending plan: ${subscription.pendingPlanId}`,
      );

      // 🔍 Extract metadata from the correct location
      const metadata =
        invoice.parent?.subscription_details?.metadata ||
        invoice.lines?.data?.[0]?.metadata ||
        {};

      const metadataPlanId = metadata.planId;

      this.logger.log(
        `Metadata found: userId=${metadata.userId}, planId=${metadataPlanId}`,
      );

      // ✅ Confirm pending plan change (upgrade or new subscription)
      const planIdToActivate =
        subscription.pendingPlanId || metadataPlanId;

      if (planIdToActivate) {
        const plan: any = await this.planRepo.findOne({
          where: { id: planIdToActivate },
        });

        if (plan) {
          this.logger.log(
            `Activating plan ${plan.id} (${plan.title}) for subscription ${subscription.id}`,
          );

          subscription.planId = plan.id;
          subscription.plan = plan;
          subscription.stripePriceId = plan.stripePriceId;
          subscription.pendingPlanId = null;
          subscription.pendingStripePriceId = null;
        } else {
          this.logger.warn(`Plan ${planIdToActivate} not found in database`);
        }
      }

      // 📅 Extract correct billing period from line items
      const lineItem = invoice.lines?.data?.[0];
      const periodStart = lineItem?.period?.start || invoice.period_start;
      const periodEnd = lineItem?.period?.end || invoice.period_end;

      subscription.status = 'active';
      subscription.currentPeriodStart = periodStart
        ? new Date(periodStart * 1000)
        : subscription.currentPeriodStart;
      subscription.currentPeriodEnd = periodEnd
        ? new Date(periodEnd * 1000)
        : subscription.currentPeriodEnd;

      await this.subscriptionRepo.save(subscription);

      this.logger.log(
        `✅ Subscription ${subscription.id} activated | Plan: ${subscription.planId} | Period: ${subscription.currentPeriodStart?.toISOString()} → ${subscription.currentPeriodEnd?.toISOString()}`,
      );

      // 💾 Save successful payment record
      await this.savePaymentRecord(subscription, invoice, true);

    } catch (error) {
      this.logger.error(
        `❌ Error handling invoice.payment_succeeded for invoice ${invoice?.id}`,
        error?.stack || error,
      );
    }
  }

  private async handleInvoicePaymentFailed(invoice: any) {
    try {
      this.logger.warn(`Invoice payment failed: ${invoice.id}`);

      const stripeSubId =
        typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice?.parent?.subscription_details?.subscription;

      if (!stripeSubId) {
        this.logger.warn('Invoice has no subscription ID');
        return;
      }

      const subscription = await this.subscriptionRepo.findOne({
        where: { stripeSubscriptionId: stripeSubId },
        relations: ['user'],
      });

      if (!subscription) {
        this.logger.warn(`Subscription not found for Stripe ID: ${stripeSubId}`);
        return;
      }

      // Update subscription status
      subscription.status = 'past_due';
      await this.subscriptionRepo.save(subscription);

      this.logger.warn(`Subscription marked past_due: ${stripeSubId}`);

      // 🔍 Extract failure details
      const paymentIntent = invoice.payment_intent;
      let failureReason = 'Payment failed';
      let failureCode: any = null;

      if (paymentIntent) {
        // If payment_intent is an object, get last_payment_error
        if (typeof paymentIntent === 'object' && paymentIntent.last_payment_error) {
          failureReason = paymentIntent.last_payment_error.message || failureReason;
          failureCode = paymentIntent.last_payment_error.code || null;
        } else if (typeof paymentIntent === 'string') {
          // If it's just an ID, fetch the full object
          try {
            const pi = await this.stripe.paymentIntents.retrieve(paymentIntent);
            if (pi.last_payment_error) {
              failureReason = pi.last_payment_error.message || failureReason;
              failureCode = pi.last_payment_error.code || null;
            }
          } catch (err) {
            this.logger.warn(`Could not retrieve payment intent: ${paymentIntent}`);
          }
        }
      }

      // 💾 Save failed payment record
      await this.savePaymentRecord(
        subscription,
        invoice,
        false,
        failureReason,
        failureCode,
      );

    } catch (error) {
      this.logger.error(
        `❌ Error handling invoice.payment_failed for invoice ${invoice?.id}`,
        error?.stack || error,
      );
    }
  }

  /**
   * 🔄 Sync subscription status from Stripe
   */
  private async syncSubscriptionStatus(stripeSub: any) {
    try {
      if (!stripeSub?.id) {
        this.logger.warn('Stripe subscription object missing id');
        return;
      }

      this.logger.log(`Syncing subscription status for Stripe ID: ${stripeSub.id}`);

      const subscription = await this.subscriptionRepo.findOne({
        where: { stripeSubscriptionId: stripeSub.id },
      });

      if (!subscription) {
        this.logger.warn(
          `Local subscription not found for Stripe ID: ${stripeSub.id}`,
        );
        return;
      }

      // Update basic fields
      subscription.status = stripeSub.status as any;
      subscription.cancelAtPeriodEnd = stripeSub.cancel_at_period_end;

      if (stripeSub.current_period_start) {
        subscription.currentPeriodStart = new Date(
          stripeSub.current_period_start * 1000,
        );
      }

      if (stripeSub.current_period_end) {
        subscription.currentPeriodEnd = new Date(
          stripeSub.current_period_end * 1000,
        );
      }

      // Handle cancellation
      if (stripeSub.cancel_at_period_end) {
        subscription.canceledAt = subscription.canceledAt ?? new Date();
      } else {
        // Reactivated
        if (subscription.canceledAt) {
          subscription.canceledAt = null;
          subscription.pendingPlanId = null;
        }
      }

      // Handle ended/canceled subscriptions
      if (stripeSub.status === 'canceled' || stripeSub.status === 'unpaid') {
        const freePlan = await this.planRepo.findOne({ where: { price: 0 } });

        if (freePlan) {
          subscription.planId = freePlan.id;
        }

        subscription.stripeSubscriptionId = null;
        subscription.stripePriceId = null;
        subscription.pendingPlanId = null;
        subscription.pendingStripePriceId = null;
      }

      await this.subscriptionRepo.save(subscription);

      this.logger.log(
        `✅ Subscription synced | stripe=${stripeSub.id} | status=${stripeSub.status} | plan=${subscription.planId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to sync subscription ${stripeSub?.id}`, error);
    }
  }

  async getPayments(dto: GetSubscriptionPaymentsDto & { isSuccess?: any }) {
    try {
      const {
        userId,
        startDate,
        endDate,
        page = 1,
        limit = 10,
        isSuccess,
        search,
      } = dto;

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
          throw new BadRequestException(
            'startDate cannot be greater than endDate',
          );
        }
      }

      const qb = this.paymentRepo
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.user', 'user')
        .leftJoinAndSelect('payment.subscription', 'subscription')
        .leftJoinAndSelect('subscription.plan', 'plan')
        .orderBy('payment.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      // 🎯 Filter by user
      if (userId) {
        qb.andWhere('user.id = :userId', { userId });
      }

      if (isSuccess === "true" || isSuccess === "false") {
        qb.andWhere("payment.isSuccess = :isSuccess", {
          isSuccess: isSuccess === "true",
        });
      }

      // 🔍 Search filter by user name or email
      if (search?.trim()) {
        const s = `%${search.trim()}%`;
        qb.andWhere(
          new Brackets((sub) => {
            sub
              .where('user.fullName ILIKE :s', { s })
              .orWhere('user.firstName ILIKE :s', { s })
              .orWhere('user.lastName ILIKE :s', { s })
              .orWhere('user.email ILIKE :s', { s });
          }),
        );
      }

      // 📅 Date range filter
      if (startDate) {
        qb.andWhere('payment.createdAt >= :startDate', {
          startDate: new Date(startDate),
        });
      }

      if (endDate) {
        qb.andWhere('payment.createdAt <= :endDate', {
          endDate: new Date(endDate),
        });
      }

      const [data, total] = await qb.getManyAndCount();

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          showing: data.length,
          currentPage: page,
        },
      };
    } catch (error) {
      this.logger.error(
        'Failed to fetch subscription payments',
        error?.stack || error,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Unable to fetch subscription payments',
      );
    }
  }

  /**
   * 📝 Extract payment details from invoice (helper)
   */
  private extractPaymentDetailsFromInvoice(invoice: any) {
    const lineItem = invoice.lines?.data?.[0];
    const periodStart = lineItem?.period?.start || invoice.period_start;
    const periodEnd = lineItem?.period?.end || invoice.period_end;

    const paymentIntentId =
      typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent
        : invoice.payment_intent?.id;

    const chargeId = invoice.charge;
    const amountPaid = invoice.amount_paid || 0;
    const amountDue = invoice.amount_due || 0;
    const currency = invoice.currency || 'usd';

    return {
      paymentIntentId,
      chargeId,
      amountPaid,
      amountDue,
      currency,
      periodStart: periodStart ? new Date(periodStart * 1000) : null,
      periodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    };
  }

  /**
   * 💾 Create or update payment record (helper)
   */
  private async savePaymentRecord(
    subscription: Subscription,
    invoice: any,
    isSuccess: boolean,
    failureReason?: string,
    failureCode?: any,
  ) {
    try {
      const paymentDetails = this.extractPaymentDetailsFromInvoice(invoice);

      // Check if payment already exists
      let payment = await this.paymentRepo.findOne({
        where: { stripeInvoiceId: invoice.id },
      });

      if (payment) {
        // Update existing payment
        this.logger.log(`Updating existing payment for invoice ${invoice.id}`);

        payment.status = invoice.status;
        payment.amountPaid = paymentDetails.amountPaid;
        payment.isSuccess = isSuccess;
        payment.attemptCount += 1;

        if (!isSuccess) {
          payment.failureReason = failureReason || null;
          payment.failureCode = failureCode || null;
        } else {
          // Clear failure details on success
          payment.failureReason = null;
          payment.failureCode = null;
        }
      } else {
        // Create new payment
        this.logger.log(`Creating new payment for invoice ${invoice.id}`);

        payment = new SubscriptionPayment();
        payment.stripeInvoiceId = invoice.id;
        payment.stripePaymentIntentId = paymentDetails.paymentIntentId;
        payment.stripeChargeId = paymentDetails.chargeId;
        payment.subscription = subscription;
        payment.user = subscription.user;
        payment.amountPaid = paymentDetails.amountPaid;
        payment.amountDue = paymentDetails.amountDue;
        payment.currency = paymentDetails.currency;
        payment.status = invoice.status;
        payment.periodStart = paymentDetails.periodStart;
        payment.periodEnd = paymentDetails.periodEnd;
        payment.isSuccess = isSuccess;
        payment.attemptCount = 1;
        payment.failureReason = failureReason || null;
        payment.failureCode = failureCode || null;
      }

      await this.paymentRepo.save(payment);

      this.logger.log(
        `💾 Payment ${isSuccess ? 'SUCCESS' : 'FAILED'} | Invoice: ${invoice.id} | Amount: ${paymentDetails.amountPaid} ${paymentDetails.currency} | Attempts: ${payment.attemptCount}`,
      );

      return payment;
    } catch (error) {
      this.logger.error(
        `Failed to save payment record for invoice ${invoice?.id}`,
        error?.stack || error,
      );
      throw error;
    }
  }
}