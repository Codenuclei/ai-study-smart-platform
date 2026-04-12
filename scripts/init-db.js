import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

const initDatabase = async () => {
  try {
    console.log('Starting database initialization...');

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE
      )
    `;

    // Create study materials table
    await sql`
      CREATE TABLE IF NOT EXISTS study_materials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        description VARCHAR(500),
        subject VARCHAR(100),
        file_url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create summaries table
    await sql`
      CREATE TABLE IF NOT EXISTS summaries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        key_points TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create quizzes table
    await sql`
      CREATE TABLE IF NOT EXISTS quizzes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        difficulty VARCHAR(20) DEFAULT 'medium',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create quiz questions table
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer INTEGER NOT NULL,
        explanation TEXT,
        order_index INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create quiz attempts table
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        score DECIMAL(5, 2),
        total_questions INTEGER,
        answers JSONB,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE
      )
    `;

    // Create flashcards table
    await sql`
      CREATE TABLE IF NOT EXISTS flashcards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        difficulty VARCHAR(20) DEFAULT 'medium',
        next_review TIMESTAMP WITH TIME ZONE,
        interval INTEGER DEFAULT 1,
        ease_factor DECIMAL(3, 2) DEFAULT 2.5,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create chat messages table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        material_id UUID REFERENCES study_materials(id) ON DELETE SET NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create user progress table
    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
        quiz_completed BOOLEAN DEFAULT false,
        flashcards_studied INTEGER DEFAULT 0,
        last_studied TIMESTAMP WITH TIME ZONE,
        completion_percentage INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, material_id)
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_materials_user_id ON study_materials(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_summaries_material_id ON summaries(material_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quizzes_material_id ON quizzes(material_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_flashcards_material_id ON flashcards(material_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_progress_user_id ON user_progress(user_id)`;

    console.log('✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();
