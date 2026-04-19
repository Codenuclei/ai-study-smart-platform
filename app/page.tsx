'use client';
// Force rebuild v4

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Highlighter } from '@/components/ui/highlighter';
import {
  UploadSimple,
  MagicWand,
  Student,
  ChartLineUp,
  GraduationCap,
  Sparkle,
  Note,
  Cards,
  ChatsCircle,
  ChartBar,
  UserFocus,
  Exam,
} from 'phosphor-react';
 

export default function Home() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (session?.user) {
      window.location.href = '/dashboard';
    }
  }, [session]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
          style={{ background: 'var(--primary)' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
          style={{ background: 'var(--secondary)' }}></div>
        <div className="absolute bottom-20 right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"
          style={{ background: 'var(--accent)' }}></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <header className="border-b backdrop-blur-sm" style={{ borderColor: 'var(--border)' }}>
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                <BookOpen className="w-6 h-6" style={{ color: 'var(--primary-foreground)' }} />
              </div>
              <span className="font-bold text-lg ">
                StudyAI
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:from-[color-mix(in_oklch,var(--primary),black_10%)] hover:to-[color-mix(in_oklch,var(--accent),black_10%)] text-[var(--primary-foreground)]">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              Learn{' '}
              <Highlighter action="underline" color="#FF9800">
                <span style={{ color: '#ed8320' }}>Smarter</span>
              </Highlighter>
              <br />
              <span style={{ color: 'var(--foreground)' }}>with AI-Powered Study Tools</span>
            </h1>
            <p className="text-xl mb-8" style={{ color: 'var(--muted-foreground)' }}>
              Upload your notes and let our AI generate personalized summaries, quizzes, flashcards, and provide intelligent guidance to accelerate your learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:from-[color-mix(in_oklch,var(--primary),black_10%)] hover:to-[color-mix(in_oklch,var(--accent),black_10%)] text-[var(--primary-foreground)]">
                  Start Learning Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {[
              {
                icon: Note,
                title: 'AI Summaries',
                description: 'Get comprehensive summaries of your notes in seconds. Perfect for quick reviews and understanding key concepts.',
              },
              {
                icon: Exam,
                title: 'Smart Quizzes',
                description: 'AI-generated quizzes that test your knowledge and help identify weak areas in your understanding.',
              },
              {
                icon: Cards,
                title: 'Flashcards',
                description: 'Spaced repetition flashcards for efficient memorization and long-term retention.',
              },
              {
                icon: ChatsCircle,
                title: 'Study Chatbot',
                description: 'Ask questions anytime and get instant explanations from your AI study companion.',
              },
              {
                icon: ChartBar,
                title: 'Analytics',
                description: 'Track your progress with detailed analytics and insights into your learning patterns.',
              },
              {
                icon: UserFocus,
                title: 'Personalized Learning',
                description: 'Adaptive learning paths that adjust to your pace and learning style.',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 card-hover border-0 shadow-lg backdrop-blur-sm" style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'var(--card)', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)' }}>
                    <Icon size={28} weight="duotone" style={{ color: 'var(--primary)' }} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{feature.description}</p>
                </Card>
              );
            })}
          </div>

          {/* How It Works */}
          <div className="rounded-2xl border backdrop-blur-sm p-12 mb-24" style={{ background: 'linear-gradient(90deg, color-mix(in_oklch,var(--primary),white_90%) 0%, color-mix(in_oklch,var(--accent),white_90%) 100%)', borderColor: 'var(--border)' }}>
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: 1, title: 'Upload', desc: 'Add your study materials', icon: UploadSimple },
                { step: 2, title: 'Generate', desc: 'AI creates content', icon: MagicWand },
                { step: 3, title: 'Study', desc: 'Learn and practice', icon: Student },
                { step: 4, title: 'Track', desc: 'Monitor your progress', icon: ChartLineUp },
              ].map((item) => {
                const StepIcon = item.icon;
                return (
                  <div key={item.step} className="text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'var(--primary-foreground)' }}>
                      <StepIcon size={28} weight="duotone" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Ready to Transform Your Learning?</h2>
            <p className="mb-8" style={{ color: 'var(--muted-foreground)' }}>Join thousands of students already using StudyAI to ace their exams</p>
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:from-[color-mix(in_oklch,var(--primary),black_10%)] hover:to-[color-mix(in_oklch,var(--accent),black_10%)] text-[var(--primary-foreground)]">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t backdrop-blur-sm" style={{ borderColor: 'var(--border)' }}>
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center flex flex-col items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
            <GraduationCap size={32} weight="duotone" />
            <p>&copy; 2024 StudyAI. All rights reserved. Powered by AI and education.</p>
            <span className="inline-flex items-center gap-1 text-xs opacity-70"><Sparkle size={16} /> Built with love for learners</span>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
