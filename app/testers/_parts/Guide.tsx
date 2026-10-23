"use client";
import { MONTHLY_MIN, STATUSES, type Status } from "@/lib/testers/model";
import { Icon, StatusPill, cssVar } from "./ui";

const MEANS: Record<Status, string> = {
  new: "Just reported. The team hasn't looked yet.",
  confirmed: "The team can see it happening too. It's on the list.",
  fixing: "Someone is working on it right now.",
  fixed: "Fixed. It goes out with the next update.",
  live: "The fix is in the version you can download today.",
  cant: "We couldn't make it happen. More detail or a recording helps.",
  wont: "Working as intended, or not something we'll change.",
  dup: "Already on the board. Your Me too is counted there.",
};

export default function Guide() {
  return (
    <>
      <div className="th-sechead"><div><div className="th-eye">Guide</div><h1 className="th-h1" style={{ fontSize: "clamp(30px,5vw,42px)" }}>How testing works</h1>
        <p>Everything you need, in one place.</p></div></div>
      <div className="th-guide">
        <div className="th-card th-gc wide th-expect" style={cssVar("#f472b6")}>
          <span className="ic"><Icon n="flag" /></span>
          <h3 className="th-h3">What we expect from testers</h3>
          <div className="rule"><b>{MONTHLY_MIN}</b>new bug reports, every month</div>
          <ul>
            <li>Submit at least <strong>{MONTHLY_MIN} new bug reports each calendar month</strong>. Your Home page shows how many you have so far.</li>
            <li>Only your own new reports count. Me too and comments are welcome, but they don&apos;t count toward your number.</li>
            <li>Testers who submit fewer than {MONTHLY_MIN} reports in a month will be removed from the program, and their tester access will end.</li>
          </ul>
        </div>
        <div className="th-card th-gc" style={cssVar("#22d3ee")}>
          <span className="ic"><Icon n="phone" /></span>
          <h3 className="th-h3">Get Sentience</h3>
          <p>Always test on the newest version. Update before you report, so we&apos;re looking at the same game.</p>
          <div className="acts">
            <a className="th-btn gh sm" href="https://apps.apple.com/us/app/sentience-life-sim/id6759975000" target="_blank" rel="noreferrer">App Store</a>
            <a className="th-btn gh sm" href="https://play.google.com/store/apps/details?id=com.sentience.app" target="_blank" rel="noreferrer">Google Play</a>
          </div>
        </div>
        <div className="th-card th-gc" style={cssVar("#a855f7")}>
          <span className="ic"><Icon n="key" /></span>
          <h3 className="th-h3">Unlock your tester access</h3>
          <ol>
            <li>Open Sentience and tap <strong>Premium Store</strong>.</li>
            <li>Scroll to <strong>Have an access code?</strong> and tap <strong>Redeem Access Code</strong>.</li>
            <li>Enter your personal code. Everything opens up.</li>
          </ol>
          <p>Your code belongs to one account, so please keep it to yourself.</p>
        </div>
        <div className="th-card th-gc" style={cssVar("#f472b6")}>
          <span className="ic"><Icon n="camera" /></span>
          <h3 className="th-h3">Capture the moment</h3>
          <ul>
            <li><strong>iPhone screenshot:</strong> press the side button and volume up together.</li>
            <li><strong>iPhone recording:</strong> open Control Center and tap Screen Recording.</li>
            <li><strong>Android screenshot:</strong> press power and volume down together.</li>
            <li><strong>Android recording:</strong> swipe down twice and tap Screen record.</li>
          </ul>
          <p>A short recording is the fastest way to a fix.</p>
        </div>
        <div className="th-card th-gc" style={cssVar("#fbbf24")}>
          <span className="ic"><Icon n="pen" /></span>
          <h3 className="th-h3">Write a great report</h3>
          <ul>
            <li>Search the board first. If it&apos;s there, tap <strong>Me too</strong>.</li>
            <li>One bug per report.</li>
            <li>Say what you tapped, step by step, and what you expected.</li>
            <li>Add a screenshot or a recording.</li>
            <li>Include your app version. You&apos;ll find it in your phone&apos;s App Store or Play Store listing.</li>
          </ul>
        </div>
        <div className="th-card th-gc wide" style={cssVar("#818cf8")}>
          <span className="ic"><Icon n="flag" /></span>
          <h3 className="th-h3">What each status means</h3>
          <div className="th-keys">{STATUSES.map((s) => <div key={s}><StatusPill s={s} /><span>{MEANS[s]}</span></div>)}</div>
          <p className="th-dim" style={{ fontSize: 12.5 }}>Every report that reaches Confirmed or beyond counts toward Top finders.</p>
        </div>
        <div className="th-card th-gc" style={cssVar("#34d399")}>
          <span className="ic"><Icon n="bulb" /></span>
          <h3 className="th-h3">Ideas and wishes</h3>
          <p>This board is for bugs. Feature ideas live on the Player Voices board, where everyone can vote.</p>
          <div className="acts"><a className="th-btn gh sm" href="https://www.sentiencelifesim.com/voices.html" target="_blank" rel="noreferrer">Open Player Voices</a></div>
        </div>
        <div className="th-card th-gc" style={cssVar("#60a5fa")}>
          <span className="ic"><Icon n="lock" /></span>
          <h3 className="th-h3">Keep it between us</h3>
          <p>Some of what you see isn&apos;t out yet. Please don&apos;t post unreleased features or screenshots publicly until they launch.</p>
          <p>Need help? Write to <a href="mailto:support@sublimelabs.tech" style={{ color: "#a5f3fc" }}>support@sublimelabs.tech</a></p>
        </div>
      </div>
    </>
  );
}
