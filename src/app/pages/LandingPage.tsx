import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Target, CheckCircle, ArrowRight, Sparkles, Building2, Wallet, Linkedin, Facebook, Instagram } from 'lucide-react';
import logoGalsen from '../images/logogalsen_invest.png';

// Hook pour animer les compteurs
function useCountUp(end: number, duration: number = 2000, shouldStart: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, shouldStart]);

  return count;
}

export function LandingPage() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Observer pour déclencher l'animation des stats au scroll
  // L'animation se réinitialise à chaque fois qu'on entre/sort de la vue
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Active l'animation quand visible, désactive quand invisible
        setStatsVisible(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Valeurs des statistiques
  const projectsCount = useCountUp(127, 2000, statsVisible);
  const amountRaised = useCountUp(2500000000, 2500, statsVisible);
  const investorsCount = useCountUp(1543, 2000, statsVisible);
  const successRate = useCountUp(87, 2000, statsVisible);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-galsen-green/5">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoGalsen} alt="Galsen Invest" className="h-10 md:h-12" />
              <span className="text-xl md:text-2xl font-bold text-galsen-blue">Galsen Invest</span>
            </div>
            <Link
              to="/login"
              className="px-4 md:px-6 py-2 md:py-3 bg-galsen-green hover:bg-galsen-green/90 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              Connexion
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section avec logo en fond */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Logo en arrière-plan - PLUS GRAND et animation continue */}
        <div className="absolute inset-0 flex items-center justify-center opacity-8 pointer-events-none">
          <img 
            src={logoGalsen} 
            alt="" 
            className="w-full max-w-6xl lg:max-w-7xl object-contain"
            style={{ 
              animation: 'pulse-continuous 4s ease-in-out infinite'
            }}
          />
        </div>
        
        {/* Animation CSS pour pulse continu */}
        <style>{`
          @keyframes pulse-continuous {
            0%, 100% { 
              opacity: 0.08;
              transform: scale(1);
            }
            50% { 
              opacity: 0.12;
              transform: scale(1.05);
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes slide {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
        `}</style>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-galsen-gold/10 border border-galsen-gold/30 rounded-full">
              <Sparkles className="w-4 h-4 text-galsen-gold" />
              <span className="text-sm font-medium text-galsen-gold">Plateforme de Crowdfunding #1 au Sénégal</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-galsen-blue leading-tight">
              Investissez dans l'avenir
              <br />
              <span className="text-galsen-green">du Sénégal</span>
            </h1>

            <p className="text-lg md:text-xl text-galsen-blue/70 max-w-3xl mx-auto">
              Galsen Invest connecte les entrepreneurs sénégalais ambitieux avec des investisseurs 
              qui croient en leur vision. Ensemble, construisons l'économie de demain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-galsen-green hover:bg-galsen-green/90 text-white font-semibold rounded-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2 text-lg"
              >
                Commencer à investir
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register/business"
                className="px-8 py-4 bg-white hover:bg-galsen-blue/5 text-galsen-blue font-semibold rounded-lg transition-all border-2 border-galsen-blue flex items-center gap-2 text-lg"
              >
                Lever des fonds
                <Building2 className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques animées - déclenchées au scroll */}
      <section ref={statsRef} className="py-16 md:py-24 bg-gradient-to-r from-galsen-green to-galsen-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            <div className={`text-center transform transition-all duration-1000 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                {statsVisible ? projectsCount : 0}+
              </div>
              <div className="text-white/80 text-sm md:text-base">Projets financés</div>
            </div>

            <div className={`text-center transform transition-all duration-1000 delay-200 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                {statsVisible ? new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(amountRaised) : '0'}
              </div>
              <div className="text-white/80 text-sm md:text-base">FCFA levés</div>
            </div>

            <div className={`text-center transform transition-all duration-1000 delay-500 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                {statsVisible ? investorsCount : 0}+
              </div>
              <div className="text-white/80 text-sm md:text-base">Investisseurs actifs</div>
            </div>

            <div className={`text-center transform transition-all duration-1000 delay-700 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                {statsVisible ? successRate : 0}%
              </div>
              <div className="text-white/80 text-sm md:text-base">Taux de réussite</div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-galsen-blue mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-galsen-blue/70 max-w-2xl mx-auto">
              Un processus simple et transparent pour investir ou lever des fonds
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            {/* Pour les investisseurs */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="w-8 h-8 text-galsen-green" />
                <h3 className="text-2xl font-bold text-galsen-blue">Pour les investisseurs</h3>
              </div>

              <div className="space-y-4">
                {[
                  { step: '1', title: 'Créez votre compte', desc: 'Inscrivez-vous gratuitement et complétez votre profil KYC' },
                  { step: '2', title: 'Parcourez les projets', desc: 'Découvrez des projets vérifiés dans divers secteurs' },
                  { step: '3', title: 'Investissez en toute sécurité', desc: 'Choisissez vos projets et investissez à partir de 10 000 FCFA' }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 rounded-lg hover:bg-galsen-green/5 transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 bg-galsen-green text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-galsen-blue mb-1">{item.title}</h4>
                      <p className="text-sm text-galsen-blue/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pour les entrepreneurs */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-8 h-8 text-galsen-gold" />
                <h3 className="text-2xl font-bold text-galsen-blue">Pour les entrepreneurs</h3>
              </div>

              <div className="space-y-4">
                {[
                  { step: '1', title: 'Enregistrez votre entreprise', desc: 'Créez un compte entreprise avec vos documents légaux' },
                  { step: '2', title: 'Créez votre campagne', desc: 'Présentez votre projet, définissez votre objectif de financement' },
                  { step: '3', title: 'Levez des fonds', desc: 'Après validation, lancez votre campagne et collectez les fonds' }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 rounded-lg hover:bg-galsen-gold/5 transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 bg-galsen-gold text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-galsen-blue mb-1">{item.title}</h4>
                      <p className="text-sm text-galsen-blue/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages - Carousel animé en continu */}
      <section className="py-16 md:py-24 bg-galsen-blue/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-galsen-blue mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-lg text-galsen-blue/70">
              Découvrez les témoignages de notre communauté
            </p>
          </div>

          {/* Carousel avec défilement automatique */}
          <div className="relative">
            <div className="flex gap-8 animate-scroll">
              {/* Dupliquer les témoignages pour un défilement infini */}
              {[...Array(2)].map((_, dupIndex) => (
                <React.Fragment key={dupIndex}>
                  {[
                    {
                      name: 'Aminata Diallo',
                      role: 'Investisseuse',
                      avatar: '👩🏿‍💼',
                      text: 'Grâce à Galsen Invest, j\'ai pu diversifier mon portefeuille en soutenant des projets innovants au Sénégal. Une plateforme sécurisée et transparente.'
                    },
                    {
                      name: 'Moussa Ndiaye',
                      role: 'CEO, AgriTech Solutions',
                      avatar: '👨🏿‍💼',
                      text: 'Nous avons levé 15M FCFA en 3 semaines pour notre projet agricole. L\'équipe de Galsen Invest nous a accompagnés à chaque étape.'
                    },
                    {
                      name: 'Fatou Sall',
                      role: 'Investisseuse',
                      avatar: '👩🏿',
                      text: 'J\'apprécie la sélection rigoureuse des projets et le suivi détaillé de mes investissements. Une vraie révolution pour l\'investissement au Sénégal !'
                    },
                    {
                      name: 'Abdoulaye Ba',
                      role: 'Investisseur',
                      avatar: '👨🏿',
                      text: 'Interface intuitive et processus transparent. J\'ai investi dans 5 projets en quelques clics. Le suivi en temps réel est excellent.'
                    },
                    {
                      name: 'Marième Sarr',
                      role: 'CEO, EduTech Sénégal',
                      avatar: '👩🏿‍💼',
                      text: 'Grâce à cette plateforme, nous avons réussi notre levée de fonds. Un accompagnement professionnel du début à la fin.'
                    }
                  ].map((testimonial, index) => (
                    <div 
                      key={`${dupIndex}-${index}`} 
                      className="bg-white rounded-xl shadow-lg p-6 min-w-[350px] hover:shadow-xl transition-all hover:scale-105"
                      style={{ animation: 'float 3s ease-in-out infinite', animationDelay: `${index * 0.5}s` }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl">{testimonial.avatar}</div>
                        <div>
                          <div className="font-semibold text-galsen-blue">{testimonial.name}</div>
                          <div className="text-sm text-galsen-blue/60">{testimonial.role}</div>
                        </div>
                      </div>
                      <p className="text-galsen-blue/70 italic text-sm">"{testimonial.text}"</p>
                      <div className="flex gap-1 mt-4">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-galsen-gold">★</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        
        {/* CSS pour l'animation de défilement */}
        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
          
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-galsen-green to-galsen-blue">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Prêt à commencer votre aventure ?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Rejoignez des milliers d'investisseurs et entrepreneurs qui transforment le Sénégal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white hover:bg-galsen-blue/5 text-galsen-blue font-semibold rounded-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 text-lg"
            >
              Créer un compte
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-galsen-gold hover:bg-galsen-gold/90 text-white font-semibold rounded-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 text-lg"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-galsen-blue text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src={logoGalsen} alt="Galsen Invest" className="h-10 mb-4 brightness-0 invert" />
              <p className="text-white/70 text-sm mb-4">
                La plateforme de crowdfunding qui connecte entrepreneurs et investisseurs au Sénégal.
              </p>
              
              {/* Réseaux sociaux */}
              <div className="flex gap-3 mt-4">
                <a 
                  href="https://www.linkedin.com/company/galsen-invest" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-galsen-green hover:bg-galsen-gold rounded-lg transition-all hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.facebook.com/galseninvest" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-galsen-green hover:bg-galsen-gold rounded-lg transition-all hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.instagram.com/galseninvest" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-galsen-green hover:bg-galsen-gold rounded-lg transition-all hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Investisseurs</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/campaigns" className="hover:text-galsen-gold transition-colors">Projets</Link></li>
                <li><Link to="/register" className="hover:text-galsen-gold transition-colors">S'inscrire</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entrepreneurs</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/register/business" className="hover:text-galsen-gold transition-colors">Créer une campagne</Link></li>
                <li><Link to="/login" className="hover:text-galsen-gold transition-colors">Se connecter</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="hover:text-galsen-gold transition-colors cursor-pointer">Email: contact@galsen-invest.sn</li>
                <li className="hover:text-galsen-gold transition-colors cursor-pointer">Tél: +221 XX XXX XX XX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/60">
            © 2026 Galsen Invest. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
