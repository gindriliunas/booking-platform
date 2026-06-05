import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  uuid,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const recurrenceFrequencyEnum = pgEnum("recurrence_frequency", [
  "weekly",
  "biweekly",
  "monthly",
]);

export const waitlistStatusEnum = pgEnum("waitlist_status", [
  "waiting",
  "notified",
  "expired",
  "cancelled",
]);

export const lateCancelOutcomeEnum = pgEnum("late_cancel_outcome", ["deducted", "waived"]);

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

export const providers = pgTable("providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  serviceType: text("service_type"),
  timezone: text("timezone").notNull().default("UTC"),
  sessionDurationMins: integer("session_duration_mins").notNull().default(60),
  currency: text("currency").notNull().default("usd"),
  allowIndividualSelfBook: boolean("allow_individual_self_book").notNull().default(true),
  allowGroupSelfBook: boolean("allow_group_self_book").notNull().default(true),
  enableWaitlist: boolean("enable_waitlist").notNull().default(false),
  lateCancelWindowHours: integer("late_cancel_window_hours"),
  lateCancelAction: text("late_cancel_action"),
  invoiceBusinessName: text("invoice_business_name"),
  invoiceAddress: text("invoice_address"),
  invoiceTaxId: text("invoice_tax_id"),
  invoiceLogoUrl: text("invoice_logo_url"),
  invoiceFooterNote: text("invoice_footer_note"),
  autoSendInvoiceOnPackage: boolean("auto_send_invoice_on_package").notNull().default(false),
  autoSendInvoiceOnSubscription: boolean("auto_send_invoice_on_subscription").notNull().default(false),
  googleCalendarAccessToken: text("google_calendar_access_token"),
  googleCalendarRefreshToken: text("google_calendar_refresh_token"),
  googleCalendarTokenExpiresAt: timestamp("google_calendar_token_expires_at"),
  googleCalendarId: text("google_calendar_id"),
  googleCalendarSyncEnabled: boolean("google_calendar_sync_enabled").notNull().default(false),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const packages = pgTable("packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  sessionCount: integer("session_count").notNull(),
  sessionDurationMins: integer("session_duration_mins"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  validityDays: integer("validity_days"),
  isActive: boolean("is_active").notNull().default(true),
  isPublic: boolean("is_public").notNull().default(true),
  isFreeTrialSession: boolean("is_free_trial_session").notNull().default(false),
  allowSelfBook: boolean("allow_self_book").notNull().default(true),
  sessionType: sessionTypeEnum("session_type").notNull().default("individual"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  sessionsPerPeriod: integer("sessions_per_period").notNull(),
  sessionDurationMins: integer("session_duration_mins"),
  billingPeriod: billingPeriodEnum("billing_period").notNull().default("monthly"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  isActive: boolean("is_active").notNull().default(true),
  isPublic: boolean("is_public").notNull().default(true),
  sessionType: sessionTypeEnum("session_type").notNull().default("individual"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  paymentMethod: text("payment_method"),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

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
  paymentMethod: text("payment_method"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  cancelledAt: timestamp("cancelled_at"),
});

export const bookingSeries = pgTable("booking_series", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  frequency: recurrenceFrequencyEnum("frequency").notNull(),
  occurrences: integer("occurrences").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  title: text("title"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: bookingStatusEnum("status").notNull().default("scheduled"),
  sessionSource: sessionSourceEnum("session_source"),
  clientPackageId: uuid("client_package_id").references(() => clientPackages.id),
  clientSubscriptionId: uuid("client_subscription_id").references(() => clientSubscriptions.id),
  notes: text("notes"),
  sessionType: sessionTypeEnum("session_type").notNull().default("individual"),
  maxParticipants: integer("max_participants"),
  bookingSeriesId: uuid("booking_series_id").references(() => bookingSeries.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

export const waitlistEntries = pgTable(
  "waitlist_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    status: waitlistStatusEnum("status").notNull().default("waiting"),
    notifiedAt: timestamp("notified_at"),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.bookingId, t.clientId)]
);

export const lateCancellationLogs = pgTable("late_cancellation_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  cancelledAt: timestamp("cancelled_at").defaultNow().notNull(),
  sessionStartTime: timestamp("session_start_time").notNull(),
  windowHours: integer("window_hours").notNull(),
  action: text("action").notNull(),
  outcome: lateCancelOutcomeEnum("outcome").notNull(),
  notes: text("notes"),
});

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

export const questionnaireQuestions = pgTable("questionnaire_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionnaireId: uuid("questionnaire_id")
    .notNull()
    .references(() => questionnaires.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  type: questionTypeEnum("type").notNull().default("text"),
  options: text("options"),
  required: boolean("required").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

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

export const availability = pgTable("availability", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
});

export const blockedTimes = pgTable("blocked_times", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Blocked"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurrenceRule: text("recurrence_rule"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reminderTypeEnum = pgEnum("reminder_type", ["24h", "1h"]);

export const reminderLogs = pgTable(
  "reminder_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    reminderType: reminderTypeEnum("reminder_type").notNull(),
    firedAt: timestamp("fired_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.bookingId, t.reminderType)]
);

export const providersRelations = relations(providers, ({ many }) => ({
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

export const clientQuestionnaireAnswersRelations = relations(
  clientQuestionnaireAnswers,
  ({ one }) => ({
    clientQuestionnaire: one(clientQuestionnaires, {
      fields: [clientQuestionnaireAnswers.clientQuestionnaireId],
      references: [clientQuestionnaires.id],
    }),
    question: one(questionnaireQuestions, {
      fields: [clientQuestionnaireAnswers.questionId],
      references: [questionnaireQuestions.id],
    }),
  })
);

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
  series: one(bookingSeries, {
    fields: [bookings.bookingSeriesId],
    references: [bookingSeries.id],
  }),
  participants: many(bookingParticipants),
  waitlistEntries: many(waitlistEntries),
}));

export const bookingSeriesRelations = relations(bookingSeries, ({ one, many }) => ({
  provider: one(providers, {
    fields: [bookingSeries.providerId],
    references: [providers.id],
  }),
  bookings: many(bookings),
}));

export const waitlistEntriesRelations = relations(waitlistEntries, ({ one }) => ({
  booking: one(bookings, {
    fields: [waitlistEntries.bookingId],
    references: [bookings.id],
  }),
  client: one(clients, {
    fields: [waitlistEntries.clientId],
    references: [clients.id],
  }),
}));

export const lateCancellationLogsRelations = relations(lateCancellationLogs, ({ one }) => ({
  booking: one(bookings, {
    fields: [lateCancellationLogs.bookingId],
    references: [bookings.id],
  }),
  client: one(clients, {
    fields: [lateCancellationLogs.clientId],
    references: [clients.id],
  }),
  provider: one(providers, {
    fields: [lateCancellationLogs.providerId],
    references: [providers.id],
  }),
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

export const clientPackagesRelations = relations(clientPackages, ({ one }) => ({
  client: one(clients, {
    fields: [clientPackages.clientId],
    references: [clients.id],
  }),
  package: one(packages, {
    fields: [clientPackages.packageId],
    references: [packages.id],
  }),
}));

export const clientSubscriptionsRelations = relations(clientSubscriptions, ({ one }) => ({
  client: one(clients, {
    fields: [clientSubscriptions.clientId],
    references: [clients.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [clientSubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
}));

export const reminderLogsRelations = relations(reminderLogs, ({ one }) => ({
  booking: one(bookings, {
    fields: [reminderLogs.bookingId],
    references: [bookings.id],
  }),
}));
