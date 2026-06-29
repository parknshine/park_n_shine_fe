"use client";

import { useState } from "react";

const inter = "var(--font-inter), sans-serif";

const inputClass =
  "w-full rounded border border-[#e8e8e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#024ad8] transition-colors placeholder:text-[#9ca3af]";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailtoUrl = `mailto:hello@parknshine.id?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm text-[#1a1a1a]"
            style={{ fontFamily: inter, fontWeight: 600 }}
          >
            Full Name
          </label>
          <input
            type="text"
            placeholder="Your name"
            className={inputClass}
            style={{ fontFamily: inter }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm text-[#1a1a1a]"
            style={{ fontFamily: inter, fontWeight: 600 }}
          >
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className={inputClass}
            style={{ fontFamily: inter }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm text-[#1a1a1a]"
          style={{ fontFamily: inter, fontWeight: 600 }}
        >
          Subject
        </label>
        <input
          type="text"
          placeholder="What is your message about?"
          className={inputClass}
          style={{ fontFamily: inter }}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm text-[#1a1a1a]"
          style={{ fontFamily: inter, fontWeight: 600 }}
        >
          Message
        </label>
        <textarea
          rows={5}
          placeholder="Tell us how we can help..."
          className={`${inputClass} resize-none`}
          style={{ fontFamily: inter }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div>
        <button
          type="submit"
          className="w-full sm:w-auto bg-[#024ad8] text-white rounded px-8 py-3 text-sm tracking-[0.7px]"
          style={{ fontFamily: inter, fontWeight: 600, textTransform: "uppercase" }}
        >
          Send Message
        </button>
      </div>
    </form>
  );
}
