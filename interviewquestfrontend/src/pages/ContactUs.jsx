import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Send, CheckCircle, Loader2 } from 'lucide-react';

const Github = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('https://formspree.io/f/mykqlvow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitError(result?.error || 'Submission failed. Please try again.');
      }
    } catch (err) {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 overflow-x-hidden transition-colors duration-300 flex flex-col justify-between">
      <div>
        <Navbar variant="app" />

        <section className="pt-36 pb-24 px-6 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10" />
            <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight text-zinc-950 dark:text-white">
              Get in Touch
            </h1>
            <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Have questions, feedback, or want to collaborate? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-8 space-y-6">
                <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Contact Details</h3>
                <p className="text-sm text-zinc-550 dark:text-zinc-400 leading-relaxed">
                  Feel free to reach out via email or connect with us on professional networks.
                </p>

                <div className="space-y-4">
                  <a
                    href="mailto:s.upadhye6782@gmail.com"
                    className="flex items-center space-x-3.5 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-750 transition group"
                  >
                    <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Email Us</p>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">s.upadhye6782@gmail.com</p>
                    </div>
                  </a>

                  <a
                    href="https://linkedin.com/in/suraj-upadhye"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-3.5 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-750 transition group"
                  >
                    <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-105 transition-transform">
                      <Linkedin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">LinkedIn</p>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">suraj-upadhye</p>
                    </div>
                  </a>

                  <a
                    href="https://github.com/suraj-upadhye"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-3.5 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-750 transition group"
                  >
                    <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-105 transition-transform">
                      <Github className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">GitHub</p>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">suraj-upadhye</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="lg:col-span-3">
              <div className="bg-zinc-50 dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-900 rounded-2xl p-8 relative">
                {isSubmitted ? (
                  <div className="text-center py-12 space-y-4 animate-fadeIn">
                    <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-500 rounded-full mb-2">
                      <CheckCircle className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-950 dark:text-white">Message Sent!</h3>
                    <p className="text-zinc-550 dark:text-zinc-400 text-sm max-w-xs mx-auto">
                      Thank you for reaching out. We will get back to you as soon as possible.
                    </p>
                    <button
                      onClick={() => { setIsSubmitted(false); setSubmitError(''); }}
                      className="mt-4 px-6 py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs rounded-xl transition cursor-pointer border-none shadow-md"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {submitError && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-center">
                        {submitError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Your Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-xs transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-xs transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Feedback / Feature Request / Collaboration"
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-xs transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase">Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Write your message here..."
                        rows="5"
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-xs resize-none transition"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex justify-center items-center gap-2 border-none hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-85"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ContactUs;
