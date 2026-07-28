import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ChevronLeft, ChevronRight, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import './styles.css';

const asset = './assets/site/';

const text = {
  home: '\u9996\u9875',
  company: '\u5173\u4e8e\u6211\u4eec',
  profile: '\u4e2a\u4eba\u4ecb\u7ecd',
  training: '\u7ebf\u4e0b\u57f9\u8bad',
  trainingSite: '\u7ebf\u4e0b\u57f9\u8bad\u73b0\u573a',
  servedIp: '\u670d\u52a1\u8fc7\u7684IP',
  contact: '\u8054\u7cfb\u6211\u4eec',
  brand: '\u826f\u58e4',
  tagline: '\u8ba9\u7ed3\u679c\u751f\u957f\u7684\u5730\u65b9',
  heroLine: '\u6211\u4eec\u53ea\u505a\u6709\u7ed3\u679c\u7684IP',
  cooperate: '\u8054\u7cfb\u5408\u4f5c',
  companySubtitle: '\u5934\u90e8IP\u5546\u4e1a\u5408\u4f5c | \u77e5\u8bc6\u4ed8\u8d39 | MCN',
  companyBody: '\u4e2d\u56fd\u8d85\u5934\u90e8 IP \u6392\u671f\u5408\u4f5c\u7684\u5546\u4e1a\u5316\u673a\u6784\uff0c\u76f4\u63a5\u53c2\u4e0e\u6d41\u91cf\u7834\u5708\u4e0e\u5546\u4e1a\u8f6c\u5316\u3002\u9879\u76ee\u901a\u8fc7\u9080\u7ea6\u4e0e\u7b5b\u9009\u65b9\u5f0f\u5408\u4f5c\uff0c\u826f\u58e4\u5728\u81ea\u5a92\u4f53\u4e0e\u6559\u80b2 IP \u884c\u4e1a\u5177\u6709\u7a33\u5b9a\u5f71\u54cd\u529b\uff0c\u4e1a\u52a1\u6a2a\u8de8\u4e2d\u56fd\u53ca\u4e1c\u5357\u4e9a\u3001\u53f0\u6e7e\u3001\u9999\u6e2f\u3001\u5317\u7f8e\u5730\u533a\u3002',
  personName: '\u7ae5\u7ae5 / Tracy',
  personBody: '\u4e13\u6ce8\u521b\u59cb\u4eba IP \u5b75\u5316',
  personBody2: '\u670d\u52a1\u4e0a\u5343\u4f4d\u8001\u677f\uff0c\u64cd\u76d8\u591a\u4e2a\u5934\u90e8 IP',
  personBody3: '18 \u5e74 IP \u5546\u4e1a\u64cd\u76d8\u7ecf\u9a8c',
  personBody4: '\u5927\u5b66\u526f\u6559\u6388 | \u53cc\u5e73\u53f0\u5b98\u65b9\u8bb2\u5e08',
  personBody5: '\u670d\u52a1\u4f01\u4e1a\u5bb6\u3001\u521b\u59cb\u4eba\uff0c\u5546\u4e1a IP \u8d85 2 \u4e07',
  trainingBody: '\u6211\u4eec\u6301\u7eed\u5f00\u5c55\u9762\u5411\u4e2a\u4eba\u4e0e\u4f01\u4e1a\u7684\u7ebf\u4e0b\u6210\u957f\u4e0e\u80fd\u529b\u63d0\u5347\u57f9\u8bad\uff0c\u56f4\u7ed5\u54c1\u724c\u8ba4\u77e5\u3001\u5185\u5bb9\u521b\u4f5c\u4e0e\u5546\u4e1a\u8f6c\u5316\u7b49\u6838\u5fc3\u65b9\u5411\uff0c\u901a\u8fc7\u7cfb\u7edf\u5316\u8bfe\u7a0b\u8bbe\u8ba1\u4e0e\u5b9e\u6218\u6f14\u7ec3\uff0c\u5e2e\u52a9\u5b66\u5458\u5728\u771f\u5b9e\u573a\u666f\u4e2d\u5b8c\u6210\u80fd\u529b\u8dc3\u8fc1\u3002',
  more: '\u67e5\u770b\u66f4\u591a',
  servedBody: '\u6211\u4eec\u957f\u671f\u4e3a\u5404\u7c7b\u4e2a\u4eba IP \u4e0e\u5185\u5bb9\u54c1\u724c\u63d0\u4f9b\u7cfb\u7edf\u5316\u652f\u6301\uff0c\u6db5\u76d6\u5b9a\u4f4d\u7b56\u5212\u3001\u5185\u5bb9\u4f53\u7cfb\u642d\u5efa\u3001\u89c6\u89c9\u8868\u8fbe\u4f18\u5316\u4e0e\u5546\u4e1a\u8def\u5f84\u8bbe\u8ba1\u7b49\u591a\u4e2a\u73af\u8282\u3002',
  address: '\u676d\u5dde\u5e02\u8427\u5c71\u533a\u667a\u6167\u8c372\u671fA\u680b1005',
  scan: '\u70b9\u51fb\u626b\u7801',
};

