import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  integer,
  json,
  uniqueIndex,
  varchar,
  decimal,
} from 'drizzle-orm/pg-core';

// Users Table
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }),
    passwordHash: text('password_hash'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  })
);

// Study Materials Table
export const materials = pgTable('materials', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  subject: varchar('subject', { length: 100 }),
  grade: varchar('grade', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Summaries Table
export const summaries = pgTable('summaries', {
  id: serial('id').primaryKey(),
  materialId: integer('material_id')
    .references(() => materials.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  summary: text('summary').notNull(),
  keyPoints: json('key_points').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Quizzes Table
export const quizzes = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  materialId: integer('material_id')
    .references(() => materials.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  questions: json('questions').$type<Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
  }>>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Quiz Attempts Table
export const quizAttempts = pgTable('quiz_attempts', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id')
    .references(() => quizzes.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  score: decimal('score', { precision: 5, scale: 2 }),
  answers: json('answers').$type<Record<string, string>>(),
  completedAt: timestamp('completed_at').defaultNow(),
});

// Flashcards Table
export const flashcards = pgTable('flashcards', {
  id: serial('id').primaryKey(),
  materialId: integer('material_id')
    .references(() => materials.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  front: text('front').notNull(),
  back: text('back').notNull(),
  difficulty: varchar('difficulty', { length: 20 }).default('medium'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Flashcard Reviews Table (for spaced repetition)
export const flashcardReviews = pgTable('flashcard_reviews', {
  id: serial('id').primaryKey(),
  flashcardId: integer('flashcard_id')
    .references(() => flashcards.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  correct: boolean('correct').notNull(),
  interval: integer('interval').default(1),
  ease: decimal('ease', { precision: 3, scale: 2 }).default('2.5'),
  nextReview: timestamp('next_review'),
  reviewedAt: timestamp('reviewed_at').defaultNow(),
});

// Chat Messages Table
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  materialId: integer('material_id').references(() => materials.id, {
    onDelete: 'set null',
  }),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Analytics/Progress Table
export const progress = pgTable('progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  totalMaterials: integer('total_materials').default(0),
  totalSummaries: integer('total_summaries').default(0),
  totalQuizzes: integer('total_quizzes').default(0),
  averageQuizScore: decimal('average_quiz_score', { precision: 5, scale: 2 }),
  totalFlashcards: integer('total_flashcards').default(0),
  masteredFlashcards: integer('mastered_flashcards').default(0),
  lastActivityAt: timestamp('last_activity_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
