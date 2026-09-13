import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, CheckCircle2, ThumbsUp, Plus, X } from 'lucide-react';
import { Review } from '../types';
import { useProducts } from '../context/ProductsContext';
import { playPop, playSnap } from '../utils/audio';

interface ReviewsProps {
  reviews: Review[];
  onAddReview: (review: Review) => void;
}

export const ReviewsSection: React.FC<ReviewsProps> = ({
  reviews,
  onAddReview,
}) => {
  const { products } = useProducts();
  const [modalOpen, setModalOpen] = useState(false);
  const [author, setAuthor] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [toteModel, setToteModel] = useState('');
  const selectedToteModel = toteModel || products[0]?.name || '';

  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2)
    : null;

  const starDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
    return { star, pct };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;

    playPop();
    const newRev: Review = {
      id: `user-rev-${Date.now()}`,
      author: author.trim(),
      city: city.trim() || 'Mumbai, IN',
      rating,
      date: 'Just now',
      title: title.trim() || 'Outstanding craftsmanship and ruggedness!',
      comment: comment.trim(),
      verified: true,
      toteModel: selectedToteModel,
    };

    onAddReview(newRev);
    setAuthor('');
    setCity('');
    setTitle('');
    setComment('');
    setModalOpen(false);
  };

  return (
    <section id="reviews" className="py-24 bg-[#F7F2E8] border-t border-[#0B1420]/10 relative overflow-hidden">
      {/* Immersive UI Ambient Blurs */}
      <div className="ambient-glow-container">
        <div className="ambient-glow-espresso opacity-20" />
        <div className="ambient-radial-gold opacity-15" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#B87D00] to-transparent" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B87D00] font-mono font-medium">
              Customer Feedback
            </span>
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#B87D00] to-transparent" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-light text-[#0B1420] leading-tight">
            <span className="italic text-[#0B1420]/70">Customer</span>{' '}
            <span className="text-[#340E09] font-serif font-bold not-italic">Stories</span>
          </h2>
          <p className="text-[#0B1420]/60 text-sm sm:text-base font-light tracking-wide leading-relaxed">
            {reviews.length > 0
              ? 'What people are saying about their Desi Totes.'
              : 'Be the first to share your experience with a Desi Totes bag.'}
          </p>
        </div>

        {/* Rating Header Summary */}
        <div className="rounded-[36px] bg-[#0B1420]/[0.03] p-8 sm:p-10 border border-[#0B1420]/10 shadow-2xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

            {/* Big Score */}
            <div className="md:col-span-4 text-center md:text-left space-y-2 md:border-r md:border-[#0B1420]/10 md:pr-8">
              <span className="text-5xl sm:text-6xl font-serif font-bold text-[#0B1420]">{averageRating ?? '—'}</span>
              <div className="flex items-center justify-center md:justify-start gap-1 text-[#0B1420]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${averageRating && i < Math.round(Number(averageRating)) ? 'fill-[#B87D00]' : 'fill-none text-[#0B1420]/20'}`} />
                ))}
              </div>
              <p className="text-xs text-[#0B1420]/60 font-mono">
                {reviews.length > 0 ? `Based on ${reviews.length} review${reviews.length === 1 ? '' : 's'}` : 'No reviews yet'}
              </p>
            </div>

            {/* Rating distribution bars */}
            <div className="md:col-span-5 space-y-2.5">
              {starDistribution.map((row) => (
                <div key={row.star} className="flex items-center gap-3 text-xs">
                  <span className="w-6 font-mono text-[#0B1420]/60 flex items-center gap-0.5">
                    {row.star}★
                  </span>
                  <div className="flex-1 h-1.5 bg-[#0B1420]/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0B1420] rounded-full"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="w-8 font-mono text-[#0B1420]/50 text-right">{row.pct}%</span>
                </div>
              ))}
            </div>

            {/* Write a review button */}
            <div className="md:col-span-3 text-center md:text-right">
              <button
                onClick={() => {
                  playPop();
                  setModalOpen(true);
                }}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] hover:from-[#05090F] hover:to-[#4a1a10] text-[#F7F2E8] font-semibold text-[10px] uppercase tracking-widest transition-all duration-200 cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-[#B87D00]/15"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write a Review</span>
              </button>
            </div>

          </div>
        </div>

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="text-center py-16 rounded-[36px] border border-dashed border-[#0B1420]/15">
            <p className="text-sm text-[#0B1420]/50 font-light">No reviews yet — yours could be the first.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-[28px] sm:rounded-[32px] bg-[#0B1420]/[0.03] border border-[#0B1420]/10 hover:border-[#B87D00]/40 transition-all space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {rev.avatarUrl ? (
                      <img
                        src={rev.avatarUrl}
                        alt={rev.author}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-white/15"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#0B1420]/20 text-[#0B1420] font-bold flex items-center justify-center font-mono text-sm border border-[#0B1420]/30">
                        {rev.author.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-serif font-medium text-[#0B1420]">{rev.author}</span>
                        {rev.verified && (
                          <span className="flex items-center text-[9px] text-[#0B1420] gap-0.5 font-mono uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3 text-[#0B1420]" /> Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[#0B1420]/50">{rev.city}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#0B1420]/50">{rev.date}</span>
                </div>

                {/* Stars and Title */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[#0B1420]">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-[#B87D00]" />
                    ))}
                  </div>
                  <h4 className="text-sm font-serif font-medium text-[#0B1420]">"{rev.title}"</h4>
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-[#0B1420]/70 leading-relaxed font-light">
                  {rev.comment}
                </p>
              </div>

              {/* Footer tag */}
              <div className="pt-3 border-t border-[#0B1420]/10 flex items-center justify-between text-[10px] text-[#0B1420]/50 font-mono uppercase tracking-wider">
                <span>Model: <strong className="text-[#0B1420]/80 font-normal">{rev.toteModel}</strong></span>
                <span className="flex items-center gap-1 hover:text-[#0B1420] cursor-pointer transition-colors">
                  <ThumbsUp className="w-3 h-3 text-[#0B1420]" /> Helpful
                </span>
              </div>
            </div>
          ))}
        </div>
        )}

      </div>

      {/* Write a review modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-[32px] bg-[#0c0c0f] border border-[#0B1420]/30 p-6 sm:p-8 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-serif font-medium text-white">Share Your Carry Experience</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Rating picker */}
                <div className="space-y-1">
                  <label className="text-white/70 font-medium block">Overall Rating:</label>
                  <div className="flex gap-2 text-[#0B1420]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => {
                          playSnap();
                          setRating(s);
                        }}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${s <= rating ? 'fill-[#B87D00] text-[#B87D00]' : 'text-white/20'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/70 font-medium block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Maya Patel"
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#B87D00] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 font-medium block mb-1">City / Country</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pune, India"
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#B87D00] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/70 font-medium block mb-1">Tote Silhouette</label>
                  <select
                    value={selectedToteModel}
                    onChange={(e) => setToteModel(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#14151a] border border-white/10 text-white focus:outline-none focus:border-[#B87D00] text-xs"
                  >
                    {products.map((p) => (
                      <option key={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white/70 font-medium block mb-1">Review Headline</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Built like an architectural masterpiece"
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#B87D00] text-xs"
                  />
                </div>

                <div>
                  <label className="text-white/70 font-medium block mb-1">Your Thoughts</label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How's the fabric quality? Print detail? Anything else you loved?"
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#B87D00] text-xs resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white/70 font-mono text-[10px] uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] hover:from-[#05090F] hover:to-[#4a1a10] text-[#F7F2E8] font-semibold text-[10px] uppercase tracking-widest shadow-lg shadow-[#B87D00]/20 transition-all cursor-pointer"
                  >
                    Submit Review
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