const navItems = [
  { label: text.home, href: '#home' },
  { label: text.company, href: '#company' },
  { label: text.profile, href: '#profile' },
  { label: text.training, href: '#training' },
  { label: text.servedIp, href: '#served-ip' },
  { label: text.contact, href: '#contact' },
];

const companyImages = ['about-2.jpg', 'about-5.jpg', 'about-6.jpg', 'about-7.jpg', 'about-15.jpg'];
const trainings = [
  'training-new-05.jpg', 'training-extra-12.jpg', 'training-new-12.jpg', 'training-extra-03.jpg', 'training-new-02.jpg',
  'training-extra-18.jpg', 'training-new-16.jpg', 'training-extra-07.jpg', 'training-new-09.jpg', 'training-extra-21.jpg',
  'training-new-14.jpg', 'training-extra-01.jpg', 'training-new-03.jpg', 'training-extra-15.jpg', 'training-new-18.jpg',
  'training-extra-09.jpg', 'training-new-07.jpg', 'training-extra-22.jpg', 'training-new-11.jpg', 'training-extra-05.jpg',
  'training-new-01.jpg', 'training-extra-14.jpg', 'training-new-15.jpg', 'training-extra-02.jpg', 'training-new-08.jpg',
  'training-extra-20.jpg', 'training-new-19.jpg', 'training-extra-10.jpg', 'training-new-04.jpg', 'training-extra-16.jpg',
  'training-new-13.jpg', 'training-extra-06.jpg', 'training-new-06.jpg', 'training-extra-19.jpg', 'training-new-17.jpg',
  'training-extra-11.jpg', 'training-new-10.jpg', 'training-extra-04.jpg', 'training-extra-13.jpg', 'training-extra-08.jpg',
];
const servedIps = ['ip-1.jpg', 'ip-2.jpg', 'ip-3.jpg', 'ip-4.jpg', 'ip-5.jpg', 'ip-6.jpg', 'ip-7.jpg', 'ip-8.jpg'];

