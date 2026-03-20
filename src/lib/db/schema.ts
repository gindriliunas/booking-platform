import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const questionTypeEnum = pgEnum("question_type", [
  "text",
  "textarea",
  "yes_no",
  "multiple_choice",
  "dropdown",
]);

export const questionnaireResponseStatusEnum = pgEnum("questionnaire_response_status", [
  "pending",
  "completed",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
]);

export const sessionSourceEnum = pgEnum("session_source", [
  "package",
  "subscription",
  "single",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "cancelled",
  "past_due",
  "trialing",
]);

export const packageStatusEnum = pgEnum("package_status", [
  "active",
  "exhausted",
  "expired",
  "refunded",
]);

export const billingPeriodEnum = pgEnum("billing_period", [
  "weekly",
  "monthly",
  "yearly",
]);

export const sessionTypeEnum = pgEnum("session_type", ["individual", "group"]);

export const participantStatusEnum = pgEnum("participant_status", ["booked", "cancelled"]);

// GHL installations — one row per connected GHL sub-account (location)
export const installations = pgTable("installations", {
  id: uuid("id").primaryKey().defaultRandom(),
  locationId: text("location_id").notNull().unique(),
  companyId: text("company_id"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  tokenExpiresAt: timestamp("token_expires_at").notNull(),
  installedAt: timestamp("installed_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Provider profile — one per installation
export const providers = pgTable("providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  installationId: uuid("installation_id")
    .notNull()
    .references(() => installations.id, { onDelete: "cascade" })
    .unique(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  serviceType: text("service_type"), // e.g. "Personal Trainer", "Massage Therapist"
  timezone: text("timezone").notNull().default("UTC"),
  sessionDurationMins: integer("session_duration_mins").notNull().default(60),
  currency: text("currency").notNull().default("usd"),
  stripeAccountId: text("stripe_account_id"), // Stripe Connect (future)
  stripeCustomerId: text("stripe_customer_id"),
  stripeSecretKey: text("stripe_secret_key"), // Provider's own Stripe secret key
  stripeWebhookSecret: text("stripe_webhook_secret"), // Provider's webhook signing secret
  allowIndividualSelfBook: boolean("allow_individual_self_book").notNull().default(true),
  allowGroupSelfBook: boolean("allow_group_self_book").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Session packages — e.g. "10 sessions for $500"
export const packages = pgTable("packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  sessionCount: integer("session_count").notNull(),
  sessionDurationMins: integer("session_duration_mins"), // null = use provider default
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  validityDays: integer("validity_days"), // null = no expiry
  stripePriceId: text("stripe_price_id"),
  stripeProductId: text("stripe_product_id"),
  isActive: boolean("is_active").notNull().default(true),
  sessionType: sessionTypeEnum("session_type").notNull().default("individual"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscription plans — e.g. "4 sessions/month for $200"
export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  sessionsPerPeriod: integer("sessions_per_period").notNull(),
  sessionDurationMins: integer("session_duration_mins"), // null = use provider default
  billingPeriod: billingPeriodEnum("billing_period").notNull().default("monthly"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  stripePriceId: text("stripe_price_id"),
  stripeProductId: text("stripe_product_id"),
  isActive: boolean("is_active").notNull().default(true),
  sessionType: sessionTypeEnum("session_type").notNull().default("individual"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Clients — synced from GHL contacts
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  ghlContactId: text("ghl_contact_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  stripeCustomerId: text("stripe_customer_id"),
  notes: text("notes"),
  clerkUserId: text("clerk_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Client package purchases
export const clientPackages = pgTable("client_packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  packageId: uuid("package_id")
    .notNull()
    .references(() => packages.id),
  sessionsTotal: integer("sessions_total").notNull(),
  sessionsUsed: integer("sessions_used").notNull().default(0),
  sessionsRemaining: integer("sessions_remaining").notNull(),
  status: packageStatusEnum("status").notNull().default("active"),
  paymentMethod: text("payment_method"), // "stripe" | "cash" | "bank" | "other" | null
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Client subscriptions
export const clientSubscriptions = pgTable("client_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  planId: uuid("plan_id")
    .notNull()
    .references(() => subscriptionPlans.id),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  sessionsUsedThisPeriod: integer("sessions_used_this_period").notNull().default(0),
  sessionsPerPeriod: integer("sessions_per_period").notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  paymentMethod: text("payment_method"), // "stripe" | "cash" | "bank" | "other"
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  cancelledAt: timestamp("cancelled_at"),
});

// Bookings — individual session appointments
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),
  title: text("title"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: bookingStatusEnum("status").notNull().default("scheduled"),
  sessionSource: sessionSourceEnum("session_source"),
  clientPackageId: uuid("client_package_id").references(
    () => clientPackages.id
  ),
  clientSubscriptionId: uuid("client_subscription_id").references(
    () => clientSubscriptions.id
  ),
  notes: text("notes"),
  ghlAppointmentId: text("ghl_appointment_id"),
  sessionType: sessionTypeEnum("session_type").notNull().default("individual"),
  maxParticipants: integer("max_participants"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Booking participants — for group sessions
export const bookingParticipants = pgTable("booking_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  clientPackageId: uuid("client_package_id").references(() => clientPackages.id),
  clientSubscriptionId: uuid("client_subscription_id").references(() => clientSubscriptions.id),
  status: participantStatusEnum("status").notNull().default("booked"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Questionnaire templates
export const questionnaires = pgTable("questionnaires", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  assignOnJoin: boolean("assign_on_join").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Questions within a questionnaire
export const questionnaireQuestions = pgTable("questionnaire_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionnaireId: uuid("questionnaire_id")
    .notNull()
    .references(() => questionnaires.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  type: questionTypeEnum("type").notNull().default("text"),
  options: text("options"), // JSON array string for multiple_choice/dropdown
  required: boolean("required").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Client questionnaire assignments
export const clientQuestionnaires = pgTable("client_questionnaires", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  questionnaireId: uuid("questionnaire_id")
    .notNull()
    .references(() => questionnaires.id, { onDelete: "cascade" }),
  status: questionnaireResponseStatusEnum("status").notNull().default("pending"),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Client questionnaire answers
export const clientQuestionnaireAnswers = pgTable("client_questionnaire_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientQuestionnaireId: uuid("client_questionnaire_id")
    .notNull()
    .references(() => clientQuestionnaires.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questionnaireQuestions.id, { onDelete: "cascade" }),
  value: text("value"),
});

// Provider weekly availability schedule
export const availability = pgTable("availability", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sun, 1=Mon, …, 6=Sat
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(),     // "17:00"
});

// Blocked times — provider unavailability
export const blockedTimes = pgTable("blocked_times", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Blocked"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurrenceRule: text("recurrence_rule"), // iCal RRULE string
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const installationsRelations = relations(installations, ({ one }) => ({
  provider: one(providers, {
    fields: [installations.id],
    references: [providers.installationId],
  }),
}));

export const providersRelations = relations(providers, ({ one, many }) => ({
  installation: one(installations, {
    fields: [providers.installationId],
    references: [installations.id],
  }),
  packages: many(packages),
  subscriptionPlans: many(subscriptionPlans),
  clients: many(clients),
  bookings: many(bookings),
  blockedTimes: many(blockedTimes),
  questionnaires: many(questionnaires),
  availability: many(availability),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  provider: one(providers, {
    fields: [clients.providerId],
    references: [providers.id],
  }),
  clientPackages: many(clientPackages),
  clientSubscriptions: many(clientSubscriptions),
  bookings: many(bookings),
  clientQuestionnaires: many(clientQuestionnaires),
  bookingParticipants: many(bookingParticipants),
}));

export const questionnairesRelations = relations(questionnaires, ({ one, many }) => ({
  provider: one(providers, {
    fields: [questionnaires.providerId],
    references: [providers.id],
  }),
  questions: many(questionnaireQuestions),
  clientQuestionnaires: many(clientQuestionnaires),
}));

export const questionnaireQuestionsRelations = relations(questionnaireQuestions, ({ one }) => ({
  questionnaire: one(questionnaires, {
    fields: [questionnaireQuestions.questionnaireId],
    references: [questionnaires.id],
  }),
}));

export const clientQuestionnairesRelations = relations(clientQuestionnaires, ({ one, many }) => ({
  client: one(clients, {
    fields: [clientQuestionnaires.clientId],
    references: [clients.id],
  }),
  questionnaire: one(questionnaires, {
    fields: [clientQuestionnaires.questionnaireId],
    references: [questionnaires.id],
  }),
  answers: many(clientQuestionnaireAnswers),
}));

export const clientQuestionnaireAnswersRelations = relations(clientQuestionnaireAnswers, ({ one }) => ({
  clientQuestionnaire: one(clientQuestionnaires, {
    fields: [clientQuestionnaireAnswers.clientQuestionnaireId],
    references: [clientQuestionnaires.id],
  }),
  question: one(questionnaireQuestions, {
    fields: [clientQuestionnaireAnswers.questionId],
    references: [questionnaireQuestions.id],
  }),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  provider: one(providers, {
    fields: [availability.providerId],
    references: [providers.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  provider: one(providers, {
    fields: [bookings.providerId],
    references: [providers.id],
  }),
  client: one(clients, {
    fields: [bookings.clientId],
    references: [clients.id],
  }),
  clientPackage: one(clientPackages, {
    fields: [bookings.clientPackageId],
    references: [clientPackages.id],
  }),
  clientSubscription: one(clientSubscriptions, {
    fields: [bookings.clientSubscriptionId],
    references: [clientSubscriptions.id],
  }),
  participants: many(bookingParticipants),
}));

export const bookingParticipantsRelations = relations(bookingParticipants, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingParticipants.bookingId],
    references: [bookings.id],
  }),
  client: one(clients, {
    fields: [bookingParticipants.clientId],
    references: [clients.id],
  }),
  clientPackage: one(clientPackages, {
    fields: [bookingParticipants.clientPackageId],
    references: [clientPackages.id],
  }),
  clientSubscription: one(clientSubscriptions, {
    fields: [bookingParticipants.clientSubscriptionId],
    references: [clientSubscriptions.id],
  }),
}));
