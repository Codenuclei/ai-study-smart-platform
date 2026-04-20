"use client"
import { AnimatePresence, motion, MotionValue } from 'framer-motion';
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from 'react';
const faqData = [
  {
    q: 'What is StudyAI?',
    a: 'StudyAI is an AI-powered platform that helps you learn smarter by generating summaries, quizzes, flashcards, and providing instant study guidance from your own notes and materials.'
  },
  {
    q: 'How much does it cost?',
    a: 'You can start using StudyAI for free. We offer premium features for advanced analytics and unlimited usage, but the core tools are always free for students.'
  },
  {
    q: 'Is my data private and secure?',
    a: 'Yes. Your uploaded notes and study materials are encrypted and never shared. You control your data and can delete it at any time.'
  },
  {
    q: 'Can I use StudyAI for any subject?',
    a: 'Absolutely! StudyAI works with any subject or topic—just upload your notes or materials and let the AI do the rest.'
  },
  {
    q: 'How do I get started?',
    a: 'Click "Get Started" to create a free account, upload your first notes, and explore all the AI-powered study tools instantly.'
  }
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-6">
      {faqData.map((item, i) => (
        <motion.div
          key={i}
          layoutId="faq-item"
          className={`faq-anim group relative overflow-visible ${open === i ? 'z-10' : ''}`}
          initial={false}
          animate={{
            scale: open === i ? 1.03 : 1,
            boxShadow: open === i ? '0 8px 32px 0 rgba(255,152,0,0.10)' : '0 2px 8px 0 rgba(0,0,0,0.04)',
            filter: open === i ? 'blur(0px)' : 'blur(0px)',
            borderColor: open === i ? 'var(--accent)' : 'var(--border)',
            transition: { type: 'spring', stiffness: 400, damping: 30 }
          }}
        >
          <button
            className="flex w-full items-center cursor-pointer py-4 px-6 select-none bg-transparent border-none outline-none"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? -1 : i)}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className={`flex-1 text-lg font-semibold text-[var(--foreground)] transition-colors duration-300 ${open === i ? 'text-[var(--accent)]' : ''}`}>
              {item.q}
            </span>
            <motion.span
              className="chevron ml-4"
              animate={{ rotate: open === i ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </motion.span>
          </button>
          <AnimatePresence initial={false} mode="wait">
            {open === i && (
              <motion.div
                key="faq-content"
                className="faq-content px-6 pb-4"
                initial={{ opacity: 0, y: 32, filter: 'blur(12px)', scale: 0.98 }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                exit={{ opacity: 0, y: -32, filter: 'blur(16px)', scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <SnapText text={item.a} />
                <BurstParticles key={open} />
                <div className="faq-shade" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 pointer-events-none z-0 rounded-2xl border border-[var(--border)] bg-none" />
        </motion.div>
      ))}
      <style jsx>{`
        .faq-anim {
          border-radius: 1.25rem;
          background: var(--card);
          border: 1.5px solid var(--border);
          position: relative;
          overflow: visible;
          margin-bottom: 0.5rem;
          transition: box-shadow 0.3s, border 0.3s;
        }
        .faq-anim:after {
          content: '';
          display: block;
          position: absolute;
          inset: 0;
          border-radius: 1.25rem;
          pointer-events: none;
        }
        .faq-content {
          overflow: visible;
          will-change: max-height;
          position: relative;
        }
        .chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 0 2px var(--accent));
        }
        .faq-shade {
          position: absolute;
          inset: 0;
          border-radius: 1.25rem;
          background: radial-gradient(ellipse at 50% 0%,rgba(0,0,0,0.08) 0%,rgba(0,0,0,0.01) 100%);
          z-index: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

// SnapText: Thanos snap effect on text (letters fade out in order on exit)
function SnapText({ text }: { text: string }) {
  return (
    <motion.span
      className="block"
      initial="visible"
      animate="visible"
      exit="snap"
      variants={{
        visible: { opacity: 1, transition: { staggerChildren: 0.01 } },
        snap: { opacity: 0, transition: { staggerChildren: 0.01, staggerDirection: -1 } }
      }}
      style={{ display: 'block', position: 'relative' }}
    >
      {text.split('').map((char: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | MotionValue<number> | MotionValue<string> | null | undefined, i: Key | null | undefined) => (
        <motion.span
          key={i}
          variants={{
            visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
            snap: { opacity: 0, y: -16, filter: 'blur(8px)' }
          }}
          transition={{ duration: 0.18 }}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// BurstParticles: simple burst effect using absolutely positioned divs
function BurstParticles() {
  // 12 particles, random angle, animate out
  const particles = Array.from({ length: 12 }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / 12;
    const x = Math.cos(angle) * 48;
    const y = Math.sin(angle) * 24;
    return (
      <motion.div
        key={i}
        initial={{ opacity: 0.7, x: 0, y: 0, scale: 1 }}
        animate={{ opacity: 0, x, y, scale: 0.7 }}
        transition={{ duration: 0.7, delay: 0.05 * i }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '0%',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent) 60%, transparent 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    );
  });
  return <>{particles}</>;
}
 