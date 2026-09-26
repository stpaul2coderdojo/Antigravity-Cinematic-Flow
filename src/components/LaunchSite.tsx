import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Aperture,
  AudioLines,
  Bot,
  Github,
  Layers3,
  Play,
  Sparkles,
  WandSparkles,
} from 'lucide-react';

interface LaunchSiteProps {
  onEnterStudio: () => void;
}

const features = [
  { number: '01', icon: Bot, title: 'Narrative agents', copy: 'Turn one line into a character bible, dramatic arc, and production-ready scene plan.' },
  { number: '02', icon: Aperture, title: 'Living keyframes', copy: 'Forge cinematic characters and consistent visual worlds with generative image direction.' },
  { number: '03', icon: Layers3, title: 'Flow timeline', copy: 'Shape every ten-second shot, transition, grade, and camera move in one visual sequence.' },
  { number: '04', icon: AudioLines, title: 'Voice & cinema', copy: 'Direct performance, synthesize dialogue, preview the cut, and export the complete production.' },
];

export const LaunchSite: React.FC<LaunchSiteProps> = ({ onEnterStudio }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={`launch-site ${loaded ? 'is-loaded' : ''}`}>
      <div className="launch-grain" aria-hidden="true" />
      <div className="launch-orbit launch-orbit-one" aria-hidden="true" />
      <div className="launch-orbit launch-orbit-two" aria-hidden="true" />

      <header className="launch-nav">
        <button className="launch-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Antigravity home">
          <span className="launch-brand-mark"><Aperture size={19} /></span>
          <span>ANTIGRAVITY</span>
          <span className="launch-brand-sub">CINEMATIC FLOW</span>
        </button>
        <div className="launch-nav-actions">
          <a href="https://github.com/stpaul2coderdojo/Antigravity-Cinematic-Flow" target="_blank" rel="noreferrer" className="launch-github">
            <Github size={16} /> <span>View source</span>
          </a>
          <button onClick={onEnterStudio} className="launch-nav-cta">Open studio <ArrowRight size={15} /></button>
        </div>
      </header>

      <main>
        <section className="launch-hero">
          <div className="launch-eyebrow"><span /> Autonomous cinema, directed by you</div>
          <h1>
            Stories no longer<br />
            wait to be <em>made.</em>
          </h1>
          <p className="launch-deck">
            An agentic filmmaking studio that transforms a spark into characters, scenes,
            sound, and a finished cinematic flow.
          </p>
          <div className="launch-hero-actions">
            <button onClick={onEnterStudio} className="launch-primary">
              <Play size={16} fill="currentColor" /> Enter the studio
            </button>
            <button onClick={() => document.getElementById('launch-process')?.scrollIntoView({ behavior: 'smooth' })} className="launch-secondary">
              Explore the process <ArrowRight size={16} />
            </button>
          </div>

          <div className="launch-stage" aria-label="Cinematic production preview">
            <div className="stage-sun" />
            <div className="stage-horizon" />
            <div className="stage-grid" />
            <div className="stage-beam" />
            <div className="stage-vignette" />
            <div className="stage-topline">
              <span>AG // SEQUENCE 01</span>
              <span className="stage-live"><i /> AGENT SWARM ONLINE</span>
              <span>2.39:1 / 24 FPS</span>
            </div>
            <div className="stage-center-copy">
              <span>FROM IDEA</span>
              <strong>TO IMPOSSIBLE</strong>
            </div>
            <div className="stage-timeline">
              <span className="stage-time">00:00:00:00</span>
              <div className="stage-track">
                <i /><b /><b /><b /><b /><b />
              </div>
              <span>ACT I</span>
            </div>
          </div>

          <div className="launch-scroll-cue"><span /> Scroll to begin</div>
        </section>

        <section id="launch-process" className="launch-process">
          <div className="launch-section-intro">
            <span className="launch-kicker">The production system</span>
            <h2>One vision.<br /><em>A whole crew of intelligence.</em></h2>
            <p>Antigravity coordinates specialized agents across the entire creative pipeline—while you keep the final cut.</p>
          </div>

          <div className="launch-feature-grid">
            {features.map(({ number, icon: Icon, title, copy }) => (
              <article className="launch-feature" key={number}>
                <div className="feature-meta"><span>{number}</span><Icon size={24} /></div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="launch-manifesto">
          <WandSparkles size={29} />
          <p>“The camera is no longer a barrier.<br />It is a conversation.”</p>
          <span>Direct the thought. Shape the world. Make the cut.</span>
        </section>

        <section className="launch-final">
          <div className="launch-final-glow" />
          <Sparkles size={26} />
          <h2>Your next world<br />starts with a sentence.</h2>
          <p>Step into Antigravity and direct what happens next.</p>
          <button onClick={onEnterStudio} className="launch-primary launch-final-cta">
            Launch cinematic flow <ArrowRight size={17} />
          </button>
        </section>
      </main>

      <footer className="launch-footer">
        <div><Aperture size={16} /> ANTIGRAVITY CINEMATIC FLOW</div>
        <span>Agentic filmmaking for impossible stories.</span>
        <a href="https://github.com/stpaul2coderdojo/Antigravity-Cinematic-Flow" target="_blank" rel="noreferrer"><Github size={15} /> GitHub</a>
      </footer>
    </div>
  );
};
