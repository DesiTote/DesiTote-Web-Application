import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

/**
 * Terms, Privacy, Refunds, Shipping and Contact.
 *
 * Payment providers check for these before they will let a business take
 * money, and shoppers look for them before they will hand it over. They share
 * one layout so the five stay consistent as the business changes.
 *
 * The details below are the real ones — the address and phone are the same
 * pickup details registered with the courier. Keep BUSINESS in step with
 * reality; it is the single place all five pages read from.
 */

const BUSINESS = {
  name: 'Desi Totes',
  owner: 'Pratik Ambhere',
  address: 'S. No 70/3A/3B, B/105, Shitole Empire, Famous Chowk, Samarth Nagar, New Sangvi, Pimpri Chinchwad, Pune, Maharashtra 411027, India',
  phone: '9823126309',
  email: 'desitotes0401@gmail.com',
  // Shown on every page so customers can see how current the terms are.
  updated: '15 September 2026',
  returnWindowDays: 7,
  refundWorkingDays: '5–7',
  dispatchDays: '2–4',
  deliveryDays: '4–8',
  freeShippingOver: 999,
};

function Page({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-[#0B1420]">{title}</h1>
        <p className="text-xs font-mono text-[#0B1420]/40 mt-1">Last updated {BUSINESS.updated}</p>
      </div>
      <div className="space-y-5 text-sm leading-relaxed text-[#0B1420]/75">{children}</div>
      <p className="pt-6 border-t border-[#0B1420]/10 text-xs text-[#0B1420]/50">
        Questions about this page?{' '}
        <a href={`mailto:${BUSINESS.email}`} className="text-[#B87D00] underline underline-offset-2">
          {BUSINESS.email}
        </a>{' '}
        &middot; <Link to="/contact" className="text-[#B87D00] underline underline-offset-2">Contact us</Link>
      </p>
    </div>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-mono uppercase tracking-widest text-[#B87D00] pt-2">{children}</h2>;
}

export function TermsPage() {
  return (
    <Page title="Terms & Conditions">
      <p>
        These terms apply when you buy from {BUSINESS.name}, a business run by {BUSINESS.owner} from{' '}
        {BUSINESS.address}. By placing an order you agree to them.
      </p>

      <H>What we sell</H>
      <p>
        Cotton canvas tote bags in plain and printed designs, made to order. Because each bag is
        finished after you order it, small variations in print position, stitching and shade are
        normal and are not defects. Product photographs are taken in natural light; colours may
        appear slightly different on your screen.
      </p>

      <H>Orders and pricing</H>
      <p>
        All prices are in Indian Rupees and include GST. Shipping is calculated at checkout from your
        pincode and is free on orders above ₹{BUSINESS.freeShippingOver}. We may decline or cancel an
        order if an item is out of stock, if a price is listed in error, or if we cannot deliver to
        your address — you will be told and refunded in full if you have already paid.
      </p>

      <H>Your account</H>
      <p>
        You need an account to place an order, so that you can track it and we can reach you about
        delivery. Keep your password to yourself; you are responsible for what happens on your
        account.
      </p>

      <H>Payment</H>
      <p>
        We accept Cash on Delivery, and online payments processed by Razorpay. We never see or store
        your card details — those go directly to the payment provider.
      </p>

      <H>Liability</H>
      <p>
        Our responsibility for any order is limited to the amount you paid for it. Nothing here
        limits rights you have under Indian consumer law.
      </p>

      <H>Governing law</H>
      <p>These terms are governed by the laws of India, with courts in Pune, Maharashtra.</p>
    </Page>
  );
}

export function PrivacyPage() {
  return (
    <Page title="Privacy Policy">
      <p>
        This explains what {BUSINESS.name} collects when you use this website, why, and what we do
        with it. We collect as little as we can and we do not sell it to anyone.
      </p>

      <H>What we collect</H>
      <p>
        Your name, email address and mobile number when you create an account; your delivery address
        when you place an order; and the contents of your basket and order history. We keep a record
        of which payment method you chose and whether payment succeeded.
      </p>

      <H>What we never collect</H>
      <p>
        Card numbers, UPI PINs, net-banking passwords and similar. Payments happen on Razorpay's own
        secure page — those details never reach our servers.
      </p>

      <H>Why we need it</H>
      <p>
        To verify your email when you sign up, to take and deliver your order, to email you
        confirmations and updates, and to answer you when you get in touch. We do not send marketing
        email unless you ask us to.
      </p>

      <H>Who else sees it</H>
      <p>
        Only the services needed to run the shop: Razorpay for payments, Shiprocket and the courier
        for delivery, Resend for sending email, Amazon Web Services for hosting product images, and
        MongoDB Atlas for storing orders. Each receives only what that job needs — the courier gets
        your address, the payment provider does not.
      </p>

      <H>How long we keep it</H>
      <p>
        Order records are kept as long as tax and accounting rules require. You can ask us to delete
        your account and personal details at any time by emailing{' '}
        <a href={`mailto:${BUSINESS.email}`} className="text-[#B87D00] underline underline-offset-2">
          {BUSINESS.email}
        </a>
        , and we will do so except where we are legally required to keep an order record.
      </p>

      <H>Your rights</H>
      <p>
        You can ask what we hold about you, ask us to correct it, or ask us to delete it. Email us
        and we will respond within a reasonable time.
      </p>

      <H>Cookies</H>
      <p>
        We use a single cookie to keep you signed in. There are no advertising or tracking cookies on
        this site.
      </p>
    </Page>
  );
}

export function RefundPage() {
  return (
    <Page title="Refund & Cancellation Policy">
      <H>Cancelling an order</H>
      <p>
        You can cancel an order yourself, free of charge, at any time before it is dispatched — open
        the order from <Link to="/orders" className="text-[#B87D00] underline underline-offset-2">My Orders</Link>{' '}
        and choose “Cancel this order”. Once a parcel has been handed to the courier it can no longer
        be cancelled, and you should refuse delivery or request a return instead.
      </p>

      <H>Returns</H>
      <p>
        If something arrives damaged, faulty, or is not what you ordered, tell us within{' '}
        {BUSINESS.returnWindowDays} days of delivery and we will replace it or refund you in full,
        including the delivery charge. Email{' '}
        <a href={`mailto:${BUSINESS.email}`} className="text-[#B87D00] underline underline-offset-2">
          {BUSINESS.email}
        </a>{' '}
        with your order number and a photograph and we will arrange collection.
      </p>
      <p>
        Because every bag is made to order, we cannot accept returns simply because you changed your
        mind once the bag has been used or washed. Unused bags in their original condition can be
        returned within {BUSINESS.returnWindowDays} days; return postage is yours unless the fault
        was ours.
      </p>

      <H>Refunds</H>
      <p>
        Once a cancellation or return is accepted, refunds are issued to the original payment method
        within {BUSINESS.refundWorkingDays} working days. Your bank may take a few days more to show
        it. Cash on Delivery orders that were never paid for have nothing to refund; where a COD
        order has already been paid, we will collect your bank details to make the transfer.
      </p>
    </Page>
  );
}

export function ShippingPage() {
  return (
    <Page title="Shipping & Delivery Policy">
      <H>Where we deliver</H>
      <p>
        Anywhere in India that our courier partners serve. Enter your pincode at checkout to see the
        exact delivery charge for your address before you pay.
      </p>

      <H>Charges</H>
      <p>
        Shipping is calculated per order from your pincode, the weight of the parcel and the courier
        chosen. Orders above ₹{BUSINESS.freeShippingOver} ship free.
      </p>

      <H>How long it takes</H>
      <p>
        Every bag is made to order, so we need {BUSINESS.dispatchDays} working days to finish and pack
        yours. Delivery then usually takes a further {BUSINESS.deliveryDays} working days depending on
        where you are. Remote pincodes and festival periods can take longer.
      </p>

      <H>Tracking</H>
      <p>
        You will get an email when your order is confirmed and again when it is dispatched. The
        tracking number appears on your order page under{' '}
        <Link to="/orders" className="text-[#B87D00] underline underline-offset-2">My Orders</Link> once
        the courier has collected the parcel.
      </p>

      <H>If something goes wrong</H>
      <p>
        If your parcel has not moved for several days, or arrives damaged, email{' '}
        <a href={`mailto:${BUSINESS.email}`} className="text-[#B87D00] underline underline-offset-2">
          {BUSINESS.email}
        </a>{' '}
        with your order number and we will chase the courier for you.
      </p>
    </Page>
  );
}

export function ContactPage() {
  return (
    <Page title="Contact Us">
      <p>
        We are a small business and we answer our own email — usually within one working day.
      </p>

      <div className="rounded-2xl border border-[#0B1420]/10 bg-white/60 p-5 space-y-3 not-prose">
        <p className="flex items-start gap-3">
          <Mail className="w-4 h-4 text-[#B87D00] mt-0.5 shrink-0" />
          <a href={`mailto:${BUSINESS.email}`} className="text-[#B87D00] underline underline-offset-2">
            {BUSINESS.email}
          </a>
        </p>
        <p className="flex items-start gap-3">
          <Phone className="w-4 h-4 text-[#B87D00] mt-0.5 shrink-0" />
          <a href={`tel:+91${BUSINESS.phone}`} className="text-[#B87D00] underline underline-offset-2">
            +91 {BUSINESS.phone}
          </a>
        </p>
        <p className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-[#B87D00] mt-0.5 shrink-0" />
          <span>
            {BUSINESS.name} ({BUSINESS.owner})
            <br />
            {BUSINESS.address}
          </span>
        </p>
      </div>

      <H>About an order</H>
      <p>
        Please include your order number — it looks like ORD-2026-000001 and is on your confirmation
        email and your{' '}
        <Link to="/orders" className="text-[#B87D00] underline underline-offset-2">order page</Link>. That
        lets us answer in one reply instead of three.
      </p>

      <H>Bulk and custom orders</H>
      <p>
        We print for events, shops and gifting. Email us with the quantity, the design and the date
        you need them by, and we will come back with a price.
      </p>
    </Page>
  );
}
