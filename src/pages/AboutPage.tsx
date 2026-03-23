import { Link } from "react-router-dom";
import RevealOnScroll from "../components/RevealOnScroll";

function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <RevealOnScroll>
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            About Jira Mini
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-gray-600">
            Jira Mini was built to meet the need for fast, clear, and scalable
            project management for modern product teams.
          </p>
        </section>
      </RevealOnScroll>

      <RevealOnScroll className="mt-10 grid items-center gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 md:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 p-7">
          <div className="mx-auto flex max-w-sm items-center justify-center rounded-xl bg-white p-8 shadow-sm ring-1 ring-blue-200">
            <svg
              viewBox="0 0 24 24"
              className="h-20 w-20 text-blue-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M8 11V7a4 4 0 1 1 8 0v4" />
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M12 15v2" />
            </svg>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Story & Motivation
          </h2>
          <p className="mt-3 text-gray-600">
            We noticed many existing management tools are powerful but too heavy
            for small teams. Jira Mini focuses on core capabilities: drag-and-
            drop boards, project-based roles, and audit history so teams can
            focus on delivery instead of complex setup.
          </p>
        </div>
      </RevealOnScroll>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <RevealOnScroll className="card-lift rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3 20l6-11 4 6 3-4 5 9z" />
              <path d="M3 20h18" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Mission</h3>
          <p className="mt-2 text-gray-600">
            Deliver a lightweight, intuitive, and consistent project management
            experience to every product team.
          </p>
        </RevealOnScroll>

        <RevealOnScroll
          className="card-lift rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          delayMs={120}
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3l7 5v8l-7 5-7-5V8z" />
              <path d="M12 3v18" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Core Values</h3>
          <p className="mt-2 text-gray-600">
            Simplicity, transparency, and speed. Every part serves one goal:
            helping teams collaborate more effectively every day.
          </p>
        </RevealOnScroll>
      </div>

      <RevealOnScroll className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900">
          Development Team
        </h2>
        <div className="mt-5 max-w-sm">
          <article className="card-lift rounded-xl border border-gray-200 bg-gray-50 p-5">
            <img
              src="/images/profile.jpg"
              alt="Bùi Tuấn Anh"
              className="mb-3 h-14 w-14 rounded-full object-cover ring-2 ring-blue-200"
            />
            <h3 className="text-lg font-semibold text-gray-900">
              Bùi Tuấn Anh
            </h3>
            <p className="text-sm text-gray-600">Backend Developer</p>
            <div className="mt-3 flex gap-3 text-sm">
              <a
                href="https://github.com/tanh8805"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue-700 hover:underline"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/anh-tu%E1%BA%A5n-7b57163b4/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue-700 hover:underline"
              >
                LinkedIn
              </a>
            </div>
          </article>
        </div>
      </RevealOnScroll>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/contact"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Contact the Team
        </Link>
      </div>
    </main>
  );
}

export default AboutPage;
