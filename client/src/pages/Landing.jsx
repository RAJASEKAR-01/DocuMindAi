import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  SparklesIcon,
  ShieldExclamationIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    icon: SparklesIcon,
    title: "Instant AI Summaries",
    description: "Upload any contract or document and get a clear, plain-English summary in seconds.",
  },
  {
    icon: ShieldExclamationIcon,
    title: "Risk Scoring",
    description: "Every document gets a 0-100 risk score with flagged clauses that need your attention.",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Chat With Your Document",
    description: "Ask follow-up questions and get answers grounded strictly in what you uploaded.",
  },
  {
    icon: ChartBarIcon,
    title: "Analytics Dashboard",
    description: "Track every document you've analyzed and spot risk trends over time.",
  },
];

const Landing = () => (
  <div className="min-h-screen bg-paper">
    <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-2 font-extrabold text-lg">
        <span className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
          <DocumentTextIcon className="w-5 h-5 text-accent" />
        </span>
        DocuMind <span className="text-accent-dark">AI</span>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/login" className="text-sm font-semibold text-ink-muted hover:text-ink">
          Log In
        </Link>
        <Link to="/register" className="btn-primary text-sm">
          Get Started
        </Link>
      </div>
    </header>

    <section className="max-w-4xl mx-auto px-6 text-center pt-16 pb-20">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]"
      >
        Understand any document<br />
        <span className="bg-accent px-2">in seconds, not hours.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-lg text-ink-muted mt-6 max-w-2xl mx-auto"
      >
        Rental agreements, offer letters, loan contracts, NDAs. Upload the PDF and DocuMind AI
        summarizes it, scores its risk, flags what matters, and answers your questions — instantly.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 flex items-center justify-center gap-4"
      >
        <Link to="/register" className="btn-accent text-base px-8 py-3">
          Analyze Your First Document
        </Link>
      </motion.div>
    </section>

    <section className="max-w-6xl mx-auto px-6 pb-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {features.map(({ icon: Icon, title, description }, i) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="card"
        >
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
            <Icon className="w-5 h-5 text-ink" />
          </div>
          <h3 className="font-bold mb-1.5">{title}</h3>
          <p className="text-sm text-ink-muted">{description}</p>
        </motion.div>
      ))}
    </section>

    <footer className="border-t-2 border-paper-border py-8 text-center text-sm text-ink-muted">
      Built with the MERN stack + Google Gemini · DocuMind AI
    </footer>
  </div>
);

export default Landing;