function App() {
  useEffect(() => {
    document.body.classList.add('is-opening');

    const motionTargets = document.querySelectorAll('.section, .contact');
    const motionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          motionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });

    motionTargets.forEach((target) => motionObserver.observe(target));

    const finishOpening = () => {
      window.setTimeout(() => {
        document.body.classList.remove('is-opening');
        document.body.classList.add('is-opening-complete');
      }, 140);
    };

    if (document.readyState === 'complete') {
      finishOpening();
    } else {
      window.addEventListener('load', finishOpening, { once: true });
    }

    return () => {
      window.removeEventListener('load', finishOpening);
      motionObserver.disconnect();
      document.body.classList.remove('is-opening', 'is-opening-complete');
    };
  }, []);

  return (
    <>
      <div className="openingCurtain" aria-hidden="true" />
      <Header />
      <main>
        <Hero />
        <Company />
        <Profile />
        <Training />
        <ServedIp />
        <Contact />
      </main>
    </>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="siteHeader animate-fade-up delay-1">
      <div className="wide headerInner">
        <a className="brand" href="#home" aria-label={`${text.brand}${text.home}`}>
          <img src={`${asset}logo.png`} alt={text.brand} />
          <span className="brandLine" />
          <span>{text.tagline}</span>
        </a>
        <nav className="navLinks" aria-label="main navigation">
          {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div className="headerActions">
          <a className="contactPill" href="#contact"><span>{text.cooperate}</span><ArrowUpRight size={16} strokeWidth={2.4} /></a>
          <button className="menuToggle liquid-glass" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobileNav liquid-glass" aria-label="Mobile navigation">
          {navItems.map((item) => <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}
        </nav>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="heroImageBg" aria-hidden="true">
        <img className="heroBaseImage" src={`${asset}tech-seedling-2.jpg`} alt="" loading="eager" decoding="async" fetchPriority="high" />
        <span className="heroSeedlingMotion" />
      </div>
      <div className="heroVeil" />
      <div className="wide heroInner">
        <h1 className="gradientText"><span>{text.brand}</span><i aria-hidden="true" /><span>{text.tagline}</span></h1>
        <p>{text.heroLine}</p>
        <div className="heroActions"><a className="heroButton primaryHero" href="#contact">{text.cooperate}</a></div>
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title }) {
  return <div className="sectionTitle"><p>{eyebrow}</p><h2>{title}</h2><span /></div>;
}

function Company() {
  const [active, setActive] = useState(0);
  const move = (direction) => setActive((value) => (value + direction + companyImages.length) % companyImages.length);

  return (
    <section className="section company" id="company">
      <div className="wide companyGrid">
        <div className="companyCopy">
          <SectionTitle eyebrow="About Us" title={text.company} />
          <h3>{text.companySubtitle}</h3>
          <p>{text.companyBody}</p>
        </div>
        <div className="mediaCarousel stagger-in" style={{ '--stagger': 2 }} aria-label="Company image carousel">
          <img src={`${asset}${companyImages[active]}`} alt="Company profile" loading="lazy" decoding="async" />
          <button className="iconButton prev" type="button" onClick={() => move(-1)} aria-label="Previous image"><ChevronLeft size={18} /></button>
          <button className="iconButton next" type="button" onClick={() => move(1)} aria-label="Next image"><ChevronRight size={18} /></button>
        </div>
      </div>
    </section>
  );
}

function Profile() {
  return (
    <section className="section compact profileStage" id="profile">
      <div className="wide profileHonorGrid">
        <div className="profileCopy">
          <SectionTitle eyebrow="Self-introduction" title={text.profile} />
          <h3>{text.personName}</h3>
          <p>{text.personBody}<br />{text.personBody2}<br />{text.personBody3}<br />{text.personBody4}<br />{text.personBody5}</p>
        </div>
        <div className="profileVisual stagger-in" style={{ '--stagger': 1 }}>
          <div className="portraitFrame"><img src={`${asset}person-cutout.png`} alt="Tracy portrait" loading="lazy" decoding="async" /></div>
        </div>
      </div>
    </section>
  );
}

function Training() {
  const trainingSplit = Math.ceil(trainings.length / 2);

  return (
    <section className="section" id="training">
      <div className="wide">
        <SectionTitle eyebrow="Offline training site" title={text.trainingSite} />
        <p className="sectionLead">{text.trainingBody}</p>
        <div className="trainingMarqueeRows">
          <ImageMarquee images={trainings.slice(0, trainingSplit)} altPrefix={text.trainingSite} direction="left" cardClass="trainingCard" />
          <ImageMarquee images={trainings.slice(trainingSplit)} altPrefix={text.trainingSite} direction="right" cardClass="trainingCard" />
        </div>
        <div className="moreTraining"><a href="./training-gallery.html">{text.more}</a></div>
      </div>
    </section>
  );
}

function ServedIp() {
  return (
    <section className="section" id="served-ip">
      <div className="wide">
        <SectionTitle eyebrow="Served IP" title={text.servedIp} />
        <p className="sectionLead">{text.servedBody}</p>
        <div className="ipMarqueeWrap"><ImageMarquee images={servedIps} altPrefix={text.servedIp} direction="left" cardClass="ipCard" /></div>
      </div>
    </section>
  );
}

function ImageMarquee({ images, altPrefix, direction, cardClass }) {
  const repeated = [...images, ...images];

  return (
    <div className={`marqueeRow ${direction === 'right' ? 'reverse' : ''}`}>
      <div className="marqueeTrack">
        {repeated.map((name, index) => (
          <figure className={`${cardClass} stagger-in`} style={{ '--stagger': index % images.length }} key={`${name}-${index}`}>
            <img src={`${asset}${name}`} alt={`${altPrefix} ${(index % images.length) + 1}`} loading="lazy" decoding="async" />
          </figure>
        ))}
      </div>
    </div>
  );
}

function Contact() {
  return (
    <footer className="contact" id="contact">
      <div className="wide contactGrid">
        <div>
          <SectionTitle eyebrow="Contact Us" title={text.contact} />
          <div className="contactRows">
            <span><MapPin size={23} /> {text.address}</span>
            <span><Phone size={22} /> 13271925888</span>
            <span><Mail size={24} /> 32329019@qq.com</span>
          </div>
        </div>
        <div className="qrArea"><img src={`${asset}qr.jpg`} alt="QR code" loading="lazy" decoding="async" /><p>{text.scan}<br />{text.contact}</p></div>
      </div>
    </footer>
  );
}

createRoot(document.getElementById('root')).render(<App />);
